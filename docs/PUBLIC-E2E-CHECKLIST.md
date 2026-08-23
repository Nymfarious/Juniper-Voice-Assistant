# Juniper public E2E checklist

Juniper's cloud backend is prepared but not deployed. The dedicated project is
`juniper-voice-assistant-nym` and remains on Spark. Nothing in this checklist
authorizes billing linkage or deployment; each external change should be made
only after Shannon approves it.

## Cost envelope

- Exactly three Google accounts are allowlisted in `authorizedUsers/{uid}`.
- Functions use `minInstances: 0`, `maxInstances: 1`, 256 MiB, a 30-second
  timeout, and App Check outside the emulator.
- Speech is limited to 400 characters per request, 500 requests and 100,000
  characters per user per month, and 250,000 characters globally per month.
- Google fallback is restricted to `en-US-Standard-*`; Neural2, WaveNet, Studio,
  and Chirp voices are rejected.
- Device speech remains the final provider and has no cloud cost.

These controls are intentionally far below Google's published Standard voice
free character allowance. They reduce risk but cannot make Blaze an absolute
zero-dollar guarantee: billing alerts do not stop charges, and Firebase notes
that Functions deployments can create small container-storage charges.

## Owner-approved setup

1. Approve creation of the default Firestore database in permanent region
   `us-west1`.
2. Link only `juniper-voice-assistant-nym` to the intended Blaze billing account.
   Add a very low budget alert and, if the billing account is eligible, a spend
   cap. Confirm no unrelated services are enabled.
3. Enable Cloud Text-to-Speech. Keep the code's Standard-only voice validation.
4. Create a reCAPTCHA Enterprise App Check key for the public Juniper hostname,
   put its public site key in the HTML meta tag, and register the same hostname
   as an authorized Firebase Authentication domain.
5. Store the ElevenLabs credential as the `ELEVENLABS_API_KEY` Functions secret.
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
3. Deploy Functions and Firestore rules only after the setup above is complete.
   Do not deploy the public page yet.
4. On a temporary approved origin, prove Google sign-in and App Check, then play
   a short ElevenLabs phrase.
5. Temporarily make ElevenLabs unavailable and prove the same request returns a
   Google Standard voice. Then make both cloud providers unavailable and prove
   the browser/device voice still speaks.
6. Inspect Firebase/Google usage and billing after the live smoke test. Confirm
   usage counters contain only UID, counts, character totals, and timestamps.
7. Merge the public client only after all checks are green; then run the same
   three-provider smoke test on the final Pages hostname before adding Juniper
   to the landing page.

Mini Mantis activation and the full UI/mascot redesign are separate follow-up
changes and are not prerequisites for this voice-backend E2E proof.
