# Juniper Voice Assistant 6.3.1

## Launch-hardening release

- Repairs the Info, scripts, voice, insurance, and pharmacy flows that drifted
  out of sync during the 6.3.0 refactor.
- Replaces dynamic `innerHTML` rendering with DOM text construction.
- Removes persisted ElevenLabs and Anthropic keys; ElevenLabs is memory-only.
- Moves profile, medical, pharmacy, insurance, and history data to the browser
  session and adds an explicit clear-private-data control.
- Marks Scribe, Smart Response, and server-side AI generation as previews.
- Adds dialog semantics, focus trapping, keyboard restoration, labels, status
  announcements, accessible control names, and contrast corrections.
- Adds provider response validation and uses `eleven_multilingual_v2`.
- Adds privacy-allowlisted Mini Mantis events, disabled until Master Mantis has
  an approved authenticated endpoint.
- Adds Playwright desktop/mobile smoke tests, axe WCAG checks, syntax checks,
  dependency audit, and a deployment quality gate.

## Manual release proof still required

- Confirm voice listing and speech playback with the owner's ElevenLabs account.
- Approve Mini Mantis consent, retention, KNOX sampling, authentication, and
  endpoint policy before reporting is enabled.
- Keep the landing-page label conservative until the production Pages run and
  real-account voice smoke test are green.
