// Juniper v6.4.0 - Speech & Voice

const DEVICE_VOICE = Object.freeze({
  id: 'device-default',
  provider: 'device',
  name: 'Device voice',
  gender: '',
  accent: 'built in'
});

function setStatus(status, text) {
  document.getElementById('statusDot').className = 'status-dot ' + status;
  document.getElementById('statusText').textContent = text;
}

function resetTestButton() {
  if (!state.isTesting) return;
  document.getElementById('testBtn').textContent = '🔊 Test selected voice';
  document.getElementById('testBtn').classList.remove('stop-mode');
  state.isTesting = false;
}

function completeSpeech(text, isTest, provider) {
  setStatus('ready', `Ready · ${provider}`);
  MiniMantis.report('speech_request', 'ok', { provider });
  if (!isTest) addHistory(text);
  resetTestButton();
}

function base64Audio(base64, contentType) {
  const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
  return new Blob([bytes], { type: contentType || 'audio/mpeg' });
}

async function playCloudAudio(result, text, isTest) {
  const blob = base64Audio(result.audioBase64, result.contentType);
  const audioUrl = URL.createObjectURL(blob);
  state.currentAudio = new Audio(audioUrl);
  state.currentAudio.playbackRate = state.speechSpeed;
  state.currentAudio.volume = state.speechVolume;
  state.currentAudio.onplay = () => setStatus('speaking', `Speaking · ${result.provider}`);
  state.currentAudio.onended = () => {
    URL.revokeObjectURL(audioUrl);
    state.currentAudio = null;
    completeSpeech(text, isTest, result.provider);
  };
  state.currentAudio.onerror = () => {
    URL.revokeObjectURL(audioUrl);
    state.currentAudio = null;
    speakWithDeviceVoice(text, isTest);
  };
  await state.currentAudio.play();
}

