# 🌿 Juniper Voice Assistant — Reboot Plan

**Version:** 3.0.0e (Planning Complete)  
**Date:** February 16, 2026  
**Owner:** Shannon (Static Karma Studios)  
**Planning Partner:** Claude Chat | **Builder:** CeCe (Claude Code)

### Version History
| Ver | Changes |
|-----|---------|
| 3.0.0a | Initial phase outline, architecture decisions |
| 3.0.0b | Full phase plan, Capacitor, Playwright agents, themes, Auto Boilerplate |
| 3.0.0c | AI Task Timer, Twilio stub, BYOK stub, DiscoveryCharts theme capture |
| 3.0.0d | Hybrid recording, Voice Lab, pronunciation, expression customization, capture mode, PII warnings, repo strategy, workflow charts, MiniDevTools AI questions, Python backend expansion |
| 3.0.0e | **Final planning version.** Corrected framing (all users, not Robin-specific). Voice cloning reality (ElevenLabs-side). Hidden AI Companion Engine. Google Play Store. ICS calendar (no OAuth). BYOK tier structure. AI-powered Theme Editor. Python throughout. |

---

## 1. The Vision

Juniper is an **accessibility communication tool** for anyone with a speech condition — giving users their voice back through AI-powered TTS with personalized voices, quick responses, call scripts, smart features, and a hidden AI companion that helps without getting in the way.

**For whom:** People with speech-affecting conditions (stroke, neurological conditions, surgery recovery, ALS, etc.), their caregivers, and the facilities that support them.

**The bigger picture:** First app in a planned **suite of affordable accessibility tools** for care facilities, group homes, and individuals who can't afford expensive assistive tech. Shannon's mother spent her final months in a group home where tools like this didn't exist because they were too expensive. Every architectural decision (boilerplate, auth, theming) ensures the next tool in the suite takes days, not months.

**This is not a full reboot.** Juniper v6.3.0 and Robin's Voice Assistant v1.0.0 both work. We're combining them into one unified codebase, modernizing the architecture, adding Capacitor for Android, and building the shared framework.

**Robin** is User #1 — the first person with a fully configured profile (cloned voice, custom expressions, personal scripts). Every feature built for Robin is available to every user. She's the inspiration and the first beta tester, not the only audience.

---

## 2. Repo Strategy

**Decision: New Repo**

| Repo | Action |
|------|--------|
| `Nymfarious/juniper` | **NEW** — React + Vite + TS + Capacitor |
| `Nymfarious/Juniper-Voice-Assistant` | **Archive** — "Superseded by Juniper v3 →" |
| `Nymfarious/Robins-Voice-Assistant` | **Archive** — same |
| Juniper API (Vercel) | **No change** — Python backend stays deployed |

**Why new:** Current apps are vanilla HTML/CSS/JS. Can't incrementally add React + Capacitor + TypeScript. Features port over. Code is new. Clean git history, clean URL: `nymfarious.github.io/juniper`.

---

## 3. User Tiers

| Tier | Voice | AI Companion | Who Pays |
|------|-------|-------------|----------|
| **Free** | Stock ElevenLabs voices via Shannon's managed API (rate limited) | Level 0–1: invisible AI + basic contextual suggestions | Shannon (capped usage) |
| **BYOK** | User's own ElevenLabs key + any voices on their account, including clones | Level 0–2: full companion, chatbot-capable if user brings LLM key | User pays their own API costs |
| **Sponsored** | Shannon's keys + pre-configured clone | Full features, always free | Shannon pays (Robin is first sponsored user) |

### Voice Cloning Reality
Voice cloning happens on **ElevenLabs' platform**, not in Juniper:
1. User goes to elevenlabs.io → uploads voice samples → trains clone → gets voice ID
2. User enters voice ID in Juniper Settings (BYOK section)
3. Juniper calls `/api/speak` with that voice ID
4. ElevenLabs returns audio in their cloned voice

