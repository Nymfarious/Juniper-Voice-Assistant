const DEFAULT_LIMITS = Object.freeze({
  maxTextLength: 400,
  monthlyUserRequests: 500,
  monthlyUserCharacters: 100000,
  monthlyGlobalCharacters: 250000
});

const GOOGLE_STANDARD_VOICE = /^[a-z]{2,3}-[A-Z]{2}-Standard-[A-Z]$/;

function integerSetting(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadLimits(environment = process.env) {
  return Object.freeze({
    maxTextLength: integerSetting(environment.JUNIPER_MAX_TEXT_LENGTH, DEFAULT_LIMITS.maxTextLength),
    monthlyUserRequests: integerSetting(environment.JUNIPER_MONTHLY_USER_REQUEST_LIMIT, DEFAULT_LIMITS.monthlyUserRequests),
    monthlyUserCharacters: integerSetting(environment.JUNIPER_MONTHLY_USER_CHARACTER_LIMIT, DEFAULT_LIMITS.monthlyUserCharacters),
    monthlyGlobalCharacters: integerSetting(environment.JUNIPER_MONTHLY_GLOBAL_CHARACTER_LIMIT, DEFAULT_LIMITS.monthlyGlobalCharacters)
  });
}

function validateSpeechRequest(data, limits = DEFAULT_LIMITS) {
  const text = typeof data?.text === 'string' ? data.text.trim() : '';
  if (!text) throw new Error('Text is required.');
  if (text.length > limits.maxTextLength) throw new Error(`Text is limited to ${limits.maxTextLength} characters.`);

  const provider = ['auto', 'elevenlabs', 'google'].includes(data?.provider) ? data.provider : 'auto';
  const speed = Math.min(1.2, Math.max(0.8, Number(data?.speed) || 1));
  const googleVoice = GOOGLE_STANDARD_VOICE.test(data?.googleVoice || '') ? data.googleVoice : 'en-US-Standard-C';
  const elevenLabsVoiceId = typeof data?.elevenLabsVoiceId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(data.elevenLabsVoiceId)
    ? data.elevenLabsVoiceId
    : '';

  return { text, provider, speed, googleVoice, elevenLabsVoiceId };
}

function checkUsage(userUsage, globalUsage, addedCharacters, limits = DEFAULT_LIMITS) {
  if ((userUsage.requests || 0) + 1 > limits.monthlyUserRequests) return 'Monthly request limit reached.';
  if ((userUsage.characters || 0) + addedCharacters > limits.monthlyUserCharacters) return 'Monthly personal character limit reached.';
  if ((globalUsage.characters || 0) + addedCharacters > limits.monthlyGlobalCharacters) return 'Juniper monthly character limit reached.';
  return '';
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function providerOrder(provider) {
  return provider === 'google' ? ['google'] : ['elevenlabs', 'google'];
}

module.exports = {
  DEFAULT_LIMITS,
  checkUsage,
  loadLimits,
  monthKey,
  providerOrder,
  validateSpeechRequest
};
