// Mini Mantis client for Juniper.
// It never includes message text, names, addresses, medical identifiers, API
// keys, or audio. Delivery is disabled until Master Mantis exposes an approved
// authenticated ingestion endpoint.
const MiniMantis = (() => {
  const schemaVersion = '1.0';
  const queueKey = 'juniperMiniMantisQueue';
  const allowedEvents = new Set([
    'app_loaded',
    'app_error',
    'speech_request',
    'voice_catalog',
    'script_template',
    'private_data_cleared'
  ]);
  const allowedOutcomes = new Set(['started', 'ok', 'error']);
  const allowedDetailKeys = new Set(['version', 'resultCount', 'errorKind']);
  const config = Object.freeze({
    enabled: false,
    endpoint: '',
    sampleRate: 1,
    ...(window.JUNIPER_MANTIS_CONFIG || {})
  });
  const sessionId = crypto.randomUUID();

  function safeDetails(details) {
    return Object.fromEntries(Object.entries(details || {})
      .filter(([key, value]) => allowedDetailKeys.has(key) && ['string', 'number', 'boolean'].includes(typeof value)));
  }

  function makePayload(event, outcome, details) {
    return {
      schemaVersion,
      appId: 'juniper-voice-assistant',
      appVersion: '6.3.1',
      sessionId,
      event,
      outcome,
      occurredAt: new Date().toISOString(),
      details: safeDetails(details)
    };
  }

  function queue(payload) {
    const existing = readStoredJson(sessionStorage, queueKey, []);
    sessionStorage.setItem(queueKey, JSON.stringify([...existing.slice(-49), payload]));
  }

  async function deliver(payload) {
    if (!config.enabled || !config.endpoint) {
      queue(payload);
      return;
    }
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
      if (!response.ok) queue(payload);
    } catch {
      queue(payload);
    }
  }

  function report(event, outcome, details = {}) {
    if (!allowedEvents.has(event) || !allowedOutcomes.has(outcome)) return;
    if (Math.random() > config.sampleRate) return;
    void deliver(makePayload(event, outcome, details));
  }

  return Object.freeze({ report });
})();

window.addEventListener('error', () => MiniMantis.report('app_error', 'error', { errorKind: 'runtime' }));
window.addEventListener('unhandledrejection', () => MiniMantis.report('app_error', 'error', { errorKind: 'promise' }));