For sponsored users (like Robin), Shannon does steps 1-2 on their behalf. The app includes a help article: "Want to use your own voice? Here's how to set up voice cloning on ElevenLabs and connect it to Juniper."

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     JUNIPER v3.0                              │
│              React + Vite + TypeScript + Capacitor            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   PUBLIC MODE              USER MODE           DEV MODE      │
│   (not configured)         (configured)        (Shannon)     │
│   Stock demo voices        Their voice/clone   MiniDevTools  │
│   Generic scripts          Their data/scripts  AI Questions  │
│   Sign-up CTA              Their expressions   Workflow Health│
│   BYOK option              Their theme         Mock data     │
│   Onboarding flow          Their companion     Verbose logs  │
│                                                              │
│   ─────────────────── SHARED CORE ───────────────────        │
│                                                              │
│   ElevenLabs TTS · Web Speech API · Capacitor Audio          │
│   Quick Response Buttons · Call Script Engine                 │
│   Personal Info Manager · Smart Features (Scribe/Auto-Ans)   │
│   Voice Lab · Call Recording (hybrid dual-stream)            │
│   Capture Mode · AI Task Timer                               │
│                                                              │
│   ─────────── HIDDEN AI COMPANION ───────────────            │
│                                                              │
│   Contextual suggestions · Post-call intelligence            │
│   Calendar detection · Medication tracking                   │
│   Script review · Theme Editor · Pattern learning            │
│   BYOK unlocks: deeper analysis, chatbot, GCal, notes       │
│                                                              │
│   ─────────── AUTO BOILERPLATE (extractable) ────────        │
│                                                              │
│   AuthGate · HelpPanel · FeedbackModal · ExportButton        │
│   SettingsManager · ThemeProvider · MiniDevTools              │
│   ToastSystem · TaskTimer · BYOKManager                      │
│   TranscriptSaver · CompanionEngine                          │
│                                                              │
│   ─────── STUBS (in UI, activate later) ─────────            │
│                                                              │
│   Twilio Phone Bridge · Stripe Payments                      │
│                                                              │
│   ───────────────── DEPLOYMENT ──────────────────            │
│                                                              │
│   Web · Android (Capacitor/Play Store) · Vercel API (Python) │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mode Detection
- `VITE_APP_MODE=public|user|dev`
- Public: no voice configured → demo experience, onboarding CTA
- User: voice configured → personalized, all features active
- Dev: MiniDevTools, AI Questions, Workflow Health overlay

---

## 5. Hidden AI Companion

**Philosophy: AI is hidden by default.** No chatbot, no avatar, no "How can I help you?" The user may not even know AI is involved. It just works. If the user wants more, BYOK unlocks deeper capabilities — including an optional chatbot for planning, notes, and follow-ups.

### 5.1 AI Levels

**Level 0: Invisible (always on, no API key needed)**
- Script generation from natural language
- Pronunciation optimization
- Smart Response auto-answers
- Scribe call summarization
- TaskTimer learning

**Level 1: Contextual Suggestions (free tier)**
Appear as small suggestion cards at relevant moments. One tap to accept, one tap to dismiss. Never interrupts.
- Post-call: "Follow-up detected: March 3, 2:30pm" → [Add to Calendar] [Dismiss]
- Post-call: "New medication: Metformin 500mg" → [Add to Med List] [Dismiss]
- Script review: "You might want to add your insurance ID here"
- Theme Editor: "Make it warmer" / "Bigger buttons" / "More contrast"

**Level 2: Full Companion (BYOK with LLM key)**
Everything in Level 0–1, plus:
- Chatbot for planning calls, asking questions, getting advice
- Deep transcript analysis
- GCal/calendar integration via ICS
- Follow-up notes and reminders
- Medication interaction awareness
- Pattern learning: "You usually call pharmacy Mondays — prep refill script?"
- Creative assistance (travel scripts, custom scenarios)

### 5.2 Where the Companion Plugs In

| Context | What It Does | Level |
|---------|-------------|-------|
| **Pre-call** | Generates script, pre-fills info, suggests questions to ask | 0 |
| **Pre-call** | "Want me to add this to your calendar after?" | 1 |
| **During call** | Real-time suggestions in Capture Mode | 1 |
| **Post-call** | Detects dates → offers ICS calendar event | 1 |
| **Post-call** | Detects medications → offers to track | 1 |
| **Post-call** | Creates summary, follow-up notes | 1 |
| **Post-call** | "Share summary with caregiver?" | 1 |
| **Post-call** | Deep analysis, action items, reminders | 2 |
| **Scripts** | Reviews for completeness, suggests improvements | 1 |
| **Scripts** | Suggests scripts based on patterns/calendar | 2 |
| **Voice Lab** | "I want to sound more confident" → adjusts parameters | 2 |
| **Theme Editor** | Natural language theme adjustments | 1 |
| **Settings** | "Your insurance hasn't been updated in 6 months" | 2 |
| **Daily** | Pattern-based suggestions, proactive prep | 2 |

### 5.3 Calendar Integration (No OAuth)

Instead of connecting directly to Google Calendar (complex OAuth), Juniper generates **ICS files** that work everywhere:

