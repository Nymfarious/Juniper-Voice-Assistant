# 🌿 Juniper Voice Assistant — Reboot Plan
**Date:** February 16, 2026  
**Status:** Planning  
**Owner:** Shannon (Static Karma Studios)  
**Planning Partner:** Claude Chat | **Builder:** CeCe (Claude Code)

---

## What Is Juniper?

Juniper is an **accessibility communication tool** — a voice assistant that gives people with speech conditions their voice back. Built originally for Shannon's friend Robin, who has a condition affecting her speech, Juniper lets users communicate during phone calls using text-to-speech with their own cloned voice, quick-response buttons, call scripts, and smart AI features.

**Current state:** Two separate repos (Juniper v6.3.0 + Robin's Voice Assistant v1.0.0) with overlapping codebases. Vanilla HTML/CSS/JS, no framework, no build step. Blurry green UI. Deployed on GitHub Pages. Works, but needs architectural modernization, visual refresh, documentation, and Android capability.

**Reboot goal:** One unified app with two modes (Public + Robin's), modern React/Vite architecture, fresh UI, ElevenLabs Conversational AI as the brain, super-stubbed auth and shared components from the Auto Boilerplate system, deployed to both GitHub Pages (portfolio) and Vercel (Robin's live URL). Eventually a PWA installable on Android.

---

## Architecture: Two Modes, One App

```
┌──────────────────────────────────────────────────────┐
│                   JUNIPER APP                         │
│                  (React + Vite)                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────┐        ┌──────────────┐            │
│   │ PUBLIC MODE │        │ ROBIN MODE   │            │
│   │             │        │              │            │
│   │ Demo voice  │        │ Robin's      │            │
│   │ Generic     │        │ cloned voice │            │
│   │ scripts     │        │ Her data     │            │
│   │ Sign-up CTA │        │ Expression   │            │
│   │             │        │ buttons      │            │
│   └──────┬──────┘        └──────┬───────┘            │
│          │                      │                    │
│          └──────────┬───────────┘                    │
│                     ▼                                │
│   ┌──────────────────────────────────────────┐       │
│   │          SHARED CORE                      │       │
│   │                                          │       │
│   │  • ElevenLabs Conversational AI          │       │
│   │  • Web Speech API (STT)                  │       │
│   │  • Quick Response Buttons                │       │
│   │  • Call Script Engine                    │       │
│   │  • Personal Info Manager                 │       │
│   │  • Smart Features (Scribe, Auto-Answer)  │       │
│   │  • Help System (Auto Boilerplate)        │       │
│   │  • Feedback System (Auto Boilerplate)    │       │
│   │  • Auth (Super-Stubbed)                  │       │
│   └──────────────────────────────────────────┘       │
│                     │                                │
│                     ▼                                │
│   ┌──────────────────────────────────────────┐       │
│   │        STORAGE                            │       │
│   │  Now: localStorage                        │       │
│   │  Later: Supabase (when auth goes live)    │       │
│   └──────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

### Mode Switching
- **URL-based:** `juniper.vercel.app` → Robin mode (password/pin protected)
- **URL-based:** `nymfarious.github.io/juniper` → Public/portfolio mode
- Same codebase, environment variable controls which mode loads
- Robin mode loads her voice, her data, her expression buttons
- Public mode loads demo voice, generic scripts, sign-up flow (stubbed)

---

## Phase Plan

### Phase 0: Pre-Work (Before Building)
**Goal:** Clean foundation before writing code

- [ ] Audit current Juniper v6.3.0 — inventory every feature, note what works/broken
- [ ] Audit Robin's Voice Assistant v1.0.0 — identify Robin-specific features
- [ ] Create feature matrix: what's shared, what's Robin-only, what's public-only
- [ ] Document ElevenLabs Conversational AI capabilities and pricing
- [ ] Set up new repo: `Nymfarious/juniper` (clean start)
- [ ] Initialize React + Vite project with Tailwind
- [ ] Set up GitHub Actions for Pages deployment
- [ ] Set up Vercel project linked to same repo

**Estimated time:** 1 session

---

### Phase 1: Skeleton + Super-Stubs
**Goal:** App shell with all the placeholders in the right places

**Core Structure:**
- [ ] App shell with mode detection (public vs Robin)
- [ ] Navigation layout (fix the duplicate nav issue from current version)
- [ ] Route structure: Home, Voice, Scripts, Info, Settings, Help

**Auto Boilerplate Super-Stubs** (designed to activate later):
- [ ] **Auth stub** — Login/signup UI renders, buttons work, shows "Coming soon" toast. Wired so flipping one env variable connects to Supabase.
- [ ] **Help system stub** — Help icon in nav, slide-out panel, placeholder content sections. Structure accepts markdown content files.
- [ ] **Feedback stub** — Feedback button, modal with form fields, stores to localStorage now, will POST to backend later.
- [ ] **Export stub** — Export button in relevant views, generates downloadable files (scripts as PDF, data as JSON).
- [ ] **Settings stub** — Theme toggle, voice settings, notification preferences. localStorage now, syncs to backend later.

**CSS/Design System:**
- [ ] Design tokens (colors, spacing, typography) as CSS variables
- [ ] Two theme files: Juniper (public) and Dragonfly (Robin)
- [ ] Component library: Button, Card, Modal, Toast, SlidePanel, QuickButton
- [ ] Responsive layout (mobile-first for eventual PWA)

**Deployed:** Empty shell with stubs visible at both URLs

**Estimated time:** 2 sessions

---

### Phase 2: Core Voice Engine
**Goal:** The app speaks and listens

- [ ] ElevenLabs Conversational AI integration
  - API key management (stored locally, super-stubbed for backend later)
  - Voice selection (public gets demo voices, Robin gets her clone)
  - Streaming TTS for low latency
  - Conversation mode (not just one-shot TTS)
- [ ] Web Speech API for speech-to-text input
- [ ] Audio visualizer (waveform/level indicator so user sees it's listening)
- [ ] Voice speed control (0.8x–1.2x, critical for Robin)
- [ ] Mic permissions handling with clear user feedback
- [ ] Fallback: text input always available alongside voice

**Robin-specific:**
- [ ] Expression buttons (😄 light chuckle, 😂 full laugh, 🤭 amused giggle)
- [ ] These trigger ElevenLabs to speak pre-recorded Robin expressions

**Estimated time:** 2–3 sessions

---

### Phase 3: Communication Features
**Goal:** The features that make Juniper actually useful

**Quick Response System:**
- [ ] Migrate and improve quick buttons (Yes/No/Repeat/Slower/Thanks)
- [ ] Personal info buttons (Name/DOB/Phone/Address/Insurance/Pharmacy)
- [ ] Call-type specific buttons (Appointment/Refill/Results/Reschedule/Billing/Nurse)
- [ ] Custom button creation (user adds their own)
- [ ] Buttons trigger ElevenLabs to speak the full phrase

**Call Script Engine:**
- [ ] Script categories: Doctor, Pharmacy, Transport, Insurance, Custom
- [ ] Template tokens: [FIRST], [LAST], [DOB], [PHONE], etc.
- [ ] Script builder UI (improved from current version)
- [ ] Script playback: step through a script, Juniper speaks each line
- [ ] Script history with timestamps

**Personal Info Manager:**
- [ ] Name, DOB, phone, address
- [ ] Multiple insurance profiles
- [ ] Multiple pharmacy profiles
- [ ] Info auto-fills into scripts and quick responses

**Estimated time:** 2 sessions

---

### Phase 4: Agentic Brain
**Goal:** Juniper doesn't just speak — it thinks

- [ ] ElevenLabs Conversational AI as primary brain
  - Natural conversation mode: user describes what they need, Juniper drafts the script
  - Context awareness: knows user's stored info, uses it intelligently
  - Call preparation: "I need to call my dentist to reschedule" → generates full script
- [ ] **Scribe feature:** After a call, Juniper summarizes what was said
  - Uses speech-to-text transcript
  - Extracts action items (next appointment, medication changes, etc.)
  - Stores summary in history
- [ ] **Smart Response:** Auto-answers predictable questions during calls
  - "What's your date of birth?" → Juniper responds automatically
  - User controls which questions are auto-answered
  - Visual indicator shows what Juniper is about to say (user can cancel)
- [ ] **Smart Suggestions:** Based on context, suggest relevant scripts or responses
  - "You have a pharmacy script saved — want to use it?"

**Estimated time:** 3 sessions

---

### Phase 5: Polish, Docs, & UI
**Goal:** Portfolio-worthy and Robin-ready

**UI Refresh:**
- [ ] Kill the blurry green — implement the new design system
- [ ] Public theme: clean, modern, accessible, professional
- [ ] Robin theme: Dragonfly (cyan/teal), warm, personal
- [ ] Micro-animations (button feedback, voice activity indicator, transitions)
- [ ] Accessibility audit (WCAG AA minimum — this is an accessibility tool, it must be accessible)
- [ ] Dark mode support

**Documentation (Tech Writer Shannon's Domain):**
- [ ] In-app help system with searchable content
  - Getting started guide
  - Voice setup walkthrough
  - Script builder tutorial
  - Personal info management
  - Troubleshooting (mic not working, voice not loading, etc.)
- [ ] User manual (markdown, rendered in Help panel)
- [ ] README.md for the repo (developer-facing)
- [ ] CHANGELOG.md

**Feedback System:**
- [ ] Activate the feedback stub
- [ ] In-app feedback form: bug report, feature request, general feedback
- [ ] Stores locally, viewable in dev mode
- [ ] Later: posts to Supabase when auth is live

**Estimated time:** 2 sessions

---

### Phase 6: Android (PWA)
**Goal:** Robin can install Juniper on her phone/tablet

- [ ] PWA manifest (app name, icons, theme color, splash screen)
- [ ] Service worker for offline capability (at minimum, cached scripts work offline)
- [ ] "Add to Home Screen" prompt
- [ ] Mobile-optimized layout (large touch targets — critical for accessibility)
- [ ] Test mic/speaker access on Android Chrome
- [ ] Test on Robin's actual device

**Future (if needed):**
- [ ] Capacitor wrapper for deeper hardware integration
- [ ] Google Play Store listing

**Estimated time:** 1 session for PWA, additional sessions for Capacitor if needed

---

### Phase 7: Auth & Backend (Activate Super-Stubs)
**Goal:** Turn stubs into real features

- [ ] Connect Supabase auth (flip the env variable)
- [ ] Migrate localStorage data to Supabase
- [ ] User profiles with cloud sync
- [ ] Robin's data backed up and recoverable
- [ ] Feedback posts to backend
- [ ] Usage analytics (anonymous, opt-in)

**Estimated time:** 1–2 sessions

---

## Auto Boilerplate Components
(Built during Phase 1, reusable across all Shannon's apps)

| Component | What It Does | Super-Stub Behavior | Active Behavior |
|-----------|-------------|---------------------|-----------------|
| `AuthGate` | Login/signup wrapper | Shows UI, fake session, "Coming soon" toast | Supabase auth flow |
| `HelpPanel` | Slide-out help system | Renders markdown from `/docs/help/` folder | Same + search, analytics |
| `FeedbackModal` | Bug/feature/feedback form | Saves to localStorage | POSTs to Supabase |
| `ExportButton` | Download data/scripts | Generates local files (PDF, JSON, CSV) | Same + cloud backup |
| `SettingsManager` | User preferences | localStorage | Syncs to user profile |
| `ThemeProvider` | CSS variable theming | Reads theme from config | Reads from user prefs |
| `ToastSystem` | Notification toasts | In-memory | Same |

These components get extracted into a shared package after Juniper proves them out. Then RootsGenie, ProveIt, and future apps import them.

---

## Deployment Strategy

| Environment | URL | Mode | Purpose |
|-------------|-----|------|---------|
| GitHub Pages | `nymfarious.github.io/juniper` | Public | Portfolio showcase |
| Vercel (prod) | `juniper.vercel.app` | Robin | Robin's daily use |
| Vercel (preview) | `juniper-{branch}.vercel.app` | Varies | Testing branches |
| Local | `localhost:5173` | Dev | Development |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React + Vite | Modern, fast, component-based, you're learning it |
| Styling | Tailwind CSS + CSS Variables | Utility-first + themeable via Auto Boilerplate |
| Voice AI | ElevenLabs Conversational AI | Robin's cloned voice, low latency, agentic capability |
| STT | Web Speech API | Free, built into browsers, no API cost |
| Storage (now) | localStorage | Zero cost, works offline, no backend needed |
| Storage (later) | Supabase | Auth + database + real-time, you already use it |
| Deployment | GitHub Pages + Vercel | Portfolio + production, both free tier |
| Android | PWA → Capacitor (if needed) | Start simple, upgrade when needed |

---

## What We're NOT Building (Scope Control)

- ❌ Actual phone call integration (Juniper assists the user, doesn't make calls)
- ❌ Video calling
- ❌ Multi-user / family accounts (yet)
- ❌ Desktop app (web + PWA is sufficient)
- ❌ iOS-specific features (PWA works on iOS too)
- ❌ Custom wake word ("Hey Juniper") — future dream feature

---

## GH Foundations Test Reminder
**Wednesday, February 18** — Paid and scheduled, online proctored.
Shannon: You know this stuff from doing it. Repos, commits, PRs, branches, Pages, Actions, Issues. If you want a quick review session Tuesday evening, just say the word.

---

## Next Step
**Today:** Review this plan, adjust anything that doesn't feel right, then start Phase 0 by auditing the current Juniper features together.
