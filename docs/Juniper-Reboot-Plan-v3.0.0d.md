# 🌿 Juniper Voice Assistant — Reboot Plan

**Version:** 3.0.0d  
**Date:** February 16, 2026  
**Owner:** Shannon (Static Karma Studios)  
**Planning Partner:** Claude Chat | **Builder:** CeCe (Claude Code)

### Version History
| Version | Date | Changes |
|---------|------|---------|
| 3.0.0a | Feb 16 | Initial phase outline, architecture decisions |
| 3.0.0b | Feb 16 | Full phase plan, Capacitor deep-dive, Playwright agents, theme system, Auto Boilerplate specs |
| 3.0.0c | Feb 16 | AI Task Timer, Twilio stub, BYOK stub, DiscoveryCharts theme capture |
| 3.0.0d | Feb 16 | Hybrid call recording, Voice Lab, pronunciation system, expression customization, capture mode, PII warnings, repo strategy (new repo), workflow charts, MiniDevTools AI questions, Python backend expansion |

---

## 1. The Vision

Juniper is an **accessibility communication tool** for people with speech conditions — giving users their voice back through AI-powered TTS with cloned voices, quick responses, call scripts, and smart features.

**The bigger picture:** First app in a planned **suite of affordable accessibility tools** for care facilities, group homes, and individuals who can't afford expensive assistive tech. Shannon's mother spent her final months in a group home where tools like this didn't exist because they were too expensive. Every architectural decision (boilerplate, auth, theming) ensures the next tool in the suite takes days, not months.

**This is not a full reboot.** Juniper v6.3.0 and Robin's Voice Assistant v1.0.0 both work. We're combining them into one unified codebase, modernizing the architecture, adding Capacitor for Android, and building the shared component framework that powers everything going forward.

---

## 2. Repo Strategy

**Decision: New Repo**

| Repo | Action |
|------|--------|
| `Nymfarious/juniper` | **NEW** — React + Vite + TS + Capacitor. All new code lives here. |
| `Nymfarious/Juniper-Voice-Assistant` | **Archive** — mark as archived on GitHub. README updated: "Superseded by Juniper v3 →" |
| `Nymfarious/Robins-Voice-Assistant` | **Archive** — same treatment. |
| Juniper API (Vercel, existing) | **No change** — Python backend stays deployed. New app calls the same endpoints. |

**Why new repo:** Current apps are vanilla HTML/CSS/JS with no build step. You can't incrementally add React, Capacitor, and TypeScript to that. The *features* port over (logic, API calls, button configs). The *code* is new. Clean git history, clean dependencies, no legacy baggage. Cleaner URL too: `nymfarious.github.io/juniper`.

---

## 3. Current State (What We're Porting)

### Juniper v6.3.0 — Working Features to Port
- ElevenLabs TTS with voice selection (male/female, US/UK)
- Web Speech API (STT)
- Quick response buttons: Yes / No / Repeat / Slower / Thanks
- Personal info: name, DOB, phone, address, insurance, pharmacy
- Call scripts: Doctor, Pharmacy, Transport, Insurance, Custom
- Script builder with template tokens ([FIRST], [LAST], [DOB], etc.)
- Smart Features: Scribe (call summaries), Smart Response (auto-answer)
- Voice speed control (0.8x–1.2x)
- Script history
- localStorage for all data

### Robin's Voice Assistant v1.0.0 — Robin-Specific Features to Port
- Robin's cloned voice via ElevenLabs
- Dragonfly theme (cyan/teal)
- Expression buttons: 😄 light chuckle, 😂 full laugh, 🤭 amused giggle
- Simplified UX

