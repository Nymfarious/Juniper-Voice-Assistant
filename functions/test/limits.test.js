const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_LIMITS, checkUsage, loadLimits, monthKey, providerOrder, validateSpeechRequest } = require('../src/limits');

test('validates and normalizes a speech request', () => {
  assert.deepEqual(validateSpeechRequest({
    text: '  Hello Juni  ',
    provider: 'elevenlabs',
    speed: 2,
    googleVoice: 'en-US-Standard-F',
    elevenLabsVoiceId: 'voice_123'
  }), {
    text: 'Hello Juni',
    provider: 'elevenlabs',
    speed: 1.2,
    googleVoice: 'en-US-Standard-F',
    elevenLabsVoiceId: 'voice_123'
  });
});

test('rejects empty and oversized speech requests', () => {
  assert.throws(() => validateSpeechRequest({ text: ' ' }), /required/);
  assert.throws(() => validateSpeechRequest({ text: 'x'.repeat(401) }), /400 characters/);
});

test('allows only Standard Google voices and safe ElevenLabs IDs', () => {
  const request = validateSpeechRequest({
    text: 'Hello',
    googleVoice: 'en-US-Chirp3-HD-Achernar',
    elevenLabsVoiceId: "bad'id"
  });
  assert.equal(request.googleVoice, 'en-US-Standard-C');
  assert.equal(request.elevenLabsVoiceId, '');
});

test('enforces user request, user character, and global character ceilings', () => {
  assert.match(checkUsage({ requests: 500 }, {}, 1), /request limit/);
  assert.match(checkUsage({ requests: 2, characters: 99999 }, {}, 2), /personal character/);
  assert.match(checkUsage({}, { characters: 249999 }, 2), /monthly character/);
  assert.equal(checkUsage({ requests: 2, characters: 100 }, { characters: 100 }, 20), '');
});

test('loads positive limit overrides and ignores unsafe values', () => {
  assert.deepEqual(loadLimits({
    JUNIPER_MAX_TEXT_LENGTH: '250',
    JUNIPER_MONTHLY_USER_REQUEST_LIMIT: '-1'
  }), {
    maxTextLength: 250,
    monthlyUserRequests: DEFAULT_LIMITS.monthlyUserRequests,
    monthlyUserCharacters: DEFAULT_LIMITS.monthlyUserCharacters,
    monthlyGlobalCharacters: DEFAULT_LIMITS.monthlyGlobalCharacters
  });
});

test('uses a stable UTC month key', () => {
  assert.equal(monthKey(new Date('2026-08-31T23:59:59Z')), '2026-08');
});

test('orders ElevenLabs before Google while allowing a Google-only request', () => {
  assert.deepEqual(providerOrder('auto'), ['elevenlabs', 'google']);
  assert.deepEqual(providerOrder('elevenlabs'), ['elevenlabs', 'google']);
  assert.deepEqual(providerOrder('google'), ['google']);
});
