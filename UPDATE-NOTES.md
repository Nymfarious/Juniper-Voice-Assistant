# Juniper Voice Assistant v6.3.0 Update Notes

**Release Date:** December 30, 2025  
**Type:** Polish & Bug Fixes

---

## What Changed

### 1. UI Text Updates
| Element | Before | After |
|---------|--------|-------|
| Tab title | "Juniper v6.2.1" | "Juniper Voice Assistant" |
| Subtitle | "Your AI Voice Assistant" | "Your Voice Assistant" |
| Speak button | "Say" | "SPEAK" |
| Stop button | "Stop" | "STOP" |
| Card title | "Quick Speak" | "Speak Aloud" |
| Toolbar button | "AI" | "Smart" |
| Modal title | "AI Agents" | "Smart Features" |
| Script modal | "Show in Quick Speak?" | "Show in Speak Aloud?" |
| Intro text default | "...an AI voice assistant..." | "...a voice assistant..." |

### 2. Bug Fixes
- **Button hover jumping FIXED** - Hotkey buttons no longer jump/resize when hovered
  - Added `min-height: 72px` to hotkey buttons
  - Changed `.full-text` from `display: none/block` to `opacity: 0/1`
  - This reserves space for the full text, preventing layout shifts

- **Input field clearing** - "Type Anything" field now clears on page load/refresh
  - Added `autocomplete="off"` to prevent browser auto-fill
  - Added explicit clearing in `init()` function

### 3. Branding Updates
- **Favicon added** - 🌿 emoji as tab icon (SVG format)
- **Apple touch icon** - Same 🌿 for mobile bookmarks
- **Removed "AI" from user-facing text** - Per request to not scare users away
- **Version bumped** - v6.2.1 → v6.3.0

### 4. Code Quality
- All CSS comments updated to v6.3.0
- All JS comments updated to v6.3.0
- Button styling made consistent (SPEAK and STOP both uppercase with letter-spacing)
- Toolbar buttons given consistent min-height

---

## Files Changed

```
index.html          ← Major UI text changes, favicon, title
src/css/styles.css  ← Button hover fix, version update
src/js/app.js       ← Input clearing, intro text default
```

## Files Unchanged
```
src/css/modals.css
src/css/voice.css
src/css/scripts.css
src/css/agents.css
src/js/helpers.js
src/js/speech.js
src/js/ui.js
src/js/scripts.js
src/js/data.js
.github/workflows/pages.yml
```

---

## Deployment Steps

1. **Replace files** in your local repo
2. **Commit and push:**
   ```bash
   git add -A
   git commit -m "v6.3.0: Polish, bug fixes, remove AI branding"
   git push origin main
   ```
3. **Wait for GitHub Actions** to deploy

---

## Testing Checklist

- [ ] Tab shows 🌿 favicon
- [ ] Tab title shows "Juniper Voice Assistant"
- [ ] Subtitle says "Your Voice Assistant" (no "AI")
- [ ] SPEAK button (all caps) works
- [ ] STOP button (all caps) works
- [ ] "Speak Aloud" card title visible
- [ ] Hotkey buttons don't jump on hover
- [ ] Input field is empty on page load
- [ ] Toolbar shows "Smart" instead of "AI"
- [ ] Modal shows "Smart Features" instead of "AI Agents"
- [ ] Footer shows v6.3.0

---

## Next Version: StarSeed (Robin's Clone)

After v6.3.0 is stable, we will:
1. Clone the repo → StarSeed
2. Apply dragonfly color palette
3. Embed Robin's ElevenLabs API key
4. Lock to Robin's custom voice only
5. Add speed button (prominent placement)
6. Add pitch control
7. Add laugh button (express emotion)
8. Twilio integration planning

---

*Last updated: v6.3.0*
