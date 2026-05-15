# Thoth: Frequently Asked Questions

## General Information

### What is Thoth?
Thoth is a real-time, collaborative dream archiving platform that visualizes the collective subconscious of humanity through an interactive world map. It transcribes and analyzes dreams from users across the globe.

### What platforms does Thoth support?
Thoth is available as a Web app (PWA), Android app, and iOS app, all built from a shared codebase using Capacitor.

---

## Usage Questions

### How do I record my first dream?
1. Sign in with your Google account
2. Click the microphone button to start recording
3. Speak your dream narrative clearly
4. Click stop when finished
5. Your dream will be automatically transcribed and saved

### Can I edit my dream after recording?
Yes! After transcription, you can edit the text, add tags, or modify any details before saving to your personal archive.

### Is my dream data private?
Your personal archive is private and only visible to you. The global dream map shows anonymized, aggregated data without personal identifiers.

### How does the voice transcription work?
Thoth uses Google's Gemini API for real-time speech-to-text transcription. The audio is processed securely and only the transcribed text is stored long-term.

### Can I upload existing audio recordings?
Currently, Thoth only supports live recording. Support for pre-recorded audio uploads is planned for a future release.

### What is the Imagery Hall?
The Imagery Hall displays emerging symbols and themes from the global dream archive, showing collective patterns in dream content.

### How often does the global dream map update?
The map updates in real-time as new dreams are added to the archive, with visual indicators showing recent activity.

### Can I delete my dreams?
Yes, you can delete any dream from your personal archive at any time. Deleted dreams are also removed from the global aggregate data.

---

## Troubleshooting

### Why won't my recording start?
- Ensure you've granted microphone permissions to the app
- Check that no other app is currently using your microphone
- Try refreshing the page or restarting the app

### The transcription is inaccurate
- Speak clearly and at a moderate pace
- Minimize background noise
- You can edit the transcription manually after recording is complete

### I can't sign in with Google
- Check your internet connection
- Ensure third-party cookies are enabled (for web version)
- Try clearing your browser cache and trying again

### My dream isn't showing up in the global map
- It may take a few minutes for new dreams to appear
- Ensure your dream was saved successfully to your archive
- The map only shows anonymized aggregate data, not individual dreams

### Audio playback isn't working
- Check your device's volume settings
- Ensure audio files weren't blocked by your browser
- Try a different browser or device

### The app is running slowly
- Clear your browser cache
- Close other tabs/apps to free up memory
- Try using the app on a different device with more resources

### Why am I getting a "Quota exceeded" error?
Thoth has usage quotas for API calls. If you encounter this, please try again later or contact support for assistance.

---

## Technical Support

### How do I report a bug?
Please email us at support@thoth.app with:
- Detailed description of the issue
- Steps to reproduce the problem
- Screenshots if applicable
- Your device and operating system version

### Where can I request new features?
We welcome feature suggestions! Email us at feedback@thoth.app or open an issue on our GitHub repository.

### Is Thoth open source?
Yes! Thoth is released under the Apache License 2.0. You can find the source code on GitHub.

### How do I set up my own instance of Thoth?
Follow the setup instructions in our [README](../README.md) file. You'll need Firebase, Gemini API, and Cloudflare R2 credentials.

### What browsers are supported?
Thoth works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions).

### How can I contribute to the project?
Check out our GitHub repository for open issues and pull request guidelines. We welcome contributions from the community!

### Who do I contact for partnership inquiries?
For business partnerships or press inquiries, please contact partnerships@thoth.app.
