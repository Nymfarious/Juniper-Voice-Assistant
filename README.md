# 🌿 Juniper - AI Voice Assistant

An AI-powered voice assistant designed to help people with communication challenges make phone calls. Built in honor of those with speech difficulties, dementia, or other conditions that make phone communication challenging.

## Features

- **🎤 Voice Cloning** - Use ElevenLabs to clone a familiar voice
- **📞 Quick Speak** - Pre-configured phrases for common phone scenarios
- **📜 Custom Scripts** - Create and save full call scripts with placeholders
- **🤖 AI Agents** - Scribe (call summaries) and Smart Response (auto-answers)
- **🏥 Medical Info** - Store insurance, pharmacy, and personal info
- **✏️ Editable Buttons** - Customize intro and verify messages

## Quick Start

### Single-File Version
Just open `juniper-v6.2.1.html` in a browser. Everything is self-contained.

### Refactored Version
Open `index.html` and ensure you're running from a local server (for CSS/JS imports):

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve
```

## Setup

1. **ElevenLabs API Key** - Get from [elevenlabs.io](https://elevenlabs.io)
   - Required for voice synthesis
   - Add in: Info → API tab

2. **Claude API Key** (optional) - Get from [anthropic.com](https://anthropic.com)
   - Powers AI script generation
   - Add in: Info → API tab

3. **Clone a Voice** (optional)
   - Go to ElevenLabs → Voices → Add Voice → Instant Voice Cloning
   - Upload 8-10 short audio clips (10 seconds each)
   - Name it with "Robin" to auto-detect as special voice

## Placeholders

Use these in scripts:
- `[FIRST]` - First name (pronounced)
- `[LAST]` - Last name (pronounced)
- `[FULL_NAME]` - First + Last
- `[DOB]` - Date of birth
- `[PHONE]` - Phone number
- `[ADDRESS]` - Full address
- `[INSURANCE]` - Primary insurance ID
- `[PHARMACY]` - Primary pharmacy name

## Project Structure

```
juniper-app/
├── index.html              # Main HTML (uses separate CSS/JS)
├── juniper-v6.2.1.html     # Single-file version
├── src/
│   ├── css/
│   │   ├── styles.css      # Base styles
│   │   ├── modals.css      # Modal styles
│   │   ├── voice.css       # Voice selector
│   │   ├── scripts.css     # Scripts modal
│   │   └── agents.css      # AI agents modal
│   └── js/
│       ├── app.js          # State & initialization
│       ├── helpers.js      # User info helpers
│       ├── speech.js       # Voice & TTS
│       ├── ui.js           # UI functions
│       ├── scripts.js      # Scripts management
│       └── data.js         # Insurance & pharmacy
└── README.md
```

## Version History

- **v6.2.1** - Editable buttons, icons, hovers, insurance/pharmacy management
- **v6.2.0** - Forest theme, modal-based settings
- **v6.0.0** - Major refactor with Slate Ember theme

## Made For

This project was created for Robin, who has permanent speech difficulties from B1 thiamine deficiency. Juniper helps her make phone calls to doctors, pharmacies, and other services using her own cloned voice.

## License

MIT - Use freely, help others communicate.

---

*Created with 💚 by Shannon (Nymfarious)*
