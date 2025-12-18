# Juniper Voice Assistant

## Screenshot

![Juniper Voice Assistant Interface](image1)

*Juniper's intuitive interface with Quick Speak buttons and voice controls*

A powerful voice-controlled assistant built with Python that helps you interact with your computer using natural language commands. Juniper can perform tasks like web searches, opening applications, telling jokes, providing weather updates, and much more!

## Features

- 🎤 **Voice Recognition**: Uses Google's Speech Recognition API for accurate voice commands
- 🔊 **Text-to-Speech**: Natural-sounding voice responses using pyttsx3
- 🌐 **Web Integration**: Search Google, YouTube, Wikipedia, and more
- 📧 **Email Support**: Send emails through voice commands
- 🎵 **Media Control**: Play music and videos
- 🌤️ **Weather Updates**: Get current weather information
- 🤖 **AI Chat**: Integrated ChatGPT support for intelligent conversations
- 📱 **GUI Interface**: User-friendly graphical interface with quick action buttons
- ⚙️ **Customizable**: Easy to extend with new commands and features

## Prerequisites

- Python 3.7 or higher
- Microphone for voice input
- Internet connection for web-based features
- API keys for:
  - OpenWeatherMap (for weather features)
  - OpenAI (for ChatGPT integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Nymfarious/Juniper-Voice-Assistant.git
cd Juniper-Voice-Assistant
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your API keys:
   - Create a `.env` file in the project root
   - Add your API keys:
     ```
     OPENWEATHER_API_KEY=your_openweathermap_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

## Usage

Run the main application:
```bash
python main.py
```

### Voice Commands

Juniper responds to various voice commands, including:

- **Greetings**: "Hello", "Hi Juniper"
- **Search**: "Search for [query]", "Google [query]"
- **YouTube**: "Play [video name] on YouTube"
- **Wikipedia**: "Tell me about [topic]"
- **Weather**: "What's the weather?", "Weather in [city]"
- **Time**: "What time is it?"
- **Date**: "What's the date?"
- **Email**: "Send email"
- **Applications**: "Open [application name]"
- **Entertainment**: "Tell me a joke", "Play music"
- **ChatGPT**: "Chat [your message]"
- **Exit**: "Goodbye", "Exit", "Quit"

### GUI Features

The graphical interface provides:
- Voice input visualization
- Status display
- Quick action buttons for common commands
- Response text display
- Easy-to-use controls

## Project Structure

```
Juniper-Voice-Assistant/
├── main.py                 # Main application entry point
├── voice_assistant.py      # Core voice assistant logic
├── gui.py                  # GUI implementation
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── .env                   # API keys (not tracked in git)
└── README.md             # This file
```

## Dependencies

- `speech_recognition`: For voice input
- `pyttsx3`: For text-to-speech
- `requests`: For API calls
- `wikipedia`: For Wikipedia searches
- `pywhatkit`: For YouTube and other web services
- `python-dotenv`: For environment variable management
- `openai`: For ChatGPT integration
- `tkinter`: For GUI (usually included with Python)

## Configuration

You can customize Juniper's behavior by modifying `config.py`:
- Voice settings (rate, volume, voice selection)
- API endpoints
- Default responses
- Command patterns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

- **Microphone not detected**: Check your system's audio settings and ensure Python has microphone permissions
- **API errors**: Verify your API keys are correctly set in the `.env` file
- **Speech recognition issues**: Ensure you have a stable internet connection
- **Module not found**: Run `pip install -r requirements.txt` again

## Future Enhancements

- [ ] Add support for more languages
- [ ] Implement offline mode for basic commands
- [ ] Add smart home device integration
- [ ] Create mobile app version
- [ ] Add voice customization options
- [ ] Implement reminder and calendar features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Python community for excellent libraries
- Google Speech Recognition API
- OpenAI for ChatGPT integration
- OpenWeatherMap for weather data

## Contact

Created by [@Nymfarious](https://github.com/Nymfarious)

For questions or suggestions, please open an issue on GitHub.

---

**Note**: This is a personal project created for learning and demonstration purposes. Feel free to use and modify it according to your needs!