# Juniper public E2E checklist

Juniper's cloud backend is deployed in the dedicated Firebase project
`juniper-voice-assistant-nym`, which is linked to Blaze so second-generation
Functions can run. The public client is live at `juni.nymfarious.com`.

Verified on 2026-08-23: `listVoiceOptions` and `synthesizeVoice` are ACTIVE
Node.js 22 callable Functions in `us-west1`; both use 256 MiB, a 30-second
timeout, and `maxInstances: 1`. The ElevenLabs secret is attached as version 1.
The remaining purpose of this checklist is production voice-path proof, not
initial deployment.

## Cost envelope

- Exactly three Google accounts are allowlisted in `authorizedUsers/{uid}`.
- Functions use `minInstances: 0`, `maxInstances: 1`, 256 MiB, and a 30-second
  timeout. App Check/captcha is intentionally off for the initial three users.
- Speech is limited to 400 characters per request, 500 requests and 100,000
  characters per user per month, and 250,000 characters globally per month.
- Google fallback is restricted to `en-US-Standard-*`; Neural2, WaveNet, Studio,
  and Chirp voices are rejected.
- Device speech remains the final provider and has no cloud cost.

These controls are intentionally far below Google's published Standard voice
free character allowance. They reduce risk but cannot make Blaze an absolute
zero-dollar guarantee: billing alerts do not stop charges, and Firebase notes
that Functions deployments can create small container-storage charges.

## Completed owner-approved setup

1. The default Firestore database uses permanent region `us-west1`.
2. `juniper-voice-assistant-nym` is linked to the intended Blaze billing account.
   Add a very low budget alert and, if the billing account is eligible, a spend
   cap. Confirm no unrelated services are enabled.
3. Cloud Text-to-Speech is enabled; the code retains Standard-only validation.
4. The public Juniper hostname is an authorized Firebase Authentication domain.
   App Check can be reconsidered if public usage materially grows.
5. The ElevenLabs credential is stored as the `ELEVENLABS_API_KEY` Functions secret.
   Scope and cap it in ElevenLabs if that account supports limits.
6. Have each of the three users sign in once, then create
   `authorizedUsers/{uid}` with `{ "enabled": true }`. Do not store profile or
   medical data in these documents.

## Verification before public release

1. Run `npm ci`, `npm ci --prefix functions`, `npm run verify`, and both
   production dependency audits.
2. Start the Firebase emulators and prove: unauthenticated rejection,
   non-allowlisted rejection, allowlisted voice listing, request-length rejection,
   and monthly-limit rejection.
3. Confirm the deployed Functions and Firestore rules match the repository.
4. On the production origin, prove Google sign-in, then play a short ElevenLabs
   phrase.
5. Temporarily make ElevenLabs unavailable and prove the same request returns a
   Google Standard voice. Then make both cloud providers unavailable and prove
   the browser/device voice still speaks.
6. Inspect Firebase/Google usage and billing after the live smoke test. Confirm
   usage counters contain only UID, counts, character totals, and timestamps.
7. Record the three-provider smoke-test result here and confirm the landing-page
   launch link still resolves to the production hostname.

Mini Mantis activation and the full UI/mascot redesign are separate follow-up
changes and are not prerequisites for this voice-backend E2E proof.