### Juniper API (Vercel Backend — Stays As-Is)
- `POST /api/speak` — ElevenLabs TTS proxy (user never sees API key)
- `POST /api/generate-script` — Claude AI script generation
- `GET /api/expression` — Expression sounds (laughs, sighs, etc.)
- Reseller model: Shannon manages API keys, users just use the app

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     JUNIPER v3.0                              │
│              React + Vite + TypeScript + Capacitor            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   PUBLIC MODE          ROBIN MODE          DEV MODE          │
│   Demo voices          Robin's clone       MiniDevTools      │
│   Generic scripts      Her data/themes     AI Questions      │
│   Sign-up CTA          Expressions 😄      Workflow Health   │
│   BYOK option          Custom recordings   Mock data         │
│                        Always free         Verbose logging   │
│                                                              │
│   ─────────────────── SHARED CORE ───────────────────        │
│                                                              │
│   ElevenLabs Conversational AI · Web Speech API              │
│   Quick Response Buttons · Call Script Engine                 │
│   Personal Info Manager · Smart Features (Scribe/Auto-Ans)   │
│   Voice Lab (speed/pitch/stability/pronunciation)            │
│   Call Recording (hybrid dual-stream)                        │
│   Capture Mode ("I'm listening" pause + record)              │
│   AI Task Timer · Twilio Phone Bridge (stubbed)              │
│                                                              │
│   ─────────── AUTO BOILERPLATE (extractable) ────────        │
│                                                              │
│   AuthGate · HelpPanel · FeedbackModal · ExportButton        │
│   SettingsManager · ThemeProvider · MiniDevTools              │
│   ToastSystem · TaskTimer · BYOKManager                      │
│   TranscriptSaver (with PII warnings)                        │
│                                                              │
│   ───────────────── DEPLOYMENT ──────────────────            │
│                                                              │
│   Web (browser) · Android (Capacitor) · Vercel API (Python)  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mode Detection
- `VITE_APP_MODE=public|robin|dev`
- Robin mode: her voice, her data, her expressions, her theme, always free
- Public mode: demo voices, generic scripts, sign-up CTA, BYOK option
- Dev mode: MiniDevTools visible, AI Questions panel, Workflow Health overlay

---

## 5. Voice Lab

A dedicated screen (Settings → Voice Lab, or direct route for power users) where users test, tune, and save all voice settings. Think of it as a sound check before going on stage.

### 5.1 Voice Parameters

| Parameter | Control | ElevenLabs Param | Range |
|-----------|---------|-----------------|-------|
| Speed | Slider | `speed` | 0.8x – 1.2x |
| Pitch | Slider | Web Audio API pitch shift | -4 to +4 semitones |
| Stability | Slider | `stability` | 0.0 (expressive) – 1.0 (monotone) |
| Style | Slider | `style` | 0.0 (neutral) – 1.0 (dramatic) |
| Speaker Boost | Toggle | `use_speaker_boost` | on/off |

Users adjust these in Voice Lab, hear the result in real-time ("Test" button speaks a sample phrase), and save to Settings. All changes persist and apply globally.

### 5.2 Pronunciation System

**Step 1: Retry**
Juniper speaks the word. User taps "🔄 Retry" — ElevenLabs regenerates with slightly shifted parameters. Non-deterministic output means each retry sounds different. User keeps retrying until it sounds right, then taps "✅ Accept." The accepted audio gets cached.

**Step 2: Phonetic Override (if retry fails)**
User types how it sounds: "Wojciechowski" → "Voy-cheh-HOV-ski". Juniper replaces the word in the TTS request with the phonetic version. Saved to a pronunciation dictionary.

```json
{
  "Wojciechowski": "Voy-cheh-HOV-ski",
  "Lipitor": "LIP-ih-tor",
  "Xarelto": "zah-REL-toh",
  "Dr. Patel": "Doctor Puh-TEL"
}
```

The dictionary is stored in localStorage / Capacitor Preferences. The `/api/speak` endpoint receives text, checks for overrides, substitutes before calling ElevenLabs. The dictionary also helps Scribe — when transcribing, known words get auto-corrected.

### 5.3 Expression Customization

