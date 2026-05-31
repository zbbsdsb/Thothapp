<div align="center">

# 🌙 Thoth

### *The Global Dream Archive*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor)](https://capacitorjs.com/)

**A real-time, collaborative dream archiving platform**

[Web App](https://thoth.app) • [Documentation](docs/README.md) • [Contributing](CONTRIBUTING.md) • [Changelog](CHANGELOG.md)

</div>

---

## ✨ Overview

Thoth visualizes the collective subconscious of humanity through an interactive world map, transcribing and analyzing dreams from users across the globe. Built with modern web technologies and deployed across Web, Android, and iOS platforms.

<div align="center">

| Platform | Status | Download |
|----------|--------|----------|
| Web (PWA) | ✅ Live | [thoth.app](https://thoth.app) |
| Android | ✅ Available | [Google Play](https://play.google.com/store/apps/details?id=com.thoth.app) |
| iOS | 🚧 In Development | TestFlight Coming Soon |

</div>

---

## 🚀 Features

- **🎙️ Voice-to-Dream** — Real-time transcription of dream narratives using Google Gemini API
- **🌍 Global Dream Map** — Interactive D3.js visualization showing dream activity by country
- **💫 Subconscious Pulse** — Visual indicators of live archive updates
- **📚 Personal Archive** — Secure storage for your own dream history with audio playback
- **🔮 Imagery Hall** — Explore collective symbols and themes emerging from the global archive
- **📱 Cross-Platform** — Web (PWA), Android, and iOS apps with shared codebase

---

## 🛠️ Tech Stack

### Frontend
| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Visualization | D3.js, TopoJSON |
| Mobile | Capacitor 8 (Android + iOS) |

### Backend & Services
| Service | Provider |
|---------|----------|
| Authentication | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| Audio Storage | Cloudflare R2 / Firebase Storage |
| AI Transcription | Google Gemini API |
| Dev Server | Express |

---

## 📁 Project Structure

```
Thothapp/
├── src/                  # React web app source
│   ├── components/       # UI components (RecordView, DreamPanel, etc.)
│   ├── hooks/            # Custom hooks (useAuth, useDreams, useRecording)
│   ├── lib/              # Utilities (storage, r2, firebase config)
│   └── App.tsx           # Main app with routing
├── android/              # Android native project
├── ios/                  # iOS native project
├── docs/                 # Documentation
├── server.ts             # Express dev server (R2 presign)
├── capacitor.config.ts   # Capacitor configuration
├── vite.config.ts        # Vite build config
└── firebase.json         # Firebase hosting rules
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project (for auth and database)
- Google Gemini API key
- (Optional) Cloudflare R2 account for audio storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Thothapp.git
   cd Thothapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# R2 Storage (Optional - for web audio uploads)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=your-bucket-name
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_URL=https://your-public-url.com
```

See [`.env.example`](.env.example) for the complete template.

---

## 📱 Platform-Specific Development

### Web
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

### Android
```bash
npm run build        # Build web assets
npx cap sync android # Sync to Android project
npx cap open android # Open in Android Studio
```

Or use the PowerShell script:
```bash
./build_android.ps1
```

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios     # Open in Xcode
```

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

- 🐛 [Report bugs](https://github.com/yourusername/Thothapp/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/yourusername/Thothapp/issues/new?template=feature_request.md)
- 🌟 [Good first issues](.github/GOOD_FIRST_ISSUES.md)

---

## 🌐 Community

- [GitHub Discussions](https://github.com/yourusername/Thothapp/discussions) — Join community discussions
- [Discord](https://discord.gg/your-invite-code) — Real-time chat and support

---

## 📄 License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the Thoth team
- Inspired by the ancient Egyptian deity of wisdom and writing
- Powered by [Firebase](https://firebase.google.com/), [Google Gemini](https://deepmind.google/technologies/gemini/), and [Cloudflare](https://www.cloudflare.com/)

---

<div align="center">

**[⬆ Back to Top](#-thoth)**

*Made with 🌙 and code*

</div>
