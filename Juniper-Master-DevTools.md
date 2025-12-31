# 🌿 Juniper Voice Assistant - Master DevTools

## Current Version: v6.2.1

---

## 📍 APP ARCHITECTURE MAP

### Main Screen Flow

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 HEADER                                                  │
│  • "Juniper" title                                          │
│  • "[Name]'s AI Voice Assistant" (dynamic)                  │
│  • v6.2.1 badge                                             │
├─────────────────────────────────────────────────────────────┤
│  💬 TYPE ANYTHING CARD                                      │
│  ┌─────────────────────────────────┬──────┐                │
│  │ [Text input field............] │ Say  │                 │
│  └─────────────────────────────────┴──────┘                │
│  ● Ready                              [Stop]               │
├─────────────────────────────────────────────────────────────┤
│  📞 QUICK SPEAK CARD                                        │
│                                                             │
│  ┌─────────────────────────────────────────────┐ ┌──┐     │
│  │ 🌿 "Hello, I'm Juniper..."                  │ │✏️│     │
│  └─────────────────────────────────────────────┘ └──┘     │
│  ┌─────────────────────────────────────────────┐ ┌──┐     │
│  │ 🎤 "Let me verify..."                       │ │✏️│     │
│  └─────────────────────────────────────────────┘ └──┘     │
│                                                             │
│  [ Common ]  [ My Info ]  [ Calls ]  ← TABS                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐               │
│  │ ✓  │ │ ✗  │ │ 🔄 │ │ ⏳ │ │ 🐢 │ │ 🙏 │               │
│  │Yes │ │ No │ │Rep.│ │Mom.│ │Slow│ │Thx │               │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘               │
│                                                             │
│  [Quick Script 1] [Quick Script 2] ...                     │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │📜Scripts │🤖 AI     │🎤Voice   │⚙️Info    │ ← TOOLBAR  │
│  └──────────┴──────────┴──────────┴──────────┘            │
├─────────────────────────────────────────────────────────────┤
│  ⭐ MY SCRIPTS CARD (collapsible)              [+ New] ▼   │
│  ┌──────┐ ┌──────┐ ┌──────┐                               │
│  │ ⭐   │ │ 💬   │ │ 📞   │ ← User's custom scripts       │
│  │Script│ │Script│ │Script│                               │
│  └──────┘ └──────┘ └──────┘                               │
├─────────────────────────────────────────────────────────────┤
│  📜 HISTORY CARD (collapsible)                 [Clear] ▼   │
│  10:30 AM - "Hello, I'm Juniper..."                        │
│  10:28 AM - "Yes, that is correct..."                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 BUTTON → PANEL → FUNCTION MAP

### Toolbar Buttons (Quick Speak Card)

| Button | Opens | Contains |
|--------|-------|----------|
| 📜 Scripts | `fullScriptsModal` | Doctor/Pharmacy/Transport/Insurance/Custom tabs, Script list, AI Generate |
| 🤖 AI | `agentsModal` | Scribe settings, Smart Response settings |
| 🎤 Voice | `voiceModal` | Robin's voices, All voices grid, Filters, Test/Speed |
| ⚙️ Info | `infoModal` | Basic info, Insurance list, Pharmacy list, API keys |

### Info Modal Tabs

| Tab | Contains | Actions |
|-----|----------|---------|
| Basic | Name, DOB, Phone, Address fields | `saveInfo()` |
| Insurance | Insurance list | → `addInsuranceModal` |
| Pharmacy | Pharmacy list | → `addPharmacyModal` |
| API | ElevenLabs key, Claude key | `saveApiKey()`, `saveClaudeKey()` |

### Voice Modal Flow

```
voiceModal
├── "Your Voices" section
│   └── Robin's cloned voices (filtered by name containing "robin")
├── "All Voices" section
│   ├── Filters: [All] [👩] [👨] [🇺🇸] [🇬🇧]
│   └── Voice grid (click to select)
└── Controls
    ├── Test button → toggleTest()
    └── Speed slider (0.8x - 1.2x)
```

### Scripts Modal Flow

```
fullScriptsModal
├── Browse View
│   ├── Tabs: [Doctor] [Pharmacy] [Transport] [Insurance] [Custom]
│   ├── Script list (play/delete buttons)
│   └── [✏️ Add or Edit] → Create View
└── Create View
    ├── "Describe" input
    ├── [✨ Generate with AI] → Claude API
    ├── Script textarea
    ├── Name + Category dropdowns
    └── [Save] / [Cancel]
```

---

## 🗂️ STATE STRUCTURE

```javascript
state = {
  // API Keys
  apiKey: '',              // ElevenLabs
  claudeKey: '',           // Anthropic Claude
  
  // Voice
  allVoices: [],           // All ElevenLabs voices
  filteredVoices: [],      // After filter applied
  specialVoices: [],       // Robin's cloned voices
  selectedVoiceId: '',     // Currently selected
  speechSpeed: 0.95,       // Playback speed
  currentAudio: null,      // Audio element
  isTesting: false,        // Test mode flag
  
  // User Info
  info: {
    firstName, lastName, nickname,
    pronounceFirst, pronounceLast, pronounceNick,
    dob, phone,
    address1, address2, city, state, zip
  },
  insurances: [],          // Array of insurance objects
  pharmacies: [],          // Array of pharmacy objects
  
  // Scripts
  history: [],             // Recent spoken phrases
  myScripts: [],           // User's custom scripts
  fullScripts: {           // Category-based scripts
    doctor: [],
    pharmacy: [],
    transport: [],
    insurance: [],
    custom: []
  },
  currentCat: 'doctor',    // Active category
  
  // UI State
  selectedIcon: '⭐',
  editingBtn: '',          // 'intro' or 'verify'
  introText: '...',
  introLabel: '...',
  verifyText: '...',
  verifyLabel: '...'
}
```