Users can:
- **Remove** an expression they don't use
- **Reassign** an expression button to a different sound
- **Record their own** — tap 🎤, speak/laugh naturally, save as that button's sound

Robin recording her own laugh means the 😄 button plays *her actual laugh*, not an AI approximation. This is deeply personal and powerful for an accessibility tool.

Expression recordings saved locally (Capacitor Filesystem) or to Supabase when auth is active.

### 5.4 Voice Lab UI (Simple)

```
┌─────────────────────────────────────────┐
│  🎤 Voice Lab                           │
│                                         │
│  Voice: Robin's Clone ▾                 │
│                                         │
│  Speed:     ●━━━━━━━━━━━━○  1.0x       │
│  Pitch:     ━━━━━━●━━━━━━  +0          │
│  Stability: ━━━━━━━━●━━━━  0.65        │
│  Style:     ━━━●━━━━━━━━━  0.25        │
│  Boost:     [ON]                        │
│                                         │
│  [🔊 Test "Hello, my name is Robin"]    │
│                                         │
│  ─── Pronunciations ───                 │
│  Wojciechowski → "Voy-cheh-HOV-ski" ✏️  │
│  Lipitor → "LIP-ih-tor" ✏️              │
│  [+ Add word]                           │
│                                         │
│  ─── Expressions ───                    │
│  😄 Light chuckle [🔊] [🎤 Record] [✏️]│
│  😂 Full laugh     [🔊] [🎤 Record] [✏️]│
│  🤭 Amused giggle  [🔊] [🎤 Record] [✏️]│
│  [+ Add expression]                     │
│                                         │
│  [💾 Save to Settings]                  │
└─────────────────────────────────────────┘
```

---

## 6. Call Recording (Hybrid Dual-Stream)

### 6.1 How It Works

**Stream 1: Juniper's TTS Output** (clean digital capture)
- Captured via Web Audio API before it hits the speaker
- Every button tap, script line, expression sound
- Crystal clear, timestamped per action
- Available on both web and Capacitor

**Stream 2: Device Mic** (ambient capture)
- Captures the other person's voice (doctor, pharmacy, etc.)
- Captures Robin's own natural voice if she speaks aloud
- Background noise filtering where possible
- Continuous during "call mode"
- Capacitor: `capacitor-voice-recorder` for native mic access
- Web: Web Speech API / MediaRecorder as fallback

### 6.2 Capture Mode ("Let Me Listen")

A dedicated pause state during calls:

1. Robin taps the "🎙️ Capture" button (or a dedicated pause/listen button)
2. Juniper says: *"Go ahead, I'm listening"* (or user-chosen phrase)
3. App switches to recording-only mode — mic is hot, Juniper is silent
4. The other person speaks (or Robin speaks naturally)
5. Everything is captured on Stream 2
6. Robin taps "Continue" when ready — Juniper resumes the script

This is both a **pause** and a **capture moment**. The AI brain (Scribe) can later transcribe what was said during capture mode and extract information (appointment times, medication names, callback numbers).

### 6.3 Pause System (Two Levels)

**Short pauses (SSML):** Natural breathing pauses within Juniper's speech. Inserted via ElevenLabs SSML: `<break time="1.5s"/>`. Juniper sounds natural, not robotic. Automatic in generated scripts, user can add/adjust in script editor.

**Long pauses (Capture Mode):** Robin controls when to pause and when to resume. [WAIT] token in scripts marks where capture mode activates. Robin taps Continue when the other person finishes.

Script editor syntax:
```
"Hello, my name is [FULL_NAME]. <pause> I'm calling about a prescription refill."
                                  ↑ SSML (1.5s natural pause in audio)

"My date of birth is [DOB]. [WAIT] My insurance ID is [INSURANCE]."
                             ↑ App pauses. Capture mode. Robin taps Continue.
```

### 6.4 Post-Call Flow

