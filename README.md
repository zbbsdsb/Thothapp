# Thoth: The Global Dream Archive

Thoth is a real-time, collaborative dream archiving platform. It visualizes the collective subconscious of humanity through an interactive world map, transcribing and analyzing dreams from users across the globe.

Available on **Web**, **Android**, and **iOS** via Capacitor.

## Features

- **Voice-to-Dream**: Real-time transcription of dream narratives using Gemini API
- **Global Dream Map**: Interactive D3.js visualization showing dream activity by country
- **Subconscious Pulse**: Visual indicators of live archive updates
- **Personal Archive**: Secure storage for your own dream history with audio playback
- **Imagery Hall**: Explore the collective symbols and themes emerging from the global archive
- **Cross-Platform**: Web (PWA), Android, and iOS apps with shared codebase

## Tech Stack

### Web & Mobile App (`src/`)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Animation**: Framer Motion
- **Visualization**: D3.js, TopoJSON
- **Mobile**: Capacitor 7 (Android + iOS)
- **State & Data**: Firebase Firestore, React Context

### Backend & Services
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore
- **Audio Storage**: Cloudflare R2 (web) / Firebase Storage (mobile fallback)
- **AI Transcription**: Google Gemini API
- **Dev Server**: Express (presign endpoints for R2 uploads)

### Native Apps (`android/`, `ios/`)
- **Android**: Native project, minSdk 24, targetSdk 36
- **iOS**: Capacitor iOS project
- **Build**: Gradle (Android), Xcode (iOS)

## Project Structure

```
Thothapp/
├── src/                  # React web app source
│   ├── components/       # UI components (RecordView, DreamPanel, etc.)
│   ├── hooks/            # Custom hooks (useAuth, useDreams, useRecording)
│   ├── lib/              # Utilities (storage, r2, firebase config)
│   └── App.tsx           # Main app with routing
├── android/              # Android native project
├── ios/                  # iOS native project
├── server.ts             # Express dev server (R2 presign)
├── capacitor.config.ts    # Capacitor configuration
├── vite.config.ts        # Vite build config
└── firebase.json         # Firebase hosting rules
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase (Required for all platforms)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API (Required for voice transcription)
VITE_GEMINI_API_KEY=your_gemini_api_key

# R2 Storage (Required for web audio uploads)
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=your-bucket-name
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_URL=https://your-public-url.com
```

See `.env.example` for the complete template.

## Development

### Web App

```bash
npm install
npm run dev          # Start Vite dev server (with HMR)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

The dev server runs on `http://localhost:5173` with the Express API proxy.

### Android

```bash
npm run build        # Build web assets first
npx cap sync android # Sync web assets to Android
npx cap open android # Open in Android Studio
```

Or use the provided scripts:
```bash
./build_android.ps1  # Build and sync for Android
```

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios     # Open in Xcode
```

## Firebase Setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database** in production mode
3. Enable **Google Authentication**
4. Register a Web App and copy the configuration to `.env`
5. Deploy Firestore rules: `firebase deploy --only firestore:rules`
6. For Android: Add `google-services.json` to `android/app/`
7. For iOS: Add `GoogleService-Info.plist` to `ios/App/App/`

## Known Limitations

- **R2 on Mobile**: Capacitor apps don't have the Express server, so audio uploads fall back to Firebase Storage on native platforms
- **allowMixedContent**: Currently enabled in `capacitor.config.ts` for R2 HTTP URLs — should be removed once all R2 assets use HTTPS
- **Large Bundle**: Main JS bundle is ~1.3MB — code splitting planned for future release

## Deployment

### Web (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add all `VITE_*` environment variables

### Android
- Build release APK/AAB via Android Studio
- Sign with upload key (configured in `android/app/thoth-upload-key.jks`)
- Publish to Google Play Store

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
