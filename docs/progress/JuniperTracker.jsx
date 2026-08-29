import { useState, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// JUNIPER VOICE ASSISTANT — PROGRESS TRACKER
// Rebuilt 2026-08-24 against origin/main @ 7118180 (through PR #19), v6.4.0.
//
// The previous list was written at v6.3.0 on 2026-07-31 and never touched again while 15
// PRs landed. By 2026-08-24 over half of its 161 tasks were answered or obsolete: the app
// had grown a Firebase backend, an allowlist, server-side secrets, usage ceilings, a focus
// trap and 81 aria attributes, none of which the tracker knew about. Every task below was
// re-measured in source on that date, not carried forward.
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
    id: "live", label: "Live Defects", emoji: "🔴", color: "#E5484D",
    note: "Found by reading 6.4.0 source, not by carrying the 6.3.0 list forward. Everything here reproduces today.",
    tasks: [
      { id: "L01", label: "speech.js speak() — a second tap while the first synthesize() is still awaiting fires a competing request. stopSpeaking() only cancels audio already playing, so both promises resolve and both call playCloudAudio(). Two voices at once, and twice the character budget", tag: "CALL" },
      { id: "L02", label: "No confirm or undo on any delete: deleteInsurance (data.js:35), deletePharmacy (data.js:98), deleteMyScript (scripts.js:106), deleteFullScript (scripts.js:150). Zero confirm() calls across all four. This is a motor-accessibility app and one mis-tap is destructive", tag: "UX" },
      { id: "L03", label: "ui.js:3 modalOpener is a single variable, not a stack. Open a second modal over the first and the original opener is overwritten; closeModal() then nulls it, so focus never returns to where the outer modal was opened from", tag: "A11Y" },
      { id: "L04", label: "Quota exhaustion is invisible. speech.js catch() logs to console and drops silently to the device voice — the user hears a different voice mid-call with nothing saying why. checkUsage() produces a real message server-side and the client discards it", tag: "CALL" },
      { id: "L05", label: "scripts.js saveFullScript() calls state.fullScripts[cat].push(...) with no guard. A juniperFullScripts object stored by an older release that lacks a category key throws TypeError on save", tag: "BUG" },
      { id: "L06", label: "The ui.js focus trap filters on element.offsetParent !== null, which is null for any position:fixed control. A fixed-position button inside a modal is silently dropped from the Tab cycle", tag: "A11Y" },
      { id: "L07", label: "helpers.js loadInfoFields() and app.js init() call getElementById(id).value with no null guard across 12 field ids. One renamed id in index.html throws during init and stops the rest of the boot", tag: "BUG" },
    ]
  },
  {
    id: "privacy", label: "Privacy — the migration with no end date", emoji: "🔐", color: "#E5484D",
    note: "6.4.0 moved new data to sessionStorage. It did not remove the old data, and nothing ever asks the user to.",
    tasks: [
      { id: "P01", label: "app.js:20-32 reads every private field as readStoredJson(sessionStorage, k, readStoredJson(localStorage, k, ...)). Pre-6.4.0 profile, insurance, pharmacy and history are still read out of localStorage on every load, indefinitely, until the user happens to find Clear private data now", tag: "PHI" },
      { id: "P02", label: "Nothing prompts for that migration — no banner, no one-time notice, no expiry. The README documents the behaviour honestly, but a documented indefinite plaintext residue is still a residue", tag: "PHI" },
      { id: "P03", label: "JUNIPER-ARCHITECTURE.md specifies a guardrail: never auto-speak SSN, card numbers or PINs, and say the verify line instead. No such check exists anywhere in speech.js speakInfo()", tag: "PHI" },
      { id: "P04", label: "completeSpeech() calls addHistory(text) for every non-test phrase, so history still accumulates DOB and member IDs spoken through speakInfo(). sessionStorage narrows the window to one session; it does not narrow the content", tag: "PHI" },
      { id: "P05", label: "clearPrivateData() clears 10 keys but leaves juniperMiniMantisQueue and the voice preferences. Neither holds PHI by design — say so in the confirm text rather than leaving the user to assume everything went", tag: "PHI" },
      { id: "P06", label: "Screenshot.png is still committed at repo root. Pages now ships only _site so it is no longer published — confirm it holds no real DOB, member ID or address before that changes again", tag: "SHIP" },
      { id: "P07", label: "Scan the full git history, not HEAD, for personal data ever committed. Never done, and the repo predates the sessionStorage move by 19 PRs", tag: "SHIP" },
      { id: "P08", label: "Session timeout or re-lock on an idle shared tablet. sessionStorage clears when the browser closes, which is not the same as clearing on a tab left open in a waiting room", tag: "PHI" },
      { id: "P09", label: "Write the one-page threat model: single user, own device, allowlisted cloud backend, no local encryption. Name what is and is not defended, now that the answer has actually changed", tag: "DOCS" },
    ]
  },
  {
    id: "a11y", label: "Accessibility — what the 6.4.0 pass left", emoji: "♿", color: "#8B8FE0",
    note: "The big gap is closed: index.html carries 81 aria-* and 24 role=, and all 8 dialogs have role, aria-modal and a close control. These are the remainders.",
    tasks: [
      { id: "A01", label: "Zero prefers-contrast and zero forced-colors rules across all 5 stylesheets. No high-contrast variant — and thiamine-related conditions can affect vision as well as speech", tag: "WCAG" },
      { id: "A02", label: "prefers-reduced-motion covers exactly 2 blocks (styles.css:714 dragonfly and status dot, voice.css:62 voice cards). Audit every remaining transition and animation against it", tag: "WCAG" },
      { id: "A03", label: "200% text scaling has never been tested for layout breakage", tag: "WCAG" },
      { id: "A04", label: "A real screen-reader pass. axe covers what axe can see; VoiceOver on iPad is the highest-value target given the two-device workflow, and no automated check substitutes for it", tag: "A11Y" },
      { id: "A05", label: "6 blocking alert() calls remain, all form validation: data.js:25, data.js:83, scripts.js:89, scripts.js:174, scripts.js:188, ui.js:142. Speech failures already use setStatus properly — finish the job and make validation inline too", tag: "A11Y" },
      { id: "A06", label: "Tap-target audit at 44x44 CSS px across toolbar, tabs, filter chips and delete buttons. Hotkeys got min-height 72px in 6.3.0; nothing else was ever measured", tag: "WCAG" },
      { id: "A07", label: "Contrast audit of the forest palette against WCAG AA. 6.4.0 corrected the defects axe found; axe cannot see text sitting over the watercolor hero artwork", tag: "WCAG" },
    ]
  },
  {
    id: "resilience", label: "Failure Handling Mid-Call", emoji: "📞", color: "#E0A33E",
    note: "Every failure here happens while a receptionist is waiting on the line. The fallback chain is built; the telling-the-user half is not.",
    tasks: [
      { id: "R01", label: "Character budget meter in the UI. The ceilings are real and enforced — 500 requests and 100,000 characters per user per month — and the user has no way to see how close they are", tag: "CALL" },
      { id: "R02", label: "Distinct status vocabulary. setStatus says ready/loading/speaking/error — add quota, not-signed-in and offline so the status bar can explain a downgrade instead of merely showing one", tag: "CALL" },
      { id: "R03", label: "Offline detection before a call starts, rather than after the first phrase fails", tag: "CALL" },
      { id: "R04", label: "No retry on a transient synthesize() failure — one flaky request drops to the device voice for the rest of the call", tag: "CALL" },
      { id: "R05", label: "Pre-cache the six Common hotkeys as audio so the most-used taps are instant instead of a round trip", tag: "CALL" },
      { id: "R06", label: "Measure tap-to-audio latency on real hardware over cellular and set a target ceiling", tag: "CALL" },
      { id: "R07", label: "Preflight on open: signed in, voice selected, network up, quota remaining. One green light before dialling", tag: "CALL" },
    ]
  },
  {
    id: "backend", label: "The Cloud Half", emoji: "☁️", color: "#4FC3D9",
    note: "None of this existed when the previous tracker was written. Functions, allowlist, secrets and ceilings all landed between #5 and #19.",
    tasks: [
      { id: "B01", label: "App Check is off by owner choice while the audience is three people (UPDATE-NOTES). Decide the trigger that turns it on — a user count, a public link, or a date", tag: "ARCH" },
      { id: "B02", label: "Exactly three Google accounts sit in authorizedUsers/{uid}. There is no documented process for adding a fourth, and no UI explaining why a signed-in stranger sees only the device voice", tag: "ARCH" },
      { id: "B03", label: "functions/test covers limits.js only — 7 tests, all pure. functions/src/index.js, which holds the callables, the secret handling and the Firestore counter writes, has no test at all", tag: "ARCH" },
      { id: "B04", label: "No alerting as the 250,000-character global monthly ceiling approaches. checkUsage refuses at the wall; nothing warns before it", tag: "ARCH" },
      { id: "B05", label: "Blaze is required for 2nd-gen Functions. Confirm a billing budget alert exists on juniper-voice-assistant-nym — the code ceilings cap Juniper, not the project", tag: "SHIP" },
      { id: "B06", label: "PUBLIC-E2E-CHECKLIST.md says its remaining purpose is production voice-path proof. Run it against juni.nymfarious.com and record the date, or state plainly that it has not been run", tag: "SHIP" },
    ]
  },
  {
    id: "mantis", label: "Mini Mantis", emoji: "🪶", color: "#EFE6CE",
    note: "Built, allow-listed, and deliberately switched off. The contract is the good part; the delivery half is unfinished.",
    tasks: [
      { id: "M01", label: "config.enabled is false and endpoint is empty, so every event queues and nothing ever leaves. Waiting on Master Mantis exposing an approved authenticated endpoint", tag: "NYM" },
      { id: "M02", label: "queue() keeps the last 50 payloads via existing.slice(-49) and drops the oldest silently. By the time delivery is switched on, everything past 50 is already gone", tag: "NYM" },
      { id: "M03", label: "There is no flush path. Enabling delivery starts sending new events and never drains what the queue already holds", tag: "NYM" },
      { id: "M04", label: "Surface Juniper's tracker in Master DevTools alongside the others — the reason these files exist at all", tag: "DEVTOOLS" },
    ]
  },
  {
    id: "drift", label: "Drift & Dead Code", emoji: "🧹", color: "#E0A33E",
    note: "Small, cheap, and each one is a lie a future session has to spend time disproving.",
    tasks: [
      { id: "D01", label: "3 of 5 stylesheets still carry a v6.3.1 header: agents.css, modals.css, scripts.css. The other 2 and all 7 hand-written JS files say v6.4.0", tag: "DRIFT" },
      { id: "D02", label: "The version is hardcoded in three places that can disagree: app.js MiniMantis.report app_loaded detail, mantis.js appVersion, and package.json. Derive them from one source", tag: "DRIFT" },
      { id: "D03", label: "✅ FIXED 2026-08-28 — desktop.ini was committed at repo root and absent from .gitignore. Flagged 2026-07-31, survived 20 PRs. Now ignored and untracked; contents were Explorer folder metadata, no secret. Checked across the portfolio: Juniper was the ONLY repo tracking it — TripSafe, Parallax, Magpie and CERTHerd already ignored it", tag: "DRIFT", done: true },
      { id: "D04", label: "ui.js:174 toggleSetting() has zero callers — all three Smart Features toggles ship disabled. Dead code that reads like a live feature", tag: "DRIFT" },
      { id: "D05", label: "helpers.js:88 updateHeaderName() builds a const from nickname/firstName and never uses it; the function sets a fixed string. eslint passes, so the config is not catching unused locals — check that too", tag: "DRIFT" },
      { id: "D06", label: "app.js carries an orphaned API Key Status comment with nothing under it, left behind by the release that moved keys server-side", tag: "DRIFT" },
      { id: "D07", label: "Three HTML builds remain: index.html at 428 lines, juniper-v6.2.1.html at 654, juniper.html at 970. The README documents the last two as historical and unpublished — decide whether documented is enough or they should go", tag: "DRIFT" },
    ]
  },
  {
    id: "robin", label: "UX for Robin", emoji: "💚", color: "#5FBE72",
    note: "The only phase whose success is measured by one person being able to finish a phone call.",
    tasks: [
      { id: "U01", label: "Import the setup export back in. #19 added the portable setup export; a device swap still means re-entering everything by hand unless it round-trips", tag: "UX" },
      { id: "U02", label: "Reorder Quick Speak by use, or by hand. Frequency is already knowable from history and is currently unused", tag: "UX" },
      { id: "U03", label: "One-tap say-that-again for the last phrase, without retyping or hunting through history", tag: "UX" },
      { id: "U04", label: "Test the real two-device workflow end to end: phone on speaker, tablet in hand, one call to a pharmacy", tag: "ROBIN" },
    ]
  },
  {
    id: "future", label: "Phase 3 and Beyond — not started", emoji: "☎️", color: "#4FC3D9",
    note: "Kept so the roadmap stays visible, not because any of it is in flight. Nothing below has code.",
    tasks: [
      { id: "F01", label: "Twilio integration — Juniper places or joins the call rather than being held up to a speaker", tag: "TWILIO" },
      { id: "F02", label: "A transcript source. Scribe and Smart Response are honestly labelled previews and stay that way until this exists", tag: "WHISPER" },
      { id: "F03", label: "Recording and transcription, with the consent and retention questions answered before a line of code is written", tag: "WHISPER" },
    ]
  },
  {
    id: "docs", label: "Docs & Release", emoji: "📄", color: "#748A76",
    note: "The prose docs are current through #19. The machine-readable half was 15 PRs stale until this rebuild.",
    tasks: [
      { id: "X01", label: "Keep this tracker current. The previous one was written at v6.3.0 on 2026-07-31 and never touched again through 15 PRs, by which time over half of its 161 tasks were answered or obsolete", tag: "DOCS" },
      { id: "X02", label: "C:/dev/Juniper sits on main at 912b318 (PR #4) while origin/main is 7118180 (PR #19). Bring the primary checkout forward, or a cold session reads a version of the app that no longer exists", tag: "DOCS" },
      { id: "X03", label: "Playwright was not run during the 2026-08-24 audit — check:js, eslint and the 7 functions tests were. The 12 browser tests including the axe a11y check are unverified as of that date", tag: "QA" },
    ]
  },
  {
    id: "done", label: "Shipped — v6.4.0 Baseline", emoji: "✅", color: "#2F7D4A",
    note: "Verified in source on 2026-08-24, not read off a changelog. Marked legacy so they do not distort velocity.",
    tasks: [
      { id: "z01", label: "firestore.rules is deny-by-default for every document; the browser never touches Firestore directly", tag: "SHIP", done: true },
      { id: "z02", label: "Provider credentials moved to Firebase Secret Manager. The browser accepts no key, and app.js:52 removes the juniperApiKey and juniperClaudeKey left by older releases", tag: "SHIP", done: true },
      { id: "z03", label: "Three-tier voice fallback: ElevenLabs, then Google Standard, then device SpeechSynthesis. A robotic voice beats no voice, and the chain is real", tag: "SHIP", done: true },
      { id: "z04", label: "Server-side request validation in limits.js validateSpeechRequest — 400-character cap, Standard-only Google voice regex, ElevenLabs id charset", tag: "SHIP", done: true },
      { id: "z05", label: "Usage ceilings enforced in checkUsage: 500 requests and 100,000 characters per user per month, 250,000 characters globally", tag: "SHIP", done: true },
      { id: "z06", label: "Injection surface closed: zero innerHTML and zero onclick string interpolation in hand-written JS, replaced by createElement and replaceChildrenWith in helpers.js", tag: "SHIP", done: true },
      { id: "z07", label: "All 8 dialogs carry role=dialog, aria-modal and a modal-close control", tag: "SHIP", done: true },
      { id: "z08", label: "Focus trap, Escape-to-close, inert on the background container, and focus restored to the opener", tag: "SHIP", done: true },
      { id: "z09", label: "Profile, insurance, pharmacy, history and scripts write to sessionStorage", tag: "SHIP", done: true },
      { id: "z10", label: "Clear private data now — clears 10 keys from both sessionStorage and localStorage, behind a confirm", tag: "SHIP", done: true },
      { id: "z11", label: "Smart Features are labelled Preview and all three toggles ship disabled with honest aria-labels. The fake-toggle problem is gone", tag: "SHIP", done: true },
      { id: "z12", label: "AI generation is now Create editable starter — a local template, no browser-side provider key, no CORS dependency", tag: "SHIP", done: true },
      { id: "z13", label: "Mini Mantis allow-lists events, outcomes and detail keys, and carries no message text, names, identifiers, keys or audio", tag: "SHIP", done: true },
      { id: "z14", label: "12 Playwright tests covering launch, script save, text-not-HTML rendering, storage boundaries, exports, voice catalog, account switching, Mantis queueing, inline-action resolution, focus trap, and an axe pass", tag: "SHIP", done: true },
      { id: "z15", label: "7 Node tests on limits.js, including the stable UTC month key and the ElevenLabs-before-Google ordering", tag: "SHIP", done: true },
      { id: "z16", label: "npm run verify chains build:client, check:js, eslint, the functions check and Playwright into one gate", tag: "SHIP", done: true },
      { id: "z17", label: "The Pages workflow uploads only _site — the whole-repo publish is fixed", tag: "SHIP", done: true },
      { id: "z18", label: "Branded Google sign-in at auth.juni.nymfarious.com", tag: "SHIP", done: true },
      { id: "z19", label: "index.html carries 81 aria-* attributes and 24 role= — measured, against 0 and 0 at v6.3.0", tag: "SHIP", done: true },
      { id: "z20", label: "Private setup and communication-packet PDF exports, lazy-imported so the base page does not carry the bundle (#19)", tag: "SHIP", done: true },
      { id: "z21", label: "Robin can make a phone call she could not make before", tag: "SHIP", done: true },
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