```
CALL ENDS → Recording stops → Post-call screen

┌─────────────────────────────────────────┐
│  📝 Call Complete                       │
│                                         │
│  Duration: 4:32                         │
│  Script: "Pharmacy Refill"              │
│                                         │
│  [🤖 Transcribe]  [💾 Save Audio]      │
│                                         │
│  (transcription runs, TaskTimer shows)  │
│                                         │
│  TRANSCRIPT:                            │
│  [Juniper/Robin]: Hello, my name is     │
│  Robin. I'm calling about a refill.     │
│                                         │
│  [Other]: What's your date of birth?    │
│                                         │
│  [Juniper/Robin]: January 15, 1968.     │
│                                         │
│  [Robin (natural)]: Thank you so much.  │
│                                         │
│  ⚠️ This transcript may contain PII    │
│  (names, DOB, insurance numbers).       │
│  Share only with trusted recipients.    │
│                                         │
│  Save as:                               │
│  [📱 Phone] [☁️ Cloud] [📤 Share] [🗑️] │
└─────────────────────────────────────────┘
```

### 6.5 Save Options

| Option | How | When |
|--------|-----|------|
| **Phone (.md)** | Capacitor Filesystem → `/Juniper/transcripts/YYYY-MM-DD-title.md` | Always available on Android |
| **Cloud** | POST to Supabase `transcripts` table | When auth is active |
| **Share** | Android share sheet via `@capacitor/share` — text/email/message | Always on Android |
| **Delete** | Discard audio + transcript entirely | Always |

**PII Warning:** Shown before every save/share action. Transcripts contain names, DOB, insurance IDs, phone numbers, medication names. The warning is brief but clear.

### 6.6 Python Backend (New Endpoints)

```
POST /api/record    — Save recording metadata + audio to storage
GET  /api/record    — Retrieve recordings list or specific recording
DELETE /api/record  — Remove a recording

POST /api/scribe    — Send audio → transcription → Claude summarization
                      Returns: { transcript, summary, action_items,
                                 next_appointment, medications_mentioned }
```

Scribe uses the pronunciation dictionary to improve transcript accuracy — if it hears something garbled near a known word, it auto-corrects.

---

## 7. AI Task Timer

Subtle countdown/estimate during AI operations. Inspired by the Windows file copy timer.

### Implementation
- Baseline estimates per task type (TTS: 1-3s, script gen: 5-12s, transcription: 8-15s)
- Learns actual durations from user's device — rolling average stored locally
- At 2x expected: "Taking longer than usual..."
- At 4x expected: "May be stuck — Retry?" button
- Never shows for tasks under 1 second
- Small, inline, never a blocking modal
- Boilerplate component — every app in the suite gets it

---

## 8. MiniDevTools + AI Questions

### 8.1 MiniDevTools Panel (Dev Mode Only)
- localStorage inspector
- API call log with response times
- Feature flags toggle
- Performance metrics
- Workflow Health status
- AI Questions queue
- Toggle with keyboard shortcut or floating button

### 8.2 AI Questions

The Playwright QA agent and the app itself notice things and queue questions for the developer. Passive — never interrupts. A badge count on the MiniDevTools icon.

**Priority Filter:**

| Level | Shows By Default | Example |
|-------|-----------------|---------|
| 🔴 Error | Yes | "Expression button 😄 returned 404 — is voice ID correct?" |
| 🟡 Anomaly | Yes | "Script generation averaged 28s today (normal: 8s)" |
| 🔵 UX concern | Collapsed | "Two Save buttons visible on same screen" |
| ⚪ Suggestion | Collapsed | "User never taps 'Slower' button — consider hiding?" |

Each question has: **[Answer]** / **[Dismiss]** / **[Snooze]** actions. Answers get saved so the same question doesn't repeat. Robin never sees any of this — dev mode only.

### 8.3 Workflow Health Charts

Visual left-to-right flow charts showing app workflows. Dual purpose:

**User view (Help panel):** Clean step-by-step guide.
```
[Select Voice] → [Type Message] → [Tap Speak] → [Adjust Speed]
```

