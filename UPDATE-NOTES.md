# Juniper Voice Assistant 6.4.0

## Launch-hardening release

- Repairs the Info, scripts, voice, insurance, and pharmacy flows that drifted
  out of sync during the 6.3.0 refactor.
- Replaces dynamic `innerHTML` rendering with DOM text construction.
- Moves ElevenLabs credentials to a Firebase Secret Manager backend; no provider
  key is accepted by or delivered to the browser.
- Adds Google Standard text-to-speech and built-in device speech as ordered
  fallbacks after ElevenLabs.
- Adds Google sign-in, a three-user Firestore allowlist, deny-by-default client
  rules, and per-user/global monthly usage ceilings. App Check remains off by
  owner choice while the audience is limited.
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

## Public E2E gates still required

- Approve the permanent `us-west1` Firestore location and create the database.
- Explicitly link the dedicated Firebase project to Blaze, enable Text-to-Speech,
  configure the ElevenLabs secret, and set billing alerts/caps.
- Add the three authorized users and prove ElevenLabs → Google → device fallback
  in the emulator and public origin before listing Juniper as launchable.
- Approve Mini Mantis consent, retention, KNOX sampling, authentication, and
  endpoint policy before reporting is enabled.
- Keep the landing-page label conservative until the production Pages run and
  real-account voice smoke test are green.
