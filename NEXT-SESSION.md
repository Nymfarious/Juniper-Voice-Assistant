# Next session — Juniper handoff (2026-08-24)

> Notes from one session to the next. Say what you **measured**, not what the last note claimed.
> If a line here is older than your session, re-measure it before planning around it.

## ⚠️ Read this first: you are probably in the wrong checkout

`C:/dev/Juniper` sits on `main` @ **`912b318` — PR #4, from 2026-08-01**. `origin/main` is
**`7118180`, through PR #19**. The primary folder is 15 PRs behind and shows you a version of
the app that no longer exists: no Firebase backend, no allowlist, keys still in `localStorage`.

The live work is in the `C:/dev/Juniper-codex-*` worktrees. To measure `main`, find a worktree
whose tree matches — `git diff --stat origin/main <sha>` returning empty — rather than switching
a checkout someone else is using. On 2026-08-24 that was `Juniper-codex-exports`.

## Where it stands — measured 2026-08-24, not remembered

| | |
|---|---|
| `origin/main` | `7118180`, through **PR #19** |
| Open PRs | **none** |
| Version | **6.4.0** (`package.json`) |
| `npm run check:js` | ✅ clean |
| `npm run lint` | ✅ clean |
| `npm --prefix functions run check` | ✅ **7/7 pass** |
| Playwright (12 tests, incl. axe `@a11y`) | ⬜ **not run** — needs a browser install |
| Public site | `juni.nymfarious.com` · auth at `auth.juni.nymfarious.com` |
| Firebase project | `juniper-voice-assistant-nym` (Blaze, `us-west1`, Node 22) |

**6.4.0 was a genuine launch-hardening release.** Provider keys moved to Firebase Secret Manager
and the browser now accepts none; Firestore is deny-by-default and the client never touches it
directly; PHI moved to `sessionStorage`; the injection surface is closed (zero `innerHTML`, zero
`onclick` string interpolation in hand-written JS); and `index.html` went from **0 `aria-*` and
0 `role=`** to **81 and 24**, with a real focus trap, Escape-to-close and `inert` backgrounding.

## The docs, and which one to trust

**Current and accurate** — all touched between 2026-08-23 and 2026-08-24, all verified against
source: `README.md`, `UPDATE-NOTES.md`, `JUNIPER-ARCHITECTURE.md`, `docs/PUBLIC-E2E-CHECKLIST.md`,
`docs/MINI-MANTIS-INTEGRATION.md`. The README is notably honest — its **Intentional previews**
section says outright that Scribe and Smart Response do not summarize or answer calls.

**`docs/progress/JuniperTracker.jsx` was the exception.** Written at v6.3.0 on 2026-07-31 and
never touched again while 15 PRs landed. By 2026-08-24 over half its 161 tasks were answered or
obsolete, and its three highest-stakes phases — privacy, accessibility, injection — had been
largely resolved by architecture it did not know existed. **Rebuilt 2026-08-24** against 6.4.0:
11 phases, 79 tasks, 21-item verified baseline.

> The lesson worth carrying: a tracker that drifts is **worse than no tracker**, because it
> manufactures false confidence in both directions. It was still warning about plaintext API
> keys that had been gone for three weeks, while knowing nothing about the usage ceilings that
> actually govern the app now.

## Where to pick up

Worst-first, straight off the rebuilt tracker:

1. **L02 — no confirm or undo on any delete.** Four functions fire instantly on a single tap:
   `deleteInsurance` (data.js:35), `deletePharmacy` (data.js:98), `deleteMyScript`
   (scripts.js:106), `deleteFullScript` (scripts.js:150). Zero `confirm()` calls between them.
   This is a motor-accessibility app; this is the highest-value small fix on the list.
2. **L01 — double-tap race in `speech.js speak()`.** `stopSpeaking()` only cancels audio that is
   already playing, so a second tap during an awaited `synthesize()` starts a competing request
   and both resolve. Two voices at once, and twice the character budget.
3. **L04 — quota exhaustion is invisible.** The server produces a real message; the client
   catches, logs to console, and drops silently to the device voice. The user hears a different
   voice mid-call and is never told why.
4. **P01/P02 — the migration with no end date.** `app.js:20-32` reads every private field as
   `sessionStorage` falling back to `localStorage`, so pre-6.4.0 profile, insurance, pharmacy and
   history are still read out of `localStorage` on every load, forever, until the user happens to
   find *Clear private data now*. The README documents it; nothing prompts for it.
5. **D03 — `desktop.ini`** is still committed at repo root and still absent from `.gitignore`.
   Flagged 2026-07-31, survived all 19 PRs since. Two-line fix.

## Traps this repo has already sprung

- **Phantom merges are real here.** PRs merge themselves within minutes of opening, recorded as
  `mergedBy: Nymfarious`, with nobody clicking and no agent running `gh pr merge`. Check
  `gh pr view <n> --json state,mergedAt` **immediately before you act** — not once when you open
  it. A push to an already-merged branch orphans the commits silently.
- **Agents do not merge and do not delete branches.** Shannon merges, and wants to see what is
  waiting.
- **`src/js/export.js` and `src/js/firebase-client.js` are build outputs, not source.** They are
  esbuild bundles of the matching `.module.js` files, committed on purpose because the site
  deploys statically with no build step. Edit the `.module.js` and run `npm run build:client`;
  editing the bundle directly will be overwritten and will not survive review.
- **The version is hardcoded in three places** that can disagree — `app.js`, `mantis.js` and
  `package.json` — and three of the five stylesheets still say v6.3.1.

## How to re-measure everything

```
git fetch origin --prune
git log --oneline origin/main -5
gh pr list --state open
npm run check:js && npm run lint
npm --prefix functions run check
npm test                      # Playwright — needs `npx playwright install`
grep -c 'aria-' index.html; grep -o 'role="[a-z]*"' index.html | sort | uniq -c
```