**Dev view (MiniDevTools overlay):** Same chart with test status.
```
[Select Voice] → [Type Message] → [Tap Speak] → [Adjust Speed]
     ✅              ✅              ⚠️ 4.2s        ✅
```

The Playwright agent runs workflow tests on push (GitHub Actions) or on-demand. Results saved as JSON. The app reads the JSON to render status per step.

Workflow definitions live as markdown specs (Shannon writes these):
```markdown
# Workflow: Create and Speak a Script
1. Navigate to Scripts tab
2. Select category (Doctor/Pharmacy/etc.)
3. Choose template or tap "Generate with AI"
4. Preview script with token replacements
5. Tap "Speak" — Juniper reads the script
6. Tap "Save" — script added to history
```

The Planner agent reads these specs, the Generator creates Playwright tests, the Healer fixes them when UI changes.

---

## 9. Theme System

### 9.1 Shipped Themes

| Theme | Source | Aesthetic |
|-------|--------|-----------|
| **Juniper** (default) | New design | Forest greens + warm earth tones, clean, accessible |
| **Dragonfly** | Robin's v1.0.0 | Cyan/teal + deep slate, warm, personal |
| **Vintage Cartographer** | DiscoveryCharts capture | Parchment, brass, leather, gold-leaf (full style guide available) |
| **Slate Ember** | Shannon's signature | Dark charcoal + orange/amber |
| **High Contrast** | Accessibility | Black/white + yellow, WCAG AAA |

### 9.2 Theme Token Format

