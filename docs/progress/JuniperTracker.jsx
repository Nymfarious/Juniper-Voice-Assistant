import { useState, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// JUNIPER VOICE ASSISTANT — PROGRESS TRACKER
// Grounded in Juniper-Voice-Assistant-main @ v6.3.0 (5,736 lines / 24 files).
//
// STORAGE v2 (same contract as master-devtools-tracker):
//   { taskId: null | "legacy" | "2026-07-26T14:32:00.000Z" }
//   null     = not done
//   "legacy" = true before timestamp tracking existed (baseline)
//   ISO      = completed at this exact moment
//
// Every task below points at a real file, line, or documented promise.
// Nothing here is invented.
// ═══════════════════════════════════════════════════════════════════════════════

const P = {
  bg: "#080D09", card: "#0E150F", border: "#1B291D",
  text: "#E2EEE3", muted: "#748A76", dim: "#41533F",
  green: "#5FBE72", pine: "#2F7D4A", berry: "#8B8FE0",
  amber: "#E0A33E", red: "#E5484D", cyan: "#4FC3D9",
  rose: "#E8879B", cream: "#EFE6CE",
};

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const TC = {
  BUG: "#E5484D", CORS: "#E5484D", PHI: "#E5484D", KEYS: "#E5484D",
  DRIFT: "#E0A33E", THEATER: "#E0A33E", CALL: "#E0A33E",
  A11Y: "#8B8FE0", WCAG: "#8B8FE0",
  XSS: "#E8879B", ARCH: "#4FC3D9", TWILIO: "#4FC3D9", WHISPER: "#4FC3D9",
  ROBIN: "#5FBE72", UX: "#5FBE72", DEVTOOLS: "#8B8FE0",
  NYM: "#EFE6CE", DOCS: "#748A76", SHIP: "#2F7D4A",
};

// ═══════════════════════════════════════════════════════════════════════════════
const PHASES = [
  {
    id: "broken", label: "Broken Right Now", emoji: "🔴", color: "#E5484D",
    note: "Found by reading the source, not the roadmap. These are live defects in v6.3.0.",
    tasks: [
      { id: "b01", label: "scripts.js generateScriptAI() — missing 'anthropic-dangerous-direct-browser-access: true' header. Anthropic returns 401 on browser CORS without it, so ✨ Generate with AI is dead in every browser today", tag: "CORS" },
      { id: "b02", label: "scripts.js — data.content[0].text is read with no error branch. An API error object throws TypeError; Robin sees the textarea stuck on 'Generating...'", tag: "BUG" },
      { id: "b03", label: "helpers.js:66 updateHeaderName() still writes \"'s AI Voice Assistant\". The v6.3.0 de-AI pass missed it, and init() overwrites the corrected HTML on every single load", tag: "BUG" },
      { id: "b04", label: "speech.js speak() — no response.ok check before .blob(). A 401/429 becomes a JSON blob handed to <audio>: silence, status stays 'Speaking...', no error shown", tag: "BUG" },
      { id: "b05", label: "speech.js stopSpeaking() never calls URL.revokeObjectURL() — every phrase leaks a blob URL for the life of the tab", tag: "BUG" },
      { id: "b06", label: "speech.js selectVoice() matches with c.onclick?.toString().includes(id) — string-matching function source to find a DOM node. Breaks silently under any minifier", tag: "BUG" },
      { id: "b07", label: "Claude model string pinned to 'claude-sonnet-4-20250514' — verify against the current model list before shipping", tag: "DRIFT" },
      { id: "b08", label: "desktop.ini committed at repo root (Windows Explorer artifact) — delete and add to .gitignore", tag: "DRIFT" },
      { id: "b09", label: "Version headers drifted: 8 of 10 src files still say v6.2.1. UPDATE-NOTES.md claims 'All CSS comments updated' and 'All JS comments updated' — only app.js and styles.css were", tag: "DRIFT" },
      { id: "b10", label: "agents.css header still reads 'AI Agents Modal Styles' after the de-AI rename to Smart Features", tag: "DRIFT" },
      { id: "b11", label: "pages.yml uploads path '.' — the whole repo ships to public Pages: architecture docs, DevTools map, Screenshot.png, and the legacy single-file build", tag: "SHIP" },
      { id: "b12", label: "Two live source-of-truth copies: index.html (384 ln) and juniper-v6.2.1.html (654 ln). Pick one; archive or delete the other", tag: "DRIFT" },
    ]
  },
  {
    id: "theater", label: "Features That Look Real But Aren't", emoji: "🎭", color: "#E0A33E",
    note: "The README sells these. The code doesn't implement them. Either build them or label them.",
    tasks: [
      { id: "t01", label: "ui.js toggleSetting() only flips a CSS class — no localStorage write, no consumer reads it. Every Smart Features toggle is decoration", tag: "THEATER" },
      { id: "t02", label: "Scribe 'Auto-summarize' (#toggleSum) — no summarization code exists anywhere in src/", tag: "THEATER" },
      { id: "t03", label: "Scribe 'Extract key info' (#toggleExt) — no extraction code exists", tag: "THEATER" },
      { id: "t04", label: "Smart Response 'Enable' (#toggleAuto) — no auto-response code exists", tag: "THEATER" },
      { id: "t05", label: "All three toggles ship with class='toggle-switch active' — the UI asserts these features are currently ON", tag: "THEATER" },
      { id: "t06", label: "README lists 'AI Agents - Scribe (call summaries) and Smart Response (auto-answers)' under Features, presented as shipped", tag: "DOCS" },
      { id: "t07", label: "DECISION: build Scribe for real, or gate the modal behind a 'Coming Soon' state. Shipping fake toggles to a user who depends on this app is the worst of the three options", tag: "THEATER" },
      { id: "t08", label: "If building: Scribe needs a transcript source, which does not exist until Twilio/Whisper lands. Sequence it after Phase 7, not before", tag: "ARCH" },
      { id: "t09", label: "toggleSetting() should persist to localStorage and read back on init() even for stub features, so state survives reload", tag: "THEATER" },
    ]
  },
  {
    id: "privacy", label: "Privacy — Real Medical Data, Plaintext, Public Host", emoji: "🔐", color: "#E5484D",
    note: "This app holds one specific person's DOB, address, insurance member ID and Rx BIN/PCN. Highest-stakes phase in the repo.",
    tasks: [
      { id: "p01", label: "JUNIPER-ARCHITECTURE.md claims 'API keys stored securely (encrypted)'. helpers.js writes them via localStorage.setItem in plaintext. Fix the code or fix the doc — do not ship the mismatch", tag: "PHI" },
      { id: "p02", label: "ElevenLabs key in localStorage['juniperApiKey'] plaintext — readable by any script on the origin and by anyone with the device", tag: "KEYS" },
      { id: "p03", label: "Claude key in localStorage['juniperClaudeKey'] plaintext — same exposure, and it's a billable key", tag: "KEYS" },
      { id: "p04", label: "localStorage['juniperInfo'] holds full name, DOB, phone, and street address in plaintext", tag: "PHI" },
      { id: "p05", label: "localStorage['juniperInsurances'] holds member ID, group number, Rx BIN and Rx PCN — enough for pharmacy benefit fraud", tag: "PHI" },
      { id: "p06", label: "localStorage['juniperHistory'] retains the last 20 spoken phrases, which by design include DOB and insurance ID read aloud from speakInfo()", tag: "PHI" },
      { id: "p07", label: "No Clear All Data control anywhere in the UI. clearHistory() covers history only", tag: "PHI" },
      { id: "p08", label: "Write a one-page threat model: single user, own device, no server, no auth, shared-household risk. Name what is and isn't defended", tag: "DOCS" },
      { id: "p09", label: "DECIDE encryption posture: WebCrypto + passphrase on unlock, vs. accept plaintext and document it plainly. Half-measures here are worse than an honest README line", tag: "PHI" },
      { id: "p10", label: "ARCHITECTURE.md specifies a guardrail — never auto-speak SSN, card numbers, PINs; say 'I'll let Robin verify that directly.' No such guard exists in speech.js", tag: "PHI" },
      { id: "p11", label: "Audit Screenshot.png before it ships to public Pages — confirm no real DOB, member ID, or address is visible", tag: "SHIP" },
      { id: "p12", label: "Confirm no personal data has ever been committed: scan full git history, not just HEAD", tag: "SHIP" },
      { id: "p13", label: "Session timeout / re-lock on an idle shared tablet", tag: "PHI" },
      { id: "p14", label: "Export + import of user data, so a device swap doesn't mean re-entering everything by hand — which for Robin is the exact task the app exists to avoid", tag: "UX" },
    ]
  },
  {
    id: "a11y", label: "Accessibility", emoji: "♿", color: "#8B8FE0",
    note: "grep for aria- and role= in index.html returns 0 matches. This is an accessibility app.",
    tasks: [
      { id: "a01", label: "Zero aria-* and zero role= attributes across all 384 lines of index.html — measured, not estimated", tag: "A11Y" },
      { id: "a02", label: "Modals lack role='dialog' and aria-modal='true' — screen readers announce nothing on open", tag: "A11Y" },
      { id: "a03", label: "No focus trap in any modal; Tab escapes to the page behind it", tag: "A11Y" },
      { id: "a04", label: "Focus never moves into a modal on open, nor returns to the trigger on close", tag: "A11Y" },
      { id: "a05", label: "No Escape-to-close on any of the 7 modals", tag: "A11Y" },
      { id: "a06", label: "Toggle switches are bare <button> with no aria-pressed — state is conveyed by colour alone", tag: "WCAG" },
      { id: "a07", label: "Status dot + status text need aria-live='polite' so 'Speaking…' is announced, not just seen", tag: "A11Y" },
      { id: "a08", label: "Icon-only buttons (✏️ 🗑️ ▶️ ✕ ×) carry no accessible name — screen reader reads the emoji's Unicode name or nothing", tag: "A11Y" },
      { id: "a09", label: "Hotkeys use emoji as the primary semantic carrier; verify each has a visible text label too", tag: "A11Y" },
      { id: "a10", label: "Tap-target audit at 44×44 CSS px minimum. Hotkey buttons got min-height:72px in v6.3.0 — verify toolbar, tabs, filter chips, and delete buttons match", tag: "WCAG" },
      { id: "a11", label: "Contrast audit of the forest palette against WCAG AA (4.5:1 body, 3:1 large). --text-muted on card background is the likely failure", tag: "WCAG" },
      { id: "a12", label: "Full keyboard pass — only #customText has a key binding (Enter → speakCustom). Tab order through modals is untested", tag: "A11Y" },
      { id: "a13", label: "Test with a real screen reader: VoiceOver on iPad is the highest-value target given the two-device workflow", tag: "A11Y" },
      { id: "a14", label: "Support 200% text scaling without layout breakage", tag: "WCAG" },
      { id: "a15", label: "Honour prefers-reduced-motion", tag: "WCAG" },
      { id: "a16", label: "High-contrast theme variant — thiamine-related conditions can affect vision as well as speech", tag: "WCAG" },
      { id: "a17", label: "Motor-difficulty guard: confirm-on-delete or undo. deleteMyScript / deleteInsurance / deletePharmacy / deleteFullScript all fire instantly on a single tap", tag: "UX" },
    ]
  },
  {
    id: "resilience", label: "Failure Handling Mid-Call", emoji: "📞", color: "#E0A33E",
    note: "Every failure here happens while a receptionist is waiting on the line. Timing is the whole problem.",
    tasks: [
      { id: "r01", label: "alert() is the only error channel (7 call sites). A blocking modal mid-call is the single worst possible failure UX — replace all with inline status", tag: "CALL" },
      { id: "r02", label: "No handling for ElevenLabs 429 / quota exhausted — free tier is 10,000 chars per month and the app gives no warning as it approaches", tag: "CALL" },
      { id: "r03", label: "Character budget meter in the UI, so the quota wall is visible before it's hit", tag: "CALL" },
      { id: "r04", label: "No offline / network-down detection before a call starts", tag: "CALL" },
      { id: "r05", label: "No retry on transient TTS failure — one flaky request means dead air", tag: "CALL" },
      { id: "r06", label: "Status vocabulary is only ready/loading/speaking/error — add distinct 'key invalid', 'quota', 'offline' states", tag: "CALL" },
      { id: "r07", label: "Pre-cache the six Common hotkeys (Yes/No/Repeat/Moment/Slow/Thanks) as audio so taps are instant instead of a network round-trip", tag: "CALL" },
      { id: "r08", label: "Measure tap→audio latency on real hardware over cellular; set a target ceiling", tag: "CALL" },
      { id: "r09", label: "Double-tap guard — a second tap during synthesis currently starts a competing request", tag: "CALL" },
      { id: "r10", label: "Fallback to browser SpeechSynthesis when ElevenLabs is unreachable. A robotic voice beats no voice on a live call", tag: "CALL" },
      { id: "r11", label: "Validate the API key at save time, not on first speak — surface 'this key doesn't work' before Robin needs it", tag: "CALL" },
      { id: "r12", label: "Preflight check on app open: key valid, voice selected, network up, quota remaining. One green light before dialling", tag: "CALL" },
    ]
  },
  {
    id: "code", label: "Code Quality & Injection Surface", emoji: "🧹", color: "#E8879B",
    tasks: [
      { id: "c01", label: "scripts.js renderMyScripts() interpolates s.text into an onclick template literal. A backtick or quote in a script breaks the handler — and AI-generated text lands here unescaped", tag: "XSS" },
      { id: "c02", label: "renderQuickScripts() has the identical onclick interpolation", tag: "XSS" },
      { id: "c03", label: "renderFullScripts() injects s.name and replacePlaceholders(s.text) as innerHTML", tag: "XSS" },
      { id: "c04", label: "data.js renderInsurances() injects i.type, i.provider, i.memberId, i.group as innerHTML", tag: "XSS" },
      { id: "c05", label: "data.js renderPharmacies() injects p.name and p.phone as innerHTML", tag: "XSS" },
      { id: "c06", label: "Replace innerHTML string building with createElement + textContent, or add one escapeHtml() used everywhere", tag: "XSS" },
      { id: "c07", label: "14 scattered localStorage.setItem calls — collapse into one save(key) with a single serialisation path", tag: "ARCH" },
      { id: "c08", label: "Storage keys are unversioned (juniperInfo, juniperScripts…). Add a schema version now, before a shape change forces a migration you can't write", tag: "ARCH" },
      { id: "c09", label: "Every function is a global on window; no modules, no imports. Decide whether that's intentional simplicity or accumulated debt", tag: "ARCH" },
      { id: "c10", label: "Zero tests, zero lint, zero build step across 5,736 lines", tag: "ARCH" },
      { id: "c11", label: "Highest-value first test: replacePlaceholders() — pure function, 9 tokens, and it's what puts Robin's DOB into a sentence", tag: "ARCH" },
      { id: "c12", label: "Second test: getPrimaryInsurance() / getPrimaryPharmacy() fallback order when the list is empty or nothing is flagged primary", tag: "ARCH" },
      { id: "c13", label: "index.html loads 5 CSS + 6 JS files unbundled — fine for Pages, worth measuring on cellular", tag: "ARCH" },
      { id: "c14", label: "id: Date.now() as a primary key — two scripts saved in the same millisecond collide", tag: "ARCH" },
    ]
  },
  {
    id: "starseed", label: "StarSeed — Robin's Build", emoji: "🌱", color: "#5FBE72",
    note: "From UPDATE-NOTES.md 'Next Version'. Build it as a config flag, not a repo fork.",
    tasks: [
      { id: "s01", label: "ARCHITECTURE DECISION: build flag / config object over a cloned repo. A fork means every bug fix gets applied twice, forever — and the fork is the one Robin actually uses", tag: "ARCH" },
      { id: "s02", label: "Dragonfly palette applied as a theme, not a stylesheet rewrite", tag: "ROBIN" },
      { id: "s03", label: "Robin's ElevenLabs key embedded — note it is extractable from the bundle by anyone; scope and cap that key accordingly", tag: "KEYS" },
      { id: "s04", label: "Lock voice selection to Robin's cloned voice; hide the All Voices grid entirely", tag: "ROBIN" },
      { id: "s05", label: "Speed control promoted from the Voice modal to the main screen", tag: "ROBIN" },
      { id: "s06", label: "Pitch control (ElevenLabs voice_settings — currently hardcoded stability 0.5 / similarity_boost 0.75 with no UI)", tag: "ROBIN" },
      { id: "s07", label: "Laugh button — express emotion, not just information. The feature that makes it sound like a person", tag: "ROBIN" },
      { id: "s08", label: "Demo vs Robin feature matrix implemented per the table in Juniper-Master-DevTools.md", tag: "ROBIN" },
      { id: "s09", label: "Demo build: 1,000 character session cap, session-only storage, recording disabled", tag: "ROBIN" },
      { id: "s10", label: "Voice cloning captured and verified — 8–10 clips, ~10s each, name containing 'robin' so loadVoices() auto-detects it", tag: "ROBIN" },
      { id: "s11", label: "Emotional-load note from ARCHITECTURE.md: first playback of a cloned voice is a moment, not a QA step. Plan the session accordingly", tag: "ROBIN" },
      { id: "s12", label: "Sit with Robin for one real call and watch which button she reaches for first. That ordering should drive the layout, not the current grid", tag: "UX" },
    ]
  },
  {
    id: "twilio", label: "Phase 3 — Real Phone Integration", emoji: "☎️", color: "#4FC3D9",
    note: "The 20–40 hour project. Two-device workflow becomes one device.",
    tasks: [
      { id: "w01", label: "Backend stack decision: Node + Express + Socket.io per ARCHITECTURE.md, hosted on Vercel/Railway/Render", tag: "TWILIO" },
      { id: "w02", label: "Moving keys server-side resolves p02/p03 as a side effect — sequence this against the encryption decision rather than doing both", tag: "ARCH" },
      { id: "w03", label: "Twilio account, verified number, Account SID + Auth Token", tag: "TWILIO" },
      { id: "w04", label: "Twilio Media Streams — <Connect><Stream> to a WebSocket endpoint", tag: "TWILIO" },
      { id: "w05", label: "Bidirectional audio: ElevenLabs MP3 → Twilio stream (format/sample-rate conversion is the hard part)", tag: "TWILIO" },
      { id: "w06", label: "Whisper transcription of the caller's audio", tag: "WHISPER" },
      { id: "w07", label: "WebSocket events app↔server: transcript, call_status, error / speak, start_call, end_call, transfer", tag: "TWILIO" },
      { id: "w08", label: "Live transcript UI per the ARCHITECTURE.md call-screen mockup", tag: "TWILIO" },
      { id: "w09", label: "Barge-in: caller starts talking mid-playback — stop speaking, don't talk over them", tag: "TWILIO" },
      { id: "w10", label: "Transfer to Robin — hand the live audio to her own mic", tag: "TWILIO" },
      { id: "w11", label: "Hold + hold music + return from hold", tag: "TWILIO" },
      { id: "w12", label: "Incoming call handling with an auto-greeting", tag: "TWILIO" },
      { id: "w13", label: "LEGAL: call recording consent. Two-party-consent states require the caller's agreement — this is a legal gate on the recording features, not a nice-to-have", tag: "PHI" },
      { id: "w14", label: "Live cost meter — ~$0.024/min combined across Twilio, Whisper, ElevenLabs", tag: "TWILIO" },
      { id: "w15", label: "End-to-end latency budget: caller stops talking → Robin sees text → taps → caller hears audio. Above ~2s the receptionist starts talking again", tag: "TWILIO" },
      { id: "w16", label: "Whisper on Robin's own speech as a dictation path — flagged as a possibility in ARCHITECTURE.md and worth testing early, since it changes the whole input model", tag: "WHISPER" },
    ]
  },
  {
    id: "recording", label: "Recording & Transcription", emoji: "🎙️", color: "#8B8FE0",
    tasks: [
      { id: "d01", label: "Listen in Private — record Robin, transcribe, show in an editable field, send to TTS when she approves", tag: "ROBIN" },
      { id: "d02", label: "Caller transcription displayed live on screen", tag: "WHISPER" },
      { id: "d03", label: "Optional save of call transcripts, local only", tag: "PHI" },
      { id: "d04", label: "Auto-record triggers on configurable keywords (doctor, test results)", tag: "ROBIN" },
      { id: "d05", label: "Visible recording indicator whenever capture is active — never ambiguous", tag: "PHI" },
      { id: "d06", label: "Transcript retention policy + one-tap delete", tag: "PHI" },
    ]
  },
  {
    id: "ux", label: "UX for Robin", emoji: "💚", color: "#5FBE72",
    tasks: [
      { id: "u01", label: "HOW TO guide written for Robin, in the app, not in the repo", tag: "UX" },
      { id: "u02", label: "First-run onboarding: key → voice → name → DOB, in that order, then straight to a test call", tag: "UX" },
      { id: "u03", label: "Script preview before save", tag: "UX" },
      { id: "u04", label: "Test-script button that speaks it once before it goes live", tag: "UX" },
      { id: "u05", label: "Plain-language error copy — 'The voice service isn't answering', not 'Error'", tag: "UX" },
      { id: "u06", label: "Reorder hotkeys by actual observed use after the first real call", tag: "UX" },
      { id: "u07", label: "Reachability: most-used controls in the bottom third of a held tablet", tag: "UX" },
      { id: "u08", label: "'Repeat that last thing' — re-speak the previous phrase without re-navigating", tag: "UX" },
      { id: "u09", label: "The receptionist-doesn't-understand path: a slower, clearer re-say of the same phrase", tag: "UX" },
      { id: "u10", label: "PWA install + offline shell so it opens from the home screen like an app", tag: "UX" },
    ]
  },
  {
    id: "nym", label: "DevTools & Nymfarious Integration", emoji: "🪶", color: "#EFE6CE",
    tasks: [
      { id: "n01", label: "Juniper-DevTools-Map.html (630 ln) lives outside the app as a static page — fold it into a real drawer", tag: "DEVTOOLS" },
      { id: "n02", label: "Right-slide DevTools drawer per the Phase 6 roadmap", tag: "DEVTOOLS" },
      { id: "n03", label: "State inspector over the single `state` object — trivially easy here, unlike the React apps", tag: "DEVTOOLS" },
      { id: "n04", label: "Juniper is the vanilla-JS validation case for SPEC-MINIDEV-001. If the panel contract only works in React, the contract is wrong", tag: "NYM" },
      { id: "n05", label: "Register Juniper in the Magpie apps registry", tag: "NYM" },
      { id: "n06", label: "Mantis bug reporting wired from Juniper → n8n → Magpie", tag: "NYM" },
      { id: "n07", label: "This tracker embedded in the Magpie Progress panel", tag: "NYM" },
      { id: "n08", label: "Add Juniper as a sixth entry in the Nymfarious portfolio dashboard", tag: "NYM" },
      { id: "n09", label: "Apply the Nymfarious GitHub template — CONTRIBUTING, SECURITY, issue templates, PR template", tag: "NYM" },
    ]
  },
  {
    id: "docs", label: "Docs & Release", emoji: "📄", color: "#748A76",
    tasks: [
      { id: "x01", label: "README Version History stops at v6.2.1 while the app footer says v6.3.0", tag: "DOCS" },
      { id: "x02", label: "README Project Structure omits UPDATE-NOTES.md, JUNIPER-ARCHITECTURE.md, Juniper-Master-DevTools.md, Juniper-DevTools-Map.html", tag: "DOCS" },
      { id: "x03", label: "ARCHITECTURE.md dated Dec 2024, DevTools map Dec 2025, UPDATE-NOTES Dec 2025 — reconcile into one dated source of truth", tag: "DOCS" },
      { id: "x04", label: "Turn the UPDATE-NOTES.md testing checklist (11 items) into an automated smoke test", tag: "DOCS" },
      { id: "x05", label: "Refresh Screenshot.png for v6.3.0 — it predates the SPEAK/STOP and Speak Aloud renames", tag: "DOCS" },
      { id: "x06", label: "Document the two-device workflow (phone on speaker + tablet) in the README — it's the actual operating model and it's only in ARCHITECTURE.md", tag: "DOCS" },
      { id: "x07", label: "Cost transparency section: ~$11–16/mo fixed, ~$0.024/min variable", tag: "DOCS" },
      { id: "x08", label: "MIT LICENSE present and correct", tag: "DOCS", done: true },
      { id: "x09", label: "Verify the live Pages deploy actually serves the v6.3.0 build", tag: "SHIP" },
      { id: "x10", label: "This app doesn't exist as a consumer product. Write that up properly — it's the part that helps someone besides Robin", tag: "DOCS" },
    ]
  },
  {
    id: "done", label: "Shipped — v6.3.0 Baseline", emoji: "✅", color: "#2F7D4A",
    note: "Real, working, verified in source. Timestamped 'legacy' so they don't distort velocity.",
    tasks: [
      { id: "z01", label: "Refactor from single-file to src/css + src/js (6 JS modules, 5 stylesheets)", tag: "SHIP", done: true },
      { id: "z02", label: "ElevenLabs TTS pipeline working end to end", tag: "SHIP", done: true },
      { id: "z03", label: "Voice loading + cloned-voice auto-detection by name match on 'robin'", tag: "SHIP", done: true },
      { id: "z04", label: "Placeholder system — 9 tokens with pronunciation overrides for name fields", tag: "SHIP", done: true },
      { id: "z05", label: "Pronunciation fields (pronounceFirst/Last/Nick) — a genuinely thoughtful touch most apps miss", tag: "SHIP", done: true },
      { id: "z06", label: "Insurance CRUD incl. Rx BIN/PCN", tag: "SHIP", done: true },
      { id: "z07", label: "Pharmacy CRUD with primary flag and single-primary enforcement", tag: "SHIP", done: true },
      { id: "z08", label: "Full Scripts across 5 categories with seeded defaults", tag: "SHIP", done: true },
      { id: "z09", label: "My Scripts with icon picker and Quick Speak promotion", tag: "SHIP", done: true },
      { id: "z10", label: "History — last 20 phrases, tap to reload into the input", tag: "SHIP", done: true },
      { id: "z11", label: "Editable intro and verify buttons", tag: "SHIP", done: true },
      { id: "z12", label: "Speed slider 0.8–1.2x, persisted", tag: "SHIP", done: true },
      { id: "z13", label: "v6.3.0 hover-jump fix — min-height 72px + opacity swap instead of display toggle", tag: "SHIP", done: true },
      { id: "z14", label: "v6.3.0 input clearing on load (autocomplete=off + explicit clear in init)", tag: "SHIP", done: true },
      { id: "z15", label: "🌿 favicon + Apple touch icon", tag: "SHIP", done: true },
      { id: "z16", label: "GitHub Pages deploy workflow", tag: "SHIP", done: true },
      { id: "z17", label: ".gitignore covers .env and .env.local", tag: "SHIP", done: true },
      { id: "z18", label: "Architecture document written — call flows, cost model, phased plan", tag: "SHIP", done: true },
      { id: "z19", label: "DevTools map document written — button→panel→function table, state shape", tag: "SHIP", done: true },
      { id: "z20", label: "Robin can make a phone call she couldn't make before", tag: "SHIP", done: true },
    ]
  },
];

const STORAGE_KEY = "juniper-tracker-v2";

function buildInitialState() {
  const s = {};
  PHASES.forEach(p => p.tasks.forEach(t => { s[t.id] = t.done ? "legacy" : null; }));
  return s;
}

// v1 booleans → v2 timestamps. Copy this into the other trackers.
function migrate(raw) {
  const fresh = buildInitialState();
  if (!raw) return fresh;
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return fresh; }
  const out = { ...fresh };
  Object.entries(parsed).forEach(([id, val]) => {
    if (!(id in fresh)) return;
    if (val === true) out[id] = "legacy";
    else if (val === false || val === null) out[id] = null;
    else if (typeof val === "string") out[id] = val;
  });
  return out;
}