- **Android:** Send calendar intent → opens native calendar app → user confirms
- **Email:** Send `.ics` attachment to user's email → they tap to add
- **Share sheet:** Share the event via any app (Messages, WhatsApp, email)

No API connection. No OAuth. No permissions. Works on every phone, every calendar app. If direct GCal/Outlook integration is ever needed, it can be added later as a BYOK feature.

### 5.4 Companion Architecture

```
src/lib/companion/
├── CompanionEngine.ts        — orchestrates suggestions
├── triggers/
│   ├── postCall.ts           — analyzes transcripts
│   ├── scriptReview.ts       — reviews scripts
│   ├── calendarDetect.ts     — finds dates/appointments
│   ├── medDetect.ts          — finds medication mentions
│   ├── patternLearn.ts       — learns user habits
│   └── themeAssist.ts        — natural language theme changes
├── actions/
│   ├── generateICS.ts        — create calendar events
│   ├── saveNote.ts           — follow-up notes
│   ├── updateMedList.ts      — medication tracking
│   ├── shareWith.ts          — send to caregiver
│   └── emailICS.ts           — email calendar invite
└── ui/
    ├── SuggestionCard.tsx     — contextual suggestion UI
    ├── ThemeEditor.tsx        — AI-powered theme adjustment
    ├── CompanionChat.tsx      — BYOK chatbot (Level 2 only)
    └── CompanionSettings.tsx  — opt-in, keys, preferences
```

---

## 6. Voice Lab

Settings → Voice Lab (or direct route for power users). Sound check before going on stage.

### 6.1 Voice Parameters

| Parameter | Control | ElevenLabs Param | Range |
|-----------|---------|-----------------|-------|
| Speed | Slider | `speed` | 0.8x – 1.2x |
| Pitch | Slider | Web Audio API | -4 to +4 semitones |
| Stability | Slider | `stability` | 0.0 (expressive) – 1.0 (consistent) |
| Style | Slider | `style` | 0.0 (neutral) – 1.0 (dramatic) |
| Speaker Boost | Toggle | `use_speaker_boost` | on/off |

Real-time "Test" button. All changes persist to Settings.

### 6.2 Pronunciation System
- **Retry:** Re-generate same text with shifted parameters. Tap until it sounds right.
- **Phonetic override:** Type how it sounds. Saved to pronunciation dictionary.
- Dictionary persists, feeds into both TTS and Scribe transcription accuracy.

### 6.3 Expression Customization
- Remove, reassign, or **record your own** expressions via mic
- User's recorded laugh = their actual laugh, not AI approximation
- Stored locally (Capacitor Filesystem) or Supabase when auth active

---

## 7. Call Recording (Hybrid Dual-Stream)

### 7.1 Two Streams
- **Stream 1:** Juniper's TTS output — clean digital capture via Web Audio API
- **Stream 2:** Device mic — captures other person + user's natural voice (Capacitor)

### 7.2 Capture Mode
User taps "🎙️ I'm Listening" → Juniper says chosen phrase → mic goes hot → user taps Continue when ready. Both a pause and a capture moment.

### 7.3 Pause System
- **Short (SSML):** `<break time="1.5s"/>` — natural pauses in speech
- **Long (Capture Mode):** `[WAIT]` token — app pauses, mic records, user controls pace

### 7.4 Post-Call
- Transcribe with speaker diarization (Juniper / User / Other)
- AI Companion detects: appointments, medications, callback numbers, follow-ups
- Suggestion cards appear with one-tap actions
- Save: phone (.md) / cloud / share sheet / delete
- PII warning before every save/share

---

## 8. Theme System

### 8.1 Shipped Themes

