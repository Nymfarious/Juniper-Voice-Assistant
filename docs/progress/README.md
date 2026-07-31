# Juniper Voice Assistant — Progress Tracker

`JuniperTracker.jsx` is this repo's progress tracker: a self-contained React component whose
task list is **grounded in real files, lines, and commits in this repo** — not a wish
list. It was previously an artifact living outside version control; this is its home.

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
