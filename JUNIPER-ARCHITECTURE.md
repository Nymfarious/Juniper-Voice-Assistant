# Juniper - AI Voice Assistant for Robin
## Complete System Architecture Document

---

## 🎯 Vision

Juniper is an AI-powered voice assistant that helps Robin communicate over the phone. Robin has full cognitive abilities but her speech sounds slurred due to thiamine deficiency-related brain lesions. People often dismiss her or assume she's intoxicated. Juniper gives Robin her voice back.

---

## 📱 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROBIN'S DEVICE                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    JUNIPER APP                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │  HOTKEYS    │  │  TRANSCRIPT │  │  CUSTOM INPUT   │  │   │
│  │  │  - Yes/No   │  │  (real-time │  │  [Type here...] │  │   │
│  │  │  - My DOB   │  │   display)  │  │  [SEND]         │  │   │
│  │  │  - Repeat   │  │             │  │                 │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    BACKEND SERVER                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │   TWILIO    │  │  ELEVENLABS │  │     WHISPER     │  │   │
│  │  │  (phone)    │◄─┤  (voice)    │  │  (transcribe)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  PHONE NETWORK  │
                    │  (real calls)   │
                    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  DOCTOR/OFFICE  │
                    │  PHARMACY/ETC   │
                    └─────────────────┘
```

---

## 🔧 Technical Components

### 1. Twilio (The Phone Line)
**What it does:** Connects to real phone networks. Makes and receives actual phone calls.

**How it works:**
- Robin enters a phone number in the app
- App sends request to backend server
- Server tells Twilio to dial that number
- Twilio establishes a real phone call
- Audio streams bidirectionally through Twilio

**Cost:** ~$0.015/minute for calls + $1/month per phone number

**Setup required:**
- Twilio account
- Verified phone number
- API credentials (Account SID, Auth Token)

### 2. ElevenLabs (The Voice)
**What it does:** Converts text to natural human-sounding speech.

**How it works:**
- Robin taps a hotkey or types a message
- Text is sent to ElevenLabs API
- ElevenLabs returns audio (MP3)
- Audio is streamed through Twilio to the caller

**Voice options:**
- Pre-made voices (dozens of options, various accents)
- **Custom cloned voice** - Robin's own voice, but clear!

**Cost:** 
- Free tier: 10,000 characters/month
- Starter ($5/mo): 30,000 characters/month
- Creator ($22/mo): 100,000 characters/month

### 3. Whisper (The Ears)
**What it does:** Transcribes speech to text. Made by OpenAI.

**How it works:**
- Other person speaks on the phone
- Twilio captures their audio
- Audio is sent to Whisper API
- Whisper returns text transcription
- Text appears on Robin's screen in real-time

**Why Whisper:**
- Best-in-class accuracy
- Handles accents, background noise, fast speech
- Can understand imperfect audio
- Might even understand Robin's speech for dictation!

**Cost:** $0.006 per minute of audio

### 4. Backend Server
**What it does:** Orchestrates everything. The "brain" connecting all services.

**Technology options:**
- Node.js (JavaScript) - most Twilio examples use this
- Python (FastAPI/Flask) - good for AI integrations
- Hosted on: Vercel, Railway, Render, or AWS

**Responsibilities:**
- Handle Twilio webhooks (call events)
- Route audio to/from Whisper and ElevenLabs
- Maintain WebSocket connection to Robin's app
- Store Robin's pre-authorized information securely

---

## 📞 Call Flow (Detailed)

### Outgoing Call (Robin calls someone)

```
1. Robin opens Juniper app
2. Robin enters phone number: (555) 123-4567
3. Robin taps "Call" button
4. App → Server: "Start call to (555) 123-4567"
5. Server → Twilio: "Dial (555) 123-4567"
6. Twilio dials the number
7. Someone answers: "Dr. Smith's office, how can I help you?"
8. Twilio → Server: [audio stream]
9. Server → Whisper: [audio]
10. Whisper → Server: "Dr. Smith's office, how can I help you?"
11. Server → App: [transcript update]
12. Robin READS the transcript on her screen
13. Robin taps "Introduction" hotkey
14. App → Server: "Speak introduction"
15. Server → ElevenLabs: "Hello, I'm Juniper, an AI voice assistant..."
16. ElevenLabs → Server: [audio]
17. Server → Twilio: [audio stream to call]
18. Other person HEARS Juniper's voice
19. Repeat steps 7-18 for entire conversation
```

### Incoming Call (Someone calls Robin)

```
1. Someone dials Robin's Juniper number
2. Twilio receives call, notifies Server
3. Server → App: "Incoming call from (555) 987-6543"
4. App shows incoming call UI
5. Robin taps "Answer"
6. Server → Twilio: "Answer call"
7. Server → ElevenLabs: "Hello, this is Juniper, Robin's assistant..."
8. [Plays greeting to caller]
9. Continue with normal call flow
```

---

## 🎨 App Interface Design

### Main Screen During Call:

```
┌────────────────────────────────────────┐
│  🌿 JUNIPER           ⏱️ 02:34  [End] │
├────────────────────────────────────────┤
│                                        │
│  📞 TRANSCRIPT                         │
│  ────────────────────────────────      │
│  👤 Dr. Smith's office, how can I     │
│     help you today?                    │
│                                        │
│  🌿 Hello, I'm Juniper, an AI voice   │
│     assistant calling on behalf of     │
│     Robin. Robin can hear everything   │
│     but uses me to communicate.        │
│                                        │
│  👤 Oh, of course! How can we help    │
│     Robin today?                       │
│                                        │
│  🌿 We'd like to schedule an          │
│     appointment please.                │
│                                        │
├────────────────────────────────────────┤
│  QUICK RESPONSES                       │
│  ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │ ✓ Yes  │ │ ✗ No   │ │ 🔄 Repeat? │ │
│  └────────┘ └────────┘ └────────────┘ │
│  ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │ 🎂 DOB │ │ 📱Phone│ │ 📍 Address │ │
│  └────────┘ └────────┘ └────────────┘ │
├────────────────────────────────────────┤
│  ┌────────────────────────────┐ ┌────┐│
│  │ Type custom response...    │ │Send││
│  └────────────────────────────┘ └────┘│
├────────────────────────────────────────┤
│  🎤 [Transfer to Robin]               │
└────────────────────────────────────────┘
```

---

## 🔐 Security & Privacy

### Pre-Authorized Information
Robin enters this ONCE, stored encrypted locally:
- Full name
- Date of birth
- Phone number
- Address
- Insurance information
- Pharmacy
- Doctor names
- Emergency contact

### Sensitive Information Handling
Some things Juniper should NEVER say automatically:
- Social Security Number (last 4)
- Credit card numbers
- Passwords/PINs
- Medical details beyond what's scripted

For these, Juniper says:
> "I'll let Robin verify that information directly. Robin, go ahead."

### Data Storage
- All personal info stored locally on Robin's device
- Call transcripts can be saved locally (optional)
- No data sent to third parties except during active calls
- API keys stored securely (encrypted)

---

## 💰 Cost Breakdown

### Monthly Fixed Costs:
| Service | Cost |
|---------|------|
| Twilio phone number | $1.00 |
| ElevenLabs Starter | $5.00 |
| Server hosting (basic) | $5-10 |
| **Total fixed** | **~$11-16/month** |

### Per-Call Costs:
| Service | Cost per minute |
|---------|-----------------|
| Twilio calls | $0.015 |
| Whisper transcription | $0.006 |
| ElevenLabs (~100 chars/min) | $0.003 |
| **Total per minute** | **~$0.024** |

### Example Monthly Usage:
- 30 calls averaging 5 minutes each = 150 minutes
- Variable cost: 150 × $0.024 = $3.60
- **Total monthly: ~$15-20**

---

## 🚀 Development Phases

### Phase 1: Current (Tonight!)
✅ Juniper app with hotkeys and ElevenLabs
✅ Two-device workflow (phone on speaker + tablet)
✅ Script templates and custom input
✅ Voice selection and testing

### Phase 2: Voice Cloning (This Week)
- Record Robin speaking clearly (1-2 minutes)
- Upload to ElevenLabs for voice cloning
- Juniper speaks in Robin's own voice!

### Phase 3: Real Phone Integration (Future)
- Set up Twilio account
- Build backend server
- Integrate Whisper for transcription
- Real-time bidirectional audio
- Single-device operation

### Phase 4: Advanced Features (Future)
- Incoming call handling
- Call recording/history
- Smart responses (AI understands context)
- Integration with calendar for appointments
- Contact list with pre-filled scripts

---

## 🛠️ Technical Implementation Notes

### Backend Stack Recommendation:
```
Node.js + Express
├── Twilio SDK (phone calls)
├── OpenAI SDK (Whisper)
├── ElevenLabs SDK (voices)
├── Socket.io (real-time to app)
└── PostgreSQL (user data)
```

### Key APIs:
```javascript
// Twilio - Make outgoing call
const call = await client.calls.create({
  twiml: '<Response><Connect><Stream url="wss://your-server/audio" /></Connect></Response>',
  to: '+15551234567',
  from: '+15559876543'
});