const isDone = v => v !== null && v !== undefined;
const stamp = () => new Date().toISOString();

function fmtWhen(v) {
  if (v === "legacy") return "baseline";
  if (!v) return "";
  const d = new Date(v);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  if (mins < 1440) return Math.round(mins / 60) + "h ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Bar({ pct, color, h = 6 }) {
  return (
    <div style={{ background: "#101A12", borderRadius: 4, height: h, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 4, transition: "width .5s ease" }} />
    </div>
  );
}

function TagBadge({ tag }) {
  const c = TC[tag] || "#748A76";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: ".06em", padding: "2px 5px", borderRadius: 3,
      background: c + "24", color: c, border: "1px solid " + c + "44",
      whiteSpace: "nowrap", flexShrink: 0, fontFamily: MONO
    }}>{tag}</span>
  );
}

function PhaseCard({ phase, checks, onToggle, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  const done = phase.tasks.filter(t => isDone(checks[t.id])).length;
  const total = phase.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ background: P.card, border: "1px solid " + phase.color + "30", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{phase.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 5 }}>{phase.label}</div>
          <Bar pct={pct} color={phase.color} />
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: phase.color, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, color: P.dim, fontFamily: MONO }}>{done}/{total}</div>
        </div>
        <span style={{ fontSize: 11, color: P.dim }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 12px" }}>
          {phase.note && (
            <div style={{
              fontSize: 11, color: phase.color, background: phase.color + "12",
              border: "1px solid " + phase.color + "28", borderRadius: 8,
              padding: "8px 10px", marginBottom: 10, lineHeight: 1.45
            }}>{phase.note}</div>
          )}
          {phase.tasks.map(t => {
            const v = checks[t.id];
            const d = isDone(v);
            return (
              <div key={t.id} onClick={() => onToggle(t.id)} style={{
                display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0",
                borderTop: "1px solid " + P.border, cursor: "pointer"
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: "1.5px solid " + (d ? phase.color : P.dim),
                  background: d ? phase.color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "#08110A", fontWeight: 900
                }}>{d ? "✓" : ""}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, lineHeight: 1.45,
                    color: d ? P.dim : P.text,
                    textDecoration: d ? "line-through" : "none"
                  }}>{t.label}</div>
                  {d && v !== "legacy" && (
                    <div style={{ fontSize: 9, color: P.pine, fontFamily: MONO, marginTop: 2 }}>✓ {fmtWhen(v)}</div>
                  )}
                </div>
                <TagBadge tag={t.tag} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JuniperTracker() {
  const [checks, setChecks] = useState(buildInitialState);
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        setChecks(migrate(r?.value));
      } catch {
        try {
          const legacy = await window.storage.get("juniper-tracker-v1");
          setChecks(migrate(legacy?.value));
        } catch { /* first run */ }
      }
      setLoaded(true);
    })();
  }, []);

  async function toggle(id) {
    const next = { ...checks, [id]: isDone(checks[id]) ? null : stamp() };
    setChecks(next);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  async function resetAll() {
    if (!confirm("Reset every task to the v6.3.0 baseline?")) return;
    const fresh = buildInitialState();
    setChecks(fresh);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(fresh)); } catch {}
  }

  const allIds = useMemo(() => PHASES.flatMap(p => p.tasks.map(t => t.id)), []);
  const totalCount = allIds.length;
  const doneCount = useMemo(() => allIds.filter(id => isDone(checks[id])).length, [checks, allIds]);
  const masterPct = Math.round((doneCount / totalCount) * 100);

  // Velocity — the payoff of storage v2
  const recent = useMemo(() => {
    const rows = [];
    PHASES.forEach(p => p.tasks.forEach(t => {
      const v = checks[t.id];
      if (v && v !== "legacy") rows.push({ ...t, when: v, phase: p.label, color: p.color });
    }));
    return rows.sort((a, b) => new Date(b.when) - new Date(a.when));
  }, [checks]);

  const last7 = useMemo(() => {
    const cut = Date.now() - 7 * 864e5;
    return recent.filter(r => new Date(r.when).getTime() > cut).length;
  }, [recent]);

  const remaining = totalCount - doneCount;
  const eta = last7 > 0 ? Math.ceil(remaining / (last7 / 7)) : null;

  const visiblePhases = useMemo(() => {
    if (filter === "all") return PHASES;
    return PHASES.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => filter === "done" ? isDone(checks[t.id]) : !isDone(checks[t.id]))
    })).filter(p => p.tasks.length > 0);
  }, [filter, checks]);

  const btn = active => ({
    fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
    border: "none", letterSpacing: ".04em",
    background: active ? P.green : P.border,
    color: active ? "#08110A" : P.muted
  });

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: P.bg, minHeight: "100vh", color: P.text, padding: 16, maxWidth: 900, margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 32 }}>🌿</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: P.green, letterSpacing: "-.03em", lineHeight: 1 }}>Juniper Voice Assistant</h1>
            <p style={{ margin: 0, fontSize: 10, color: P.dim, letterSpacing: ".1em", textTransform: "uppercase" }}>Project Progress · Nymfarious · v6.3.0 · storage v2</p>
          </div>
        </div>
        <button onClick={resetAll} style={{ fontSize: 10, padding: "5px 10px", borderRadius: 6, background: "transparent", border: "1px solid " + P.border, color: P.dim, cursor: "pointer" }}>↺ Reset</button>
      </div>

      {/* Purpose banner */}
      <div style={{
        background: "linear-gradient(90deg," + P.pine + "22," + P.berry + "14)",
        border: "1px solid " + P.pine + "44", borderRadius: 10,
        padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10
      }}>
        <span style={{ fontSize: 18 }}>💚</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.cream }}>One user. Real medical data. Live phone calls.</div>
          <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Every red task below is something that fails while a receptionist is waiting on the line.</div>
        </div>
      </div>

      {/* Master progress */}
      <div style={{ background: P.card, border: "1px solid " + P.border, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: ".1em" }}>Overall Completion</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: P.green, lineHeight: 1 }}>{masterPct}<span style={{ fontSize: 14 }}>%</span></span>
        </div>
        <Bar pct={masterPct} color={P.green} h={14} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: P.pine }}>✓ {doneCount} complete</span>
          <span style={{ fontSize: 11, color: P.muted }}>{remaining} remaining of {totalCount} total</span>
        </div>
      </div>

      {/* Velocity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { l: "Closed, last 7d", v: last7, c: P.green },
          { l: "Pace", v: last7 ? (last7 / 7).toFixed(1) + "/day" : "—", c: P.berry },
          { l: "ETA at pace", v: eta ? eta + "d" : "—", c: P.amber },
        ].map(s => (
          <div key={s.l} style={{ background: P.card, border: "1px solid " + P.border, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: P.dim, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: MONO }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Phase strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
        {PHASES.map(ph => {
          const d = ph.tasks.filter(t => isDone(checks[t.id])).length;
          const pct = Math.round((d / ph.tasks.length) * 100);
          return (
            <div key={ph.id} style={{ background: P.card, border: "1px solid " + ph.color + "30", borderRadius: 8, padding: "9px 10px" }}>
              <div style={{ fontSize: 15, marginBottom: 3 }}>{ph.emoji}</div>
              <div style={{ fontSize: 9, color: P.muted, marginBottom: 5, lineHeight: 1.3, minHeight: 24 }}>{ph.label}</div>
              <Bar pct={pct} color={ph.color} h={5} />
              <div style={{ fontSize: 10, color: ph.color, marginTop: 4, fontWeight: 700 }}>{pct}%</div>
              <div style={{ fontSize: 9, color: P.dim, fontFamily: MONO }}>{d}/{ph.tasks.length}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: P.dim, marginRight: 4 }}>Show:</span>
        {[["all", "All"], ["todo", "Remaining"], ["done", "Completed"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={btn(filter === v)}>{l}</button>
        ))}
      </div>

      {visiblePhases.map((ph, i) => (
        <PhaseCard key={ph.id} phase={ph} checks={checks} onToggle={toggle} startOpen={i < 2} />
      ))}

      {/* Activity feed */}
      {recent.length > 0 && (
        <div style={{ background: P.card, border: "1px solid " + P.border, borderRadius: 12, padding: "14px 16px", marginTop: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.muted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Recent Activity</div>
          {recent.slice(0, 12).map(r => (
            <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderTop: "1px solid " + P.border }}>
              <span style={{ fontSize: 9, color: P.pine, fontFamily: MONO, flexShrink: 0, minWidth: 62 }}>{fmtWhen(r.when)}</span>
              <span style={{ fontSize: 9, color: r.color, flexShrink: 0, minWidth: 78 }}>{r.phase.split("—")[0].trim()}</span>
              <span style={{ fontSize: 11, color: P.muted, lineHeight: 1.4 }}>{r.label.slice(0, 90)}{r.label.length > 90 ? "…" : ""}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: P.dim, lineHeight: 1.6 }}>
        {totalCount} tasks · 13 phases · grounded in 5,736 lines across 24 files<br />
        <span style={{ color: P.pine }}>🌿 Giving Robin her voice back</span>
        {!loaded && <span style={{ color: P.amber }}> · loading…</span>}
      </div>
    </div>
  );
}
