const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { defineSecret } = require('firebase-functions/params');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { checkUsage, loadLimits, monthKey, providerOrder, validateSpeechRequest } = require('./limits');

initializeApp();

const db = getFirestore();
const googleTts = new TextToSpeechClient();
const elevenLabsApiKey = defineSecret('ELEVENLABS_API_KEY');
const limits = loadLimits();
const callableOptions = {
  region: process.env.JUNIPER_REGION || 'us-west1',
  memory: '256MiB',
  timeoutSeconds: 30,
  minInstances: 0,
  maxInstances: 1,
  concurrency: 8,
  // Intentionally disabled while Juniper has only three approved users.
  // Authentication, the Firestore allowlist, and usage ceilings remain active.
  enforceAppCheck: false,
  secrets: [elevenLabsApiKey]
};

async function requireAuthorizedUser(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to use Juniper voices.');
  const membership = await db.doc(`authorizedUsers/${request.auth.uid}`).get();
  if (!membership.exists || membership.get('enabled') !== true) {
    throw new HttpsError('permission-denied', 'This account is not enabled for Juniper.');
  }
  return request.auth.uid;
}

async function reserveUsage(uid, characters) {
  const month = monthKey();
  const userRef = db.doc(`usage/${month}/users/${uid}`);
  const globalRef = db.doc(`usageGlobal/${month}`);
  await db.runTransaction(async transaction => {
    const [userSnapshot, globalSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(globalRef)
    ]);
    const userUsage = userSnapshot.data() || {};
    const globalUsage = globalSnapshot.data() || {};
    const rejection = checkUsage(userUsage, globalUsage, characters, limits);
    if (rejection) throw new HttpsError('resource-exhausted', rejection);
    transaction.set(userRef, {
      requests: FieldValue.increment(1),
      characters: FieldValue.increment(characters),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    transaction.set(globalRef, {
      requests: FieldValue.increment(1),
      characters: FieldValue.increment(characters),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });
}

function elevenLabsKey() {
  try {
    return elevenLabsApiKey.value().trim();
  } catch {
    return '';
  }
}

async function fetchElevenLabsVoices(apiKey) {
  if (!apiKey) return [];
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey }
  });
  if (!response.ok) throw new Error(`ElevenLabs voice request failed (${response.status}).`);
  const data = await response.json();
  return (data.voices || []).slice(0, 100).map(voice => ({
    provider: 'elevenlabs',
    id: voice.voice_id,
    name: voice.name,
    languageCodes: [],
    tier: 'custom'
  }));
}

async function fetchGoogleVoices() {
  const [response] = await googleTts.listVoices({ languageCode: 'en-US' });
  return (response.voices || [])
    .filter(voice => /-Standard-[A-Z]$/.test(voice.name || ''))
    .map(voice => ({
      provider: 'google',
      id: voice.name,
      name: voice.name,
      gender: (voice.ssmlGender || '').toLowerCase(),
      languageCodes: voice.languageCodes || [],
      tier: 'standard'
    }));
}

exports.listVoiceOptions = onCall(callableOptions, async request => {
  const uid = await requireAuthorizedUser(request);
  await reserveUsage(uid, 0);
  const [googleResult, elevenLabsResult] = await Promise.allSettled([
    fetchGoogleVoices(),
    fetchElevenLabsVoices(elevenLabsKey())
  ]);
  const googleVoices = googleResult.status === 'fulfilled' ? googleResult.value : [];
  const elevenLabsVoices = elevenLabsResult.status === 'fulfilled' ? elevenLabsResult.value : [];
  if (!googleVoices.length && !elevenLabsVoices.length) {
    throw new HttpsError('unavailable', 'No cloud voice provider is currently available.');
  }
  return { voices: [...elevenLabsVoices, ...googleVoices] };
});

async function synthesizeElevenLabs(request, apiKey) {
  if (!apiKey || !request.elevenLabsVoiceId) throw new Error('ElevenLabs is not configured.');
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(request.elevenLabsVoiceId)}`, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: request.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  });
  if (!response.ok) throw new Error(`ElevenLabs synthesis failed (${response.status}).`);
  return Buffer.from(await response.arrayBuffer()).toString('base64');
}

async function synthesizeGoogle(request) {
  const [response] = await googleTts.synthesizeSpeech({
    input: { text: request.text },
    voice: { languageCode: 'en-US', name: request.googleVoice },
    audioConfig: { audioEncoding: 'MP3', speakingRate: request.speed }
  });
  if (!response.audioContent) throw new Error('Google returned no audio.');
  return Buffer.from(response.audioContent).toString('base64');
}

exports.synthesizeVoice = onCall(callableOptions, async request => {
  const uid = await requireAuthorizedUser(request);
  let speech;
  try {
    speech = validateSpeechRequest(request.data, limits);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }
  await reserveUsage(uid, speech.text.length);

  const providers = providerOrder(speech.provider);
  const providerErrors = [];
  if (providers.includes('elevenlabs')) {
    try {
      const audioBase64 = await synthesizeElevenLabs(speech, elevenLabsKey());
      return { provider: 'elevenlabs', audioBase64, contentType: 'audio/mpeg' };
    } catch (error) {
      providerErrors.push(error.message);
    }
  }

  try {
    const audioBase64 = await synthesizeGoogle(speech);
    return { provider: 'google', audioBase64, contentType: 'audio/mpeg', fallbackFrom: providerErrors.length ? 'elevenlabs' : '' };
  } catch (error) {
    providerErrors.push(error.message);
    throw new HttpsError('unavailable', 'Cloud voices are unavailable; use the device voice fallback.', {
      providersAttempted: providers
    });
  }
});