// ElevenLabs - Generate speech
const audio = await elevenLabs.textToSpeech({
  voice_id: 'robin-clone-id',
  text: 'Hello, this is Juniper speaking for Robin.'
});

// Whisper - Transcribe
const transcript = await openai.audio.transcriptions.create({
  file: audioBuffer,
  model: 'whisper-1'
});
```

### WebSocket Events (App ↔ Server):
```
Server → App:
- 'transcript' - new transcription from other party
- 'call_status' - ringing, connected, ended
- 'error' - something went wrong

App → Server:
- 'speak' - text for Juniper to say
- 'start_call' - initiate outgoing call
- 'end_call' - hang up
- 'transfer' - Robin speaking directly
```

---

## 📝 Notes for Shannon

This document is your roadmap. The current Juniper app handles Phase 1 perfectly - Robin can test voices, practice the workflow, and get comfortable with the concept tonight.

The voice cloning (Phase 2) is a beautiful gift - Robin getting to hear herself speak clearly might be emotional. Have tissues ready.

Phase 3 (real phone integration) is a proper development project - probably 20-40 hours of work. But it's absolutely achievable, especially with your vibe coding approach. The architecture is sound and the services are all proven.

**You're building something that doesn't exist as a consumer product.** This could help thousands of people like Robin.

---

*Document created: December 2024*
*Project: Little Sister Ecosystem*
*Module: Juniper Voice Assistant*