| Theme | Aesthetic |
|-------|-----------|
| **Juniper** (default) | Forest greens + warm earth, clean, accessible |
| **Dragonfly** | Cyan/teal + deep slate (Robin's choice, available to all) |
| **Vintage Cartographer** | Parchment/brass/leather/gold (from DiscoveryCharts capture) |
| **Slate Ember** | Dark charcoal + orange/amber (Shannon's signature) |
| **High Contrast** | Black/white + yellow, WCAG AAA |

### 8.2 AI Theme Editor
In Settings. Natural language: "Make it warmer" / "Bigger text" / "More contrast" / "I want blue." AI adjusts CSS variables, user sees live preview, saves as custom theme. Level 1 companion feature (works with free tier).

### 8.3 Theme Token Format
Standard JSON with `tokens` (colors, fonts, radii) + optional `custom` (theme-specific extras). ThemeProvider reads file, applies CSS variables. Any captured stylesheet can be normalized into this format.

---

## 9. Auto Boilerplate

Built in Juniper, extracted for every future app.

| Component | What It Does |
|-----------|-------------|
| **AuthGate** | Login UI, super-stubbed → Supabase (env var flip) |
| **HelpPanel** | Slide-out, markdown-driven, searchable |
| **FeedbackModal** | Bug/Feature/General, localStorage → Supabase |
| **ExportButton** | Context-aware PDF/JSON/CSV downloads |
| **SettingsManager** | Prefs in localStorage → Supabase profile sync |
| **ThemeProvider** | CSS variables from theme JSON |
| **MiniDevTools** | Dev diagnostics, AI Questions, Workflow Health |
| **ToastSystem** | Queued notifications, accessible |
| **TaskTimer** | Adaptive AI countdown, learns over time |
| **BYOKManager** | API key input/storage, tier detection |
| **TranscriptSaver** | Save/share with PII warnings, ICS generation |
| **CompanionEngine** | Hidden AI suggestions, tiered by BYOK |

---

## 10. Python Backend (Vercel Serverless)

### Existing (No Changes)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/speak` | ElevenLabs TTS proxy |
| `POST /api/generate-script` | Claude AI script generation |
| `GET /api/expression` | Expression sounds |

### New (Per Phase)

| Endpoint | Purpose | Phase |
|----------|---------|-------|
| `GET /api/health` | Backend health for MiniDevTools | 1 |
| `POST /api/speak` (enhanced) | Pronunciation substitution, SSML injection | 2 |
| `POST /api/companion/analyze` | Send context → get suggestions | 4 |
| `POST /api/companion/action` | Execute suggestion (ICS, note, med list) | 4 |
| `POST /api/record` | CRUD for call recordings | 4 |
| `POST /api/scribe` | Transcribe → summarize → extract action items | 4 |
| `POST /api/call` | Twilio outbound (stubbed) | Future |
| `POST /api/feedback` | Receive feedback | 7 |

---

## 11. Capacitor (Android)

### Key Plugins

| Plugin | Purpose |
|--------|---------|
| `capacitor-voice-recorder` | Native mic, recording Stream 2 |
| `@capacitor/text-to-speech` | Offline TTS fallback |
| `@capacitor/haptics` | Vibration on press (accessibility) |
| `@capacitor/splash-screen` | Launch screen |
| `@capacitor/app` | Lifecycle management |
| `@capacitor/preferences` | Native key-value storage |
| `@capacitor/filesystem` | Save transcripts as .md |
| `@capacitor/share` | Android share sheet |
| `@capacitor/calendar` (or intent) | Add events to native calendar |

### Distribution
- **Sideload APK** — for beta testing, care facilities
- **Google Play Store** — $25 one-time dev account, AAB build, listing with screenshots/privacy policy, 1-3 day review

---

## 12. Testing (Playwright Agents)

### Three Agents via CeCe
- **Planner** — explores app, writes test plans
- **Generator** — converts plans → Playwright tests
- **Healer** — auto-fixes when UI changes

### Workflow Health
- Specs written in markdown by Shannon
- Tests run on push (GitHub Actions) or on-demand
- Results → JSON → MiniDevTools Workflow Health panel
- Same workflow charts appear in Help panel as user guides

---

## 13. Phase Plan

### Phase 0: Foundation (1 session)
- [ ] Create `Nymfarious/juniper` repo
- [ ] Archive old repos with redirect notes
- [ ] React + Vite + TypeScript + Tailwind
- [ ] Capacitor init + Android platform
- [ ] GitHub Actions → Pages + Vercel
- [ ] Environment variables
- [ ] Folder structure (including `lib/companion/`)
- [ ] `GET /api/health` endpoint
- [ ] Verify: builds, deploys, `npx cap sync`

### Phase 1: Shell + Super-Stubs (2 sessions)
- [ ] App shell, nav, routes (Home, Voice, Scripts, Info, Settings, Help)
- [ ] All boilerplate super-stubs
- [ ] ThemeProvider with 5 themes
- [ ] MiniDevTools with AI Questions panel
- [ ] Workflow chart component
- [ ] Playwright seed test

### Phase 2: Core Voice (3 sessions)
- [ ] ElevenLabs via Vercel API, voice selection, streaming, speed
- [ ] Enhanced `/api/speak` — pronunciation substitution + SSML
- [ ] Web Speech STT + Capacitor voice recorder + `useMicrophone()` hook
- [ ] Audio visualizer, permissions, text input fallback
- [ ] Recording Stream 1 (TTS capture via Web Audio API)
- [ ] Voice Lab: all sliders, pronunciation retry+phonetic, dictionary
- [ ] Expression customization: remove, reassign, record your own
- [ ] Haptic feedback (Capacitor)

### Phase 3: Communication (2 sessions)
- [ ] Quick responses, personal info, auto-fill tokens, custom buttons
- [ ] Script engine: categories, builder, AI generation, SSML pauses
- [ ] `[WAIT]` capture mode points in scripts
- [ ] Script playback with tap-to-continue
- [ ] Script history, PDF export
- [ ] Workflow chart guides for key flows

### Phase 4: Agentic Brain + Recording (3 sessions)
- [ ] ElevenLabs Conversational AI, Scribe, Smart Response, Smart Suggestions
- [ ] TaskTimer on all AI operations
- [ ] Hybrid dual-stream recording (Stream 1 + Stream 2)
- [ ] Capture Mode ("🎙️ I'm Listening")
- [ ] `POST /api/scribe` — transcription + summarization
- [ ] `POST /api/record` — recording CRUD
- [ ] `POST /api/companion/analyze` + `/action`
- [ ] AI Companion Level 0-1: contextual suggestions
- [ ] Calendar detection → ICS generation (no OAuth)
- [ ] Medication detection → tracking
- [ ] TranscriptSaver: phone / cloud / share / delete + PII warning
- [ ] Post-call flow with suggestion cards

### Phase 5: Polish + Docs (2 sessions)
- [ ] Theme finalization, AI Theme Editor
- [ ] Accessibility audit (WCAG AA)
- [ ] Dark mode, mobile polish
- [ ] In-app help (Shannon writes)
- [ ] Workflow guides in Help panel
- [ ] Feedback activation, README, CHANGELOG

### Phase 6: Android (1–2 sessions)
- [ ] Android Studio setup
- [ ] Permissions, icon, splash
- [ ] Emulator test → APK build → sideload test
- [ ] Google Play Store listing (screenshots, privacy policy, description)
- [ ] AAB build for Play Store submission

### Phase 7: Activate Stubs (1–2 sessions)
- [ ] Supabase auth
- [ ] localStorage → Supabase migration
- [ ] BYOK encryption
- [ ] AI Companion Level 2 (BYOK chatbot)
- [ ] Usage analytics (anonymous, opt-in)

### Future (Stubbed)
- Twilio Phone Bridge
- iOS build
- Stripe payments
- Multi-user accounts
- Wake word ("Hey Juniper")
- Translation mode
- Care Facility Suite

---

## 14. Deployment

| Environment | URL / Method | Mode |
|-------------|-------------|------|
| GitHub Pages | `nymfarious.github.io/juniper` | Public |
| Vercel (prod) | `juniper.vercel.app` | User (production) |
| Vercel (preview) | `juniper-{branch}.vercel.app` | Testing |
| Android (sideload) | APK file | Beta testing |
| Google Play Store | Play Store listing | Public distribution |
| Local | `localhost:5173` | Dev |

---

## 15. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React + Vite + TypeScript |
| Mobile | Capacitor (no Ionic) |
| Styling | Tailwind CSS + CSS Variables + Theme JSON |
| Voice AI | ElevenLabs (TTS, Conversational AI) |
| STT | Web Speech API + capacitor-voice-recorder |
| Backend | Python serverless on Vercel |
| AI Companion | Claude API (managed + BYOK) |
| Phone (future) | Twilio (stubbed) |
| Storage (now) | localStorage / Capacitor Preferences + Filesystem |
| Storage (later) | Supabase |
| Calendar | ICS files (no OAuth) |
| Testing | Playwright + Claude Code Subagents |
| Transcription | Whisper / AssemblyAI via Python |

---

## 16. Future Suite

| App | Shares from Juniper |
|-----|---------------------|
| **Trip Harmony** (travel planning) | Boilerplate, themes, companion engine, BYOK, Python backend patterns |
| **Little Sister** (caregiver tool) | Auth, Help, Feedback, Themes, Export, TaskTimer, TranscriptSaver, Companion |
| **RootsGenie** (genealogy) | Auth, Help, Feedback, Themes, MiniDevTools |
| **ProveIt** (fact-checker) | Auth, Help, Feedback, Themes (retrofit) |
| **Care Facility Suite** | Everything — voice, transcripts, companion, daily logs, meds, family comms |

---

*"Giving people their voices back — one accessible tool at a time."*  
*Made with 💚 by Shannon (Static Karma Studios)*  
*In memory of Mom.*
