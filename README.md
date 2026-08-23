# 🌿 Juniper Voice Assistant

Juniper is a browser-based voice board for people who benefit from typed and
prepared speech during phone calls. The public application can speak typed
phrases, reuse scripts, and substitute locally entered profile placeholders
through an ElevenLabs voice selected by the user.

## Current release: 6.3.1

The supported application is `index.html`. The older `juniper.html` and
`juniper-v6.2.1.html` files are historical reference builds and are not deployed
as the primary application.

Working features:

- Typed and prepared phrases
- Editable introduction and verification buttons
- Reusable personal and full-call scripts
- Session-only profile, insurance, pharmacy, and history data
- ElevenLabs voice discovery and text-to-speech
- Keyboard-accessible dialogs and responsive mobile layout
- Privacy-minimized Mini Mantis event contract, disabled until Master Mantis has
  an approved endpoint

Intentional previews:

- Scribe and Smart Response do not record, summarize, or answer calls yet.
- AI script generation uses an editable local starter, not a browser-side AI
  provider key.
- Juniper does not place phone calls, transcribe audio, or capture photos.

## Privacy and API keys

New personal, medical, pharmacy, insurance, script, customized-phrase, and
message-history data is kept in `sessionStorage`; it is not encrypted and clears
when the browser session ends. Existing data from earlier releases remains
available for migration until the user chooses **Clear private data now**. Do
not use Juniper on a shared or untrusted device.

The ElevenLabs key is held in JavaScript memory only and is removed on reload.
Releases before 6.3.1 persisted API keys; 6.3.1 removes those old entries during
startup. No Claude/Anthropic key is accepted by the public application.

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

## External setup

1. Create or use an ElevenLabs account.
2. Open **Info → API** and enter the key for the current page load.
3. Open **Voice**, select a voice, and use **Test** before a call.

The application uses the ElevenLabs `eleven_multilingual_v2` model and checks
provider error responses before trying to play audio. Automated tests mock the
provider boundary; a final release check with the owner's real account remains
a manual step.

## Repository structure

```text
index.html                       Supported public application
src/css/                         Application styles
src/js/                          UI, data, voice, scripts, and Mini Mantis client
tests/                           Desktop/mobile smoke and accessibility tests
docs/MINI-MANTIS-INTEGRATION.md  Reporting contract and activation blockers
JUNIPER-ARCHITECTURE.md          Proposed future calling architecture
```

GitHub Actions runs JavaScript syntax validation, desktop/mobile browser smoke
tests, and WCAG 2 A/AA axe checks before the Pages deployment job.

## License

MIT — created with care by Shannon (Nymfarious).