Every theme normalizes to a standard JSON structure with `tokens` (required: colors, fonts, radii) and `custom` (theme-specific extras like DiscoveryCharts' brass/leather/parchment). ThemeProvider reads the file, applies CSS custom properties.

### 9.3 Theme Capture Workflow
1. Document source app's styles (Shannon has proven this with DiscoveryCharts)
2. Extract CSS custom properties, colors, fonts, spacing
3. Map to standard token format
4. Save as `themes/{name}.theme.json`
5. ThemeProvider applies it

---

## 10. Auto Boilerplate Components

Built during Juniper, extracted for every future app in the suite.

| Component | What It Does | Super-Stub → Active |
|-----------|-------------|---------------------|
| **AuthGate** | Login/signup UI | Fake session → Supabase auth (env var flip) |
| **HelpPanel** | Slide-out, renders markdown, searchable | Immediate |
| **FeedbackModal** | Bug/Feature/General tabs | localStorage → Supabase POST |
| **ExportButton** | Context-aware downloads (PDF/JSON/CSV) | Immediate → + cloud backup |
| **SettingsManager** | Theme, voice, a11y prefs | localStorage → Supabase profile sync |
| **ThemeProvider** | CSS variables from theme JSON | Immediate |
| **MiniDevTools** | Dev-mode diagnostics, AI Questions, Workflow Health | Immediate |
| **ToastSystem** | Queued notifications, accessible | Immediate |
| **TaskTimer** | Adaptive AI operation countdown | Immediate, learns over time |
| **BYOKManager** | API key input/storage | localStorage → encrypted Supabase |
| **TranscriptSaver** | Save/share transcripts with PII warnings | Local → Cloud → Share sheet |

---

## 11. Python Backend (Vercel Serverless)

### Existing Endpoints (No Changes)

| Endpoint | What It Does |
|----------|-------------|
| `POST /api/speak` | ElevenLabs TTS proxy |
| `POST /api/generate-script` | Claude AI script generation |
| `GET /api/expression` | Expression sounds |

### New Endpoints (Added Per Phase)

| Endpoint | What It Does | Phase |
|----------|-------------|-------|
| `GET /api/health` | Backend health check for MiniDevTools | Phase 1 |
| `POST /api/speak` (enhanced) | Add pronunciation override substitution before calling ElevenLabs, SSML pause injection | Phase 2 |
| `POST /api/record` | Save/retrieve/delete call recordings | Phase 4 |
| `POST /api/scribe` | Transcribe audio → summarize with Claude → extract action items | Phase 4 |
| `POST /api/call` | Twilio outbound call (stubbed) | Future |
| `POST /api/feedback` | Receive feedback from app | Phase 7 |

All Python. Same Vercel serverless pattern. Same repo as existing API.

---

## 12. Capacitor (Android)

### Why Capacitor
- Native mic/speaker (not browser-mediated) — critical for recording
- Google Play Store distributable, sideloadable at care facilities
- Same React codebase deploys to web AND Android
- Opens door to Twilio phone integration, share sheet, filesystem access

### Key Plugins

| Plugin | Purpose |
|--------|---------|
| `capacitor-voice-recorder` | Native mic, call recording Stream 2 |
| `@capacitor/text-to-speech` | Offline TTS fallback |
| `@capacitor/haptics` | Vibration on button press (accessibility) |
| `@capacitor/splash-screen` | App launch screen |
| `@capacitor/app` | Lifecycle (background/resume) |
| `@capacitor/preferences` | Native key-value storage |
| `@capacitor/filesystem` | Save transcripts as .md files |
| `@capacitor/share` | Android share sheet for transcripts |

### Prerequisites
- Android Studio (free), JDK 17+, Android SDK

### Build Path
Capacitor only (no Ionic). Full control over UI. Add Ionic later only if needed.

---

## 13. Testing (Playwright Agents via CeCe)

### Setup
```bash
npm install -D @playwright/test
npx playwright install
claude mcp add playwright --command "npx @playwright/mcp@latest"
npx playwright generate-agents
```

### Three Agents
- **Planner** — explores app, writes test plans
- **Generator** — converts plans → Playwright tests
- **Healer** — auto-fixes tests when UI changes

### Shannon's Workflow
1. Write workflow specs in markdown (tech writer superpower)
2. Planner suggests edge cases
3. Generator creates Playwright tests
4. Tests run on push via GitHub Actions
5. Healer fixes broken tests automatically
6. Results feed into MiniDevTools Workflow Health panel

---

## 14. Phase Plan

### Phase 0: Foundation (1 session)
- [ ] Create `Nymfarious/juniper` repo
- [ ] Archive old repos with "Superseded by" notes
- [ ] `npm create vite@latest juniper -- --template react-ts`
- [ ] Install Tailwind, React Router, Lucide React
- [ ] Install Capacitor core + CLI, init, add Android platform
- [ ] Configure environment variables
- [ ] Set up GitHub Actions → Pages + Vercel
- [ ] Create folder structure
- [ ] Add `GET /api/health` Python endpoint
- [ ] Verify: builds, deploys to Pages + Vercel, `npx cap sync` succeeds

### Phase 1: Shell + Super-Stubs (2 sessions)

**1A: Layout + Navigation**
- [ ] App shell: header, content, bottom nav (mobile-first)
- [ ] Routes: Home, Voice, Scripts, Info, Settings, Help
- [ ] No duplicate nav
- [ ] Mode indicator badge
- [ ] Responsive layout

**1B: Auto Boilerplate**
- [ ] All super-stubs: Auth, Help, Feedback, Export, Settings, Theme, DevTools, Toast, TaskTimer, BYOK, TranscriptSaver
- [ ] ThemeProvider with Juniper + Dragonfly + Vintage Cartographer
- [ ] MiniDevTools with AI Questions panel (empty queue for now)
- [ ] Workflow chart component (static, user-guide version)
- [ ] Playwright seed test — app loads, nav works, stubs render

### Phase 2: Core Voice (2–3 sessions)

**2A: ElevenLabs + Voice Controls**
- [ ] Connect to existing Vercel API (`/api/speak`, `/api/expression`)
- [ ] Voice selection UI
- [ ] Streaming TTS, audio playback state management
- [ ] Speed control (0.8x–1.2x)
- [ ] Recording Stream 1 setup (Web Audio API captures TTS output)
- [ ] Enhance `/api/speak` — pronunciation override substitution, SSML pause injection

**2B: Speech Input + Mic**
- [ ] Web Speech API for STT
- [ ] Capacitor voice recorder for native mic (Android)
- [ ] `useMicrophone()` hook — works on both web and Capacitor
- [ ] Audio visualizer
- [ ] Mic permissions handling with accessible feedback
- [ ] Fallback: text input always available

**2C: Voice Lab**
- [ ] Settings → Voice Lab route
- [ ] Speed, Pitch, Stability, Style, Speaker Boost sliders
- [ ] "Test" button — speaks sample with current settings
- [ ] Pronunciation retry (🔄 re-generate, ✅ accept)
- [ ] Phonetic override (✏️ type how it sounds)
- [ ] Pronunciation dictionary (save/edit/delete entries)
- [ ] Expression customization: remove, reassign, record your own via mic
- [ ] Save all settings — persist to localStorage / Capacitor Preferences

**2D: Expression Buttons (Robin Mode)**
- [ ] Expression grid: 😄 😂 🤭 + additional from API
- [ ] Custom recorded expressions play user's actual audio
- [ ] Haptic feedback on press (Capacitor)
- [ ] Add/edit/remove expression buttons

### Phase 3: Communication Features (2 sessions)

**3A: Quick Responses + Personal Info**
- [ ] Port quick response buttons from v6.3.0
- [ ] Personal info manager (name, DOB, phone, address, insurance, pharmacy)
- [ ] Multiple insurance/pharmacy profiles
- [ ] Auto-fill tokens in scripts and responses
- [ ] Custom button creation

**3B: Call Script Engine**
- [ ] Script categories: Doctor, Pharmacy, Transport, Insurance, Custom
- [ ] Script builder with template tokens
- [ ] AI-powered generation (via existing `/api/generate-script`)
- [ ] SSML `<pause>` insertion in script editor
- [ ] `[WAIT]` token — marks Capture Mode points in scripts
- [ ] Script playback: step through, Juniper speaks each line
- [ ] Tap-to-continue at [WAIT] points
- [ ] Script history with timestamps
- [ ] Export scripts as PDF
- [ ] Workflow charts for key script flows (user-facing)

### Phase 4: Agentic Brain + Recording (3 sessions)

**4A: Smart Features**
- [ ] ElevenLabs Conversational AI integration
- [ ] Natural conversation mode
- [ ] Scribe: post-call summary from transcript
- [ ] Smart Response: auto-answer with preview
- [ ] Smart Suggestions
- [ ] TaskTimer integrated into all AI operations

**4B: Call Recording (Hybrid Dual-Stream)**
- [ ] Stream 1: TTS output capture (Web Audio API)
- [ ] Stream 2: Device mic capture (Capacitor / MediaRecorder)
- [ ] Capture Mode: "🎙️ I'm Listening" button
  - Juniper says chosen phrase ("Go ahead, I'm listening")
  - Mic records other person / Robin's natural voice
  - Robin taps Continue to resume script
- [ ] Timestamp alignment between streams
- [ ] Call end → post-call screen

**4C: Transcription + Save**
- [ ] New Python endpoint: `POST /api/scribe`
- [ ] Speaker diarization (Juniper vs Robin vs Other)
- [ ] Pronunciation dictionary assists transcription accuracy
- [ ] Post-call UI: Transcribe / Save Audio buttons
- [ ] TranscriptSaver: phone (.md) / cloud / share sheet / delete
- [ ] PII warning before save/share
- [ ] New Python endpoint: `POST /api/record` (CRUD for recordings)

### Phase 5: Polish, Docs, UI (2 sessions)

**5A: Visual Refresh**
- [ ] Apply final themes with micro-animations
- [ ] Accessibility audit (WCAG AA — this is an accessibility tool)
  - Keyboard navigation
  - Screen reader support
  - Focus indicators
  - Reduced motion support
  - Large touch targets (48px minimum)
- [ ] Dark mode
- [ ] Mobile layout polish for Capacitor

**5B: Documentation + Feedback**
- [ ] In-app help content (Shannon writes)
  - Getting started
  - Voice setup + Voice Lab guide
  - Script builder tutorial
  - Call recording guide
  - Personal info management
  - Troubleshooting
- [ ] Workflow chart guides in Help panel
- [ ] Activate feedback stub → Supabase
- [ ] README.md, CHANGELOG.md

### Phase 6: Android Build (1–2 sessions)
- [ ] Install Android Studio
- [ ] `npx cap sync android` + `npx cap open android`
- [ ] AndroidManifest: RECORD_AUDIO, INTERNET permissions
- [ ] App icon + splash screen
- [ ] Test on emulator
- [ ] Build APK → sideload to Robin's phone
- [ ] Test: mic recording, TTS playback, share sheet, file save

### Phase 7: Activate Stubs (1–2 sessions)
- [ ] Supabase auth (flip env var)
- [ ] localStorage → Supabase migration
- [ ] Feedback → Supabase
- [ ] Recordings → cloud backup
- [ ] BYOK encryption
- [ ] Usage analytics (anonymous, opt-in)

### Future Phases (Stubbed, Not Scheduled)
- Twilio Phone Bridge — outbound calls, Juniper speaks on the line
- iOS Build — `npx cap add ios`
- Stripe/Payments — if this becomes a product
- Multi-user accounts
- Wake word ("Hey Juniper")
- Care Facility Suite — additional tools sharing boilerplate

---

## 15. Stubbed Features (In the UI, Not Active)

| Stub | What User Sees | Activates Via |
|------|---------------|---------------|
| Auth | Login/signup buttons, demo session | `VITE_SUPABASE_URL` env var |
| Phone calls | "📞 Call" button in script player | Twilio API key + `/api/call` |
| BYOK | API key fields in Settings | Already functional as super-stub |
| Payments | "Upgrade" CTA (public mode) | Stripe integration |
| iOS | N/A (architecture supports it) | `npx cap add ios` + Xcode |

---

## 16. Deployment

| Environment | URL / Method | Mode |
|-------------|-------------|------|
| GitHub Pages | `nymfarious.github.io/juniper` | Public (portfolio) |
| Vercel (prod) | `juniper.vercel.app` | Robin |
| Vercel (preview) | `juniper-{branch}.vercel.app` | Testing |
| Android APK | Sideloaded / Play Store | Robin's phone |
| Local | `localhost:5173` | Dev |

---

## 17. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React + Vite + TypeScript |
| Mobile | Capacitor (no Ionic initially) |
| Styling | Tailwind CSS + CSS Variables + Theme JSON |
| Voice AI | ElevenLabs Conversational AI |
| STT | Web Speech API + capacitor-voice-recorder |
| Backend | Python serverless on Vercel |
| Phone (future) | Twilio Programmable Voice (stubbed) |
| Storage (now) | localStorage / Capacitor Preferences / Filesystem |
| Storage (later) | Supabase |
| Testing | Playwright + Claude Code Subagents |
| Transcription | Whisper / AssemblyAI via Python backend |

---

## 18. Future Suite

| App | Shares from Juniper |
|-----|---------------------|
| **Little Sister** (caregiver tool) | Auth, Help, Feedback, Themes, Export, TaskTimer, TranscriptSaver |
| **RootsGenie** (genealogy) | Auth, Help, Feedback, Themes, MiniDevTools |
| **ProveIt** (fact-checker) | Auth, Help, Feedback, Themes (retrofit) |
| **Care Facility Suite** | Everything — voice, transcripts, daily logs, meds, family comms |

---

*"Giving people their voices back — one accessible tool at a time."*  
*Made with 💚 by Shannon (Static Karma Studios)*  
*In memory of Mom.*