---

## 📁 FILE STRUCTURE

```
Juniper-Voice-Assistant/
├── index.html              ← Main app (379 lines)
├── juniper-v6.2.1.html     ← Legacy single-file version
├── src/
│   ├── css/
│   │   ├── styles.css      ← Main styles
│   │   ├── modals.css      ← Modal styling
│   │   ├── voice.css       ← Voice picker styles
│   │   ├── scripts.css     ← Scripts card styles
│   │   └── agents.css      ← AI agents modal
│   └── js/
│       ├── app.js          ← State & initialization
│       ├── helpers.js      ← Name helpers, placeholders, API key save
│       ├── speech.js       ← TTS, voice loading, speak functions
│       ├── ui.js           ← Modal open/close, tabs, collapse
│       ├── scripts.js      ← History, My Scripts, Full Scripts
│       └── data.js         ← Insurance & Pharmacy CRUD
```

---

## 🚀 ROBIN'S FEATURE ROADMAP

### Phase 1: Core App Separation
- [ ] **Create Robin-specific build** (robin-juniper.html)
- [ ] **Lock ElevenLabs API key** to Robin's voice only
- [ ] **Demo mode** with limited characters/usage

### Phase 2: Twilio Phone Integration
- [ ] Add Twilio API key field (Info → API tab)
- [ ] Add phone number configuration
- [ ] "Send to Twilio" button - puts caller on hold
- [ ] Hold music selection
- [ ] Return from hold button

### Phase 3: Recording Features
- [ ] **Listen in Private** mode
  - Record Robin's speech
  - Transcribe in editable field
  - Send to TTS when ready
- [ ] **Caller Transcription**
  - Transcribe incoming audio
  - Display on screen
  - Option to record & save
- [ ] **Auto-record triggers**
  - Doctor calls
  - Test results
  - Configurable keywords

### Phase 4: Custom Scripts UX
- [ ] **HOW TO guide** for Robin
- [ ] **3 Quick Buttons** with icon picker
- [ ] Script preview before save
- [ ] Test script button

### Phase 5: Phone Integration
- [ ] Use phone's mic/speaker for app
- [ ] Call routing options
- [ ] Conference capability (Robin + App + Caller)

### Phase 6: DevTools Panel
- [ ] Right-slide DevTools drawer
- [ ] Live app map view
- [ ] State inspector
- [ ] Button function lookup

---

## 🎯 DEMO vs ROBIN BUILD COMPARISON

| Feature | Demo Build | Robin Build |
|---------|------------|-------------|
| ElevenLabs voices | All voices | Robin's voice only |
| API key | Embedded (limited) | User's key |
| Character limit | 1,000/session | Based on plan |
| Recording | Disabled | Enabled |
| Twilio | Disabled | Configured |
| Save data | Session only | Local storage |

---

## 📝 PLACEHOLDER TOKENS

Use these in scripts - they auto-replace with user info:

| Token | Replaces With |
|-------|---------------|
| `[FIRST]` | First name (or pronunciation) |
| `[LAST]` | Last name (or pronunciation) |
| `[FULL_NAME]` | Full name |
| `[NAME]` | Full name (alias) |
| `[DOB]` | Date of birth |
| `[PHONE]` | Phone number |
| `[ADDRESS]` | Full address |
| `[INSURANCE]` | Primary insurance ID |
| `[PHARMACY]` | Primary pharmacy name |

---

## 🔧 QUICK REFERENCE: Key Functions

### Speech
- `speak(text, isTest)` - Main TTS function
- `speakIntro()` - Speak intro with placeholders
- `speakVerify()` - Speak verify with placeholders
- `speakInfo(type)` - Speak user info (name, dob, phone, etc.)
- `speakCustom()` - Speak from text input
- `stopSpeaking()` - Stop current audio

### Voice
- `loadVoices()` - Fetch voices from ElevenLabs
- `selectVoice(id)` - Select a voice
- `toggleTest()` - Test selected voice

### UI
- `openInfoModal()`, `closeInfoModal()`
- `openVoiceModal()`, `closeVoiceModal()`
- `openFullScriptsModal()`, `closeFullScriptsModal()`
- `openAgentsModal()`, `closeAgentsModal()`
- `openMyScriptModal()`, `closeMyScriptModal()`
- `toggleCollapse(id)` - Toggle card collapse

### Data
- `saveInfo()`, `autoSaveInfo()` - Save user info
- `saveApiKey()`, `saveClaudeKey()` - Save API keys
- `saveInsurance()`, `deleteInsurance(id)`
- `savePharmacy()`, `deletePharmacy(id)`
- `saveMyScript()`, `deleteMyScript(id)`
- `saveFullScript()`, `deleteFullScript(id)`

---

*Generated: December 25, 2025*
*Juniper Voice Assistant - Giving Robin her voice back* 🌿