function speakWithDeviceVoice(text, isTest = false) {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    setStatus('error', 'No voice provider is available');
    resetTestButton();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = state.speechSpeed;
  utterance.volume = state.speechVolume;
  utterance.onstart = () => setStatus('speaking', 'Speaking · device');
  utterance.onend = () => {
    state.currentUtterance = null;
    completeSpeech(text, isTest, 'device');
  };
  utterance.onerror = () => {
    state.currentUtterance = null;
    setStatus('error', 'Device voice failed');
    resetTestButton();
  };
  state.currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

async function speak(text, isTest = false) {
  if (!state.selectedVoiceId) selectVoice('device-default', 'device');
  stopSpeaking();
  setStatus('loading', 'Preparing voice…');
  MiniMantis.report('speech_request', 'started');

  if (state.selectedVoiceProvider === 'device' || !window.JuniperBackend?.synthesize) {
    speakWithDeviceVoice(text, isTest);
    return;
  }

  try {
    const result = await window.JuniperBackend.synthesize({
      text,
      provider: state.selectedVoiceProvider,
      elevenLabsVoiceId: state.selectedVoiceProvider === 'elevenlabs' ? state.selectedVoiceId : '',
      googleVoice: state.selectedVoiceProvider === 'google' ? state.selectedVoiceId : 'en-US-Standard-C',
      speed: state.speechSpeed
    });
    await playCloudAudio(result, text, isTest);
  } catch (error) {
    console.warn('Cloud voices unavailable; using device voice.', error);
    MiniMantis.report('speech_request', 'error', { errorKind: 'provider_request' });
    speakWithDeviceVoice(text, isTest);
  }
}

function stopSpeaking() {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  state.currentUtterance = null;
  setStatus('ready', 'Ready');
}

function speakCustom() {
  const text = document.getElementById('customText').value.trim();
  if (text) {
    speak(text);
    document.getElementById('customText').value = '';
  }
}

function speakIntro() {
  speak(replacePlaceholders(state.introText));
}

function speakVerify() {
  speak(replacePlaceholders(state.verifyText));
}

function speakInfo(type) {
  const primary = state.insurances.find(insurance => insurance.type === 'Medical') || state.insurances[0];
  const pharmacy = state.pharmacies.find(item => item.primary) || state.pharmacies[0];
  const phrases = {
    name: `The name is ${getFullName()}.`,
    dob: `Date of birth is ${state.info.dob || 'not set'}.`,
    phone: `Phone is ${state.info.phone || 'not set'}.`,
    address: `Address is ${getFullAddress()}.`,
    insurance: primary
      ? `Insurance is ${primary.provider}, ID ${primary.memberId}${primary.group ? `, Group ${primary.group}` : ''}.`
      : 'Insurance not set.',
    pharmacy: pharmacy
      ? `Pharmacy is ${pharmacy.name}${pharmacy.phone ? ` at ${pharmacy.phone}` : ''}.`
      : 'Pharmacy not set.'
  };
  speak(phrases[type]);
}

async function loadVoices() {
  const deviceVoice = { ...DEVICE_VOICE };
  try {
    await window.JuniperBackend?.ready;
    const user = window.JuniperBackend?.currentUser?.();
    if (!user) throw new Error('Sign in for ElevenLabs and Google voices.');
    const result = await window.JuniperBackend.listVoices();
    if (!Array.isArray(result.voices)) throw new Error('Voice backend returned an invalid response.');
    const cloudVoices = result.voices.map(voice => ({
      id: voice.id,
      provider: voice.provider,
      name: voice.name,
      gender: (voice.gender || '').toLowerCase(),
      accent: voice.provider === 'google' ? 'google standard' : 'custom'
    }));
    state.specialVoices = [];
    state.allVoices = [deviceVoice, ...cloudVoices.sort((a, b) => a.name.localeCompare(b.name))];
    setStatus('ready', 'Cloud voices ready');
    const accessMessage = document.getElementById('voiceAccessMessage');
    if (accessMessage) accessMessage.textContent = 'Cloud voices ready · Device voice remains available';
    MiniMantis.report('voice_catalog', 'ok', { resultCount: cloudVoices.length });
  } catch (error) {
    state.specialVoices = [];
    state.allVoices = [deviceVoice];
    setStatus('ready', 'Device voice available');
    const accessMessage = document.getElementById('voiceAccessMessage');
    if (accessMessage && window.JuniperBackend?.currentUser?.()) {
      accessMessage.textContent = 'Signed in · Cloud voice access unavailable';
    }
    MiniMantis.report('voice_catalog', 'error', { errorKind: 'provider_request' });
    console.warn(error.message || error);
  }
  filterVoices('all', document.querySelector('.filter-btn'));
  if (!state.allVoices.some(voice => voice.id === state.selectedVoiceId && voice.provider === state.selectedVoiceProvider)) {
    selectVoice('device-default', 'device');
  }
}

function filterVoices(filter, button) {
  document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  if (filter === 'all') state.filteredVoices = state.allVoices;
  else state.filteredVoices = state.allVoices.filter(voice => voice.provider === filter);
  renderVoices();
}

function voiceProviderLabel(provider) {
  if (provider === 'elevenlabs') return 'Custom · ElevenLabs';
  if (provider === 'google') return 'Google Standard';
  return 'On this device';
}

function renderVoices() {
  const grid = document.getElementById('voiceGrid');
  document.getElementById('voiceCount').textContent = `${state.filteredVoices.length} voices`;
  replaceChildrenWith(grid, state.filteredVoices.length
    ? state.filteredVoices.map(voice => makeVoiceButton(voice, false))
    : [createElement('div', { className: 'loading-msg', text: 'None' })]);
}

function makeVoiceButton(voice, special) {
  const selected = voice.id === state.selectedVoiceId && voice.provider === state.selectedVoiceProvider;
  const button = createElement('button', {
    className: `${special ? 'special-voice' : 'voice-card'}${selected ? ' selected' : ''}`,
    type: 'button',
    ariaLabel: `Select ${voice.name} voice`
  }, [
    createElement('span', { className: 'voice-card-mark', ariaHidden: 'true' }),
    createElement('span', { className: 'voice-card-copy' }, [
      createElement('span', { className: 'voice-name', text: voice.name }),
      createElement('span', { className: 'voice-meta', text: voiceProviderLabel(voice.provider) })
    ])
  ]);
  button.dataset.voiceId = voice.id;
  button.dataset.voiceProvider = voice.provider;
  button.setAttribute('aria-pressed', String(selected));
  button.addEventListener('click', () => selectVoice(voice.id, voice.provider));
  return button;
}

function selectVoice(id, provider) {
  const selected = [...state.specialVoices, ...state.allVoices].find(voice => voice.id === id && (!provider || voice.provider === provider));
  state.selectedVoiceId = id;
  state.selectedVoiceProvider = provider || selected?.provider || 'device';
  localStorage.setItem('juniperVoiceId', state.selectedVoiceId);
  localStorage.setItem('juniperVoiceProvider', state.selectedVoiceProvider);
  document.querySelectorAll('.voice-card, .special-voice').forEach(card => {
    const active = card.dataset.voiceId === state.selectedVoiceId && card.dataset.voiceProvider === state.selectedVoiceProvider;
    card.classList.toggle('selected', active);
    card.setAttribute('aria-pressed', String(active));
  });
  const summary = document.getElementById('selectedVoiceSummary');
  if (summary) summary.textContent = `${selected?.name || 'Device voice'} · ${voiceProviderLabel(state.selectedVoiceProvider)}`;
  document.getElementById('testBtn').disabled = false;
}

function toggleTest() {
  if (state.isTesting) {
    stopSpeaking();
    resetTestButton();
    return;
  }
  state.isTesting = true;
  document.getElementById('testBtn').textContent = '⏹ Stop voice';
  document.getElementById('testBtn').classList.add('stop-mode');
  speak("Hello! I'm Juniper.", true);
}
