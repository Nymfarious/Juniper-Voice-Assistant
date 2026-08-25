# Juniper Voice Assistant — Progress Tracker

`JuniperTracker.jsx` is this repo's progress tracker: a self-contained React component whose
task list is **grounded in real files, lines, and commits in this repo** — not a wish
list.

**Rebuilt 2026-08-24** against `origin/main` @ `7118180` (through PR #19), v6.4.0 — 11 phases,
79 tasks, and a 21-item verified baseline. The previous version was written at v6.3.0 on
2026-07-31 and never touched again while 15 PRs landed; by the rebuild over half its 161 tasks
were answered or obsolete, and it was still warning about plaintext API keys that had been gone
for three weeks while knowing nothing about the usage ceilings that now govern the app. See
`NEXT-SESSION.md` at the repo root for the current handoff.

## How to read it
- **Phases** group work by theme. Each carries a note explaining *why* the phase exists.
- **Tasks** cite the file/line/commit they came from wherever possible.
- **Tags** (SEC, QA, DOCS, …) classify the kind of work; the tag key renders in the UI.
- Tasks marked `done: true` are the **verified baseline** at the time of writing —
  real, shipped, confirmed in source.

## Storage contract
State is `{ taskId: null | "legacy" | ISO-timestamp }`:
- `null` — not done
- `"legacy"` — done before timestamp tracking existed (baseline; excluded from velocity)
- ISO string — completed at that moment; drives velocity, pace, and ETA

Persisted via `window.storage` under a per-app key. `migrate()` accepts the older
boolean format, so nothing is lost when a v1 tracker is upgraded.

## Keeping it honest
When you finish something, tick it — the timestamp is what makes velocity real. When you
find something new that's grounded in the code, add it. **A tracker that drifts from the
repo is worse than no tracker**, because it manufactures false confidence about what's
done. Same rule the trackers themselves apply to stale data.

## Where this belongs
Per the Nymfarious canon, every app carries one of these, and they are all surfaced
together in **Master DevTools (Mantis)** — not Mini DevTools. See the landing-page repo's
`docs/` for the cross-repo canon.
