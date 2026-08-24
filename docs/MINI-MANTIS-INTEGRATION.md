# Juniper Mini Mantis integration

Juniper 6.4.0 includes a privacy-minimized Mini Mantis client. Reporting is
disabled in production until Master Mantis provides an authenticated ingestion
endpoint and the data policy is approved.

## Contract

The client emits JSON with this shape:

```json
{
  "schemaVersion": "1.0",
  "appId": "juniper-voice-assistant",
  "appVersion": "6.4.0",
  "sessionId": "random-per-page-load",
  "event": "speech_request",
  "outcome": "ok",
  "occurredAt": "2026-08-23T00:00:00.000Z",
  "details": {}
}
```

Allowed events are `app_loaded`, `app_error`, `speech_request`,
`voice_catalog`, `script_template`, and `private_data_cleared`. Details are
restricted to application version, result count, a coarse error kind, and the
provider name (`elevenlabs`, `google`, or `device`).

The client must never transmit message or script text, names, dates of birth,
addresses, phone numbers, insurance or pharmacy information, API keys, voice
IDs, audio, or device fingerprinting data. Juniper has no camera or photo feed.

## Enabling delivery

Master Mantis must first provide:

1. A documented HTTPS endpoint and versioned schema.
2. Rate limiting and an authentication design suitable for a public static app.
3. Retention, deletion, consent, and KNOX sampling rules.
4. A test environment that does not contain production personal data.

After approval, define `window.JUNIPER_MANTIS_CONFIG` before `mantis.js` loads:

```html
<script>
window.JUNIPER_MANTIS_CONFIG = {
  enabled: true,
  endpoint: "https://approved.example/v1/events",
  sampleRate: 0.1
};
</script>
```

Do not place a secret token in this public configuration. Failed or disabled
delivery keeps at most 50 privacy-safe events in `sessionStorage`; the queue is
cleared when the browser session ends.
