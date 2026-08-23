# 🌿 Juniper Voice Assistant

Juniper is a browser-based voice board for people who benefit from typed and
prepared speech during phone calls. The public application can speak typed
phrases, reuse scripts, and substitute locally entered profile placeholders
through a cloud or built-in device voice selected by the user.

## Current release: 6.4.0

The supported application is `index.html`. The Pages artifact contains only
`index.html` and `src/`; the older `juniper.html` and `juniper-v6.2.1.html`
files remain historical references in the repository and are not published.

Working features:

- Typed and prepared phrases
- Editable introduction and verification buttons
- Reusable personal and full-call scripts
- Session-only profile, insurance, pharmacy, and history data
- Authenticated ElevenLabs text-to-speech with Google Standard and device fallback
- Keyboard-accessible dialogs and responsive mobile layout
- Privacy-minimized Mini Mantis event contract, disabled until Master Mantis has
  an approved endpoint

Intentional previews:

- Scribe and Smart Response do not record, summarize, or answer calls yet.
- AI script generation uses an editable local starter, not a browser-side AI
  provider key.
- Juniper does not place phone calls, transcribe audio, or capture photos.

## Privacy, authentication, and API keys

New personal, medical, pharmacy, insurance, script, customized-phrase, and
message-history data is kept in `sessionStorage`; it is not encrypted and clears
when the browser session ends. Existing data from earlier releases remains
available for migration until the user chooses **Clear private data now**. Do
not use Juniper on a shared or untrusted device.

Cloud voice access uses Firebase Authentication and callable Cloud Functions.
The ElevenLabs key is a backend secret and is never sent to the browser.
Releases before 6.3.1 persisted API keys; current releases remove those old
entries during startup. No Claude/Anthropic key is accepted by the public
application. Firestore client access is denied; the backend alone reads the
three-user allowlist and monthly usage counters.

Cloud synthesis is deliberately bounded to 400 characters per request, 500
requests and 100,000 characters per user per month, and 250,000 characters per
month across the app. Google fallback accepts only `en-US-Standard-*` voices.
The built-in browser/device voice remains available without sign-in or cloud
usage. These application limits reduce exposure but do not guarantee a $0 bill
on a Blaze project.

Mini Mantis events never contain messages, scripts, names, addresses, medical
identifiers, API keys, voice IDs, audio, or device fingerprints. See
[`docs/MINI-MANTIS-INTEGRATION.md`](docs/MINI-MANTIS-INTEGRATION.md).

## Run locally

```bash
npm install
npx playwright install chromium
npm run verify
npm run test:a11y
node tests/server.mjs
```

Open <http://127.0.0.1:4173>.

## Backend development

The dedicated Firebase project is `juniper-voice-assistant-nym`. The repository
contains Functions, Firestore rules, emulator configuration, and a bundled
Firebase browser client. App Check/captcha is intentionally off while usage is
limited to three allowlisted accounts; it can be added later without changing
the voice-provider contract. The project is intentionally not deployed or
linked to billing by this branch.

```bash
npm ci
npm ci --prefix functions
npm run verify
firebase emulators:start
```

The server attempts ElevenLabs `eleven_multilingual_v2`, falls back to Google
Standard text-to-speech, and tells the browser to use its device voice if both
cloud providers fail. See [`docs/PUBLIC-E2E-CHECKLIST.md`](docs/PUBLIC-E2E-CHECKLIST.md)
for the owner-approved setup and release sequence.

## Repository structure

```text
index.html                       Supported public application
src/css/                         Application styles
src/js/                          UI, data, voice, scripts, and Mini Mantis client
tests/                           Desktop/mobile smoke and accessibility tests
functions/                       Authenticated, capped cloud voice backend
docs/MINI-MANTIS-INTEGRATION.md  Reporting contract and activation blockers
docs/PUBLIC-E2E-CHECKLIST.md     Cost-controlled public release gates
JUNIPER-ARCHITECTURE.md          Proposed future calling architecture
```

GitHub Actions installs and audits both dependency trees, runs backend unit
tests, JavaScript validation, desktop/mobile browser smoke tests, and WCAG 2
A/AA axe checks before the Pages deployment job.

## License

MIT — created with care by Shannon (Nymfarious).
