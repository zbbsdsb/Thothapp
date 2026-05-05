# Internal Handoff — Thoth Project

> **Last updated**: May 5, 2026
> **Author**: cao zhe (caozhe@caozhe.com)
> **Repo**: `caozhe/ThothApp` (GitHub)
> **Project type**: Capacitor cross-platform app (Android/iOS) + React Web, backed by Firebase

---

## 1. Project at a Glance

Thoth is a dream journal that records voice right after waking, transcribes with Gemini AI, extracts imagery tags, and stores everything in Firebase. The "Global Imagery Map" visualizes collective dream patterns worldwide.

**Key fact**: This is NOT an Nx monorepo. It is a **Capacitor + npm workspaces** project. Many old docs reference Nx — ignore them.

---

## 2. Directory Map （What Lives Where）

```
thoth/
├── src/                    # Web app (React + Vite + TailwindCSS)
│   ├── components/         # Page-level components (RecordView, HistoryView, etc.)
│   ├── hooks/              # Custom hooks (useAuth, useDreams, useRecording, useCountdown)
│   ├── lib/                # Client-side utils (ai.ts, storage.ts, errors.ts, firebase.ts)
│   ├── types/              # TypeScript interfaces (Dream, UserProfile, etc.)
│   ├── App.tsx             # Root component with routing + global state
│   ├── main.tsx            # Vite entry point
│   └── index.css          # TailwindCSS + custom dark theme
│
├── packages/
│   ├── common/             # [UNUSED] Shared core logic (duplicate of src/lib/)
│   └── ui/                # [UNUSED] Shared UI components
│
├── android/                # Android app (Capacitor native layer)
│   ├── app/
│   │   ├── build.gradle   # App config (signing, Material3, build types)
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/     # Capacitor plugin bindings
│   │   │   └── res/      # Icons, splash, themes
│   │   ├── capacitor.build.gradle
│   │   └── keystore.properties  # .gitignored — release signing
│   ├── wear/               # [PLANNED] WearOS module
│   ├── common/             # [PLANNED] Shared Kotlin module
│   ├── build.gradle        # Root Gradle (plugins, dependencies)
│   ├── variables.gradle    # SDK versions (compileSdk=36, minSdk=24, targetSdk=36)
│   └── .gitignore         # Blocks keystore + google-services.json
│
├── ios/                    # [SCAFFOLDED] iOS Capacitor shell (needs Xcode work)
│
├── docs/                   # Documentation (see §6 below)
├── public/                 # Static assets (served as-is by Vite)
├── server.ts               # Express backend (R2 presign, dev server)
├── index.html              # Vite entry HTML
├── capacitor.config.ts      # Capacitor config (plugins, WebView settings)
├── vite.config.ts         # Vite config (TailwindCSS plugin, path aliases)
├── tsconfig.json          # TypeScript config
├── package.json           # Root workspace ("workspaces": ["packages/*"])
├── firebase.json          # Firebase hosting rules + Firestore/Storage rules binding
├── firestore.rules        # Firestore security rules (users own their data)
├── storage.rules          # Firebase Storage rules (user-namespaced)
├── .env.example           # Template for all env vars (VITE_* for client)
└── .gitignore            # Covers keystore, google-services.json, firebase-applet-config.json
```

---

## 3. Key Technical Decisions

| Decision | Rationale |
|----------|----------|
| **Capacitor over React Native** | Reuse 90% of existing React web code; Android/iOS shell is mostly config |
| **npm workspaces (not Nx)** | Simpler; `packages/*` exists but most logic lives in `src/lib/` |
| **Cloudflare R2 for audio (web), Firebase Storage (mobile)** | R2 is cheaper for large files; platform detection in `storage.ts` routes correctly |
| **Gemini AI (not OpenAI)** | Free tier + audio transcription support via `google/genai` SDK |
| **Firebase Auth (Google only)** | Simplest secure auth; profile auto-created on first sign-in |
| **`VITE_` prefix env vars** | Vite native injection; no manual `define()` in `vite.config.ts` |
| **Firestore over RTDB** | Better querying for dream archive + real-time listeners |

---

## 4. Recent Fixes (May 5, 2026)

### Commit `aa6f9fc` — Critical Bug Fixes (7 issues)

| # | Bug | Fix |
|---|-----|-----|
| C1 | `useRecording.ts` discarded all AI results after recording | Added `addDream` param; now writes to Firestore |
| C2 | `RecordView.tsx` crashed on mode toggle (`Mic2` not imported) | Added `Mic2` to lucide-react import |
| C3 | `useDreams.ts` used `serverTimestamp()` without importing it | Added import from `firebase/firestore` |
| H1 | `App.tsx` delete only updated counter, never deleted the document | Now calls `deleteDream()` from `useDreamActions` |
| H2 | `useDreams.ts` set `total_dreams: -1` instead of decrementing | Changed to `increment(-1)` |
| M3 | `package.json` name was `"react-example"` | Changed to `"thoth"` |
| M4 | `.gitignore` missing `firebase-applet-config.json` | Added to `.gitignore` |

### Commit `47dea71` — Backend Security & Config (6 issues)

| # | Issue | Fix |
|---|-------|-----|
| B2 | `vite.config.ts` injected `process.env.GEMINI_API_KEY`, but code used `import.meta.env.VITE_GEMINI_API_KEY` | Removed `define()` + `loadEnv`; use Vite native `VITE_` prefix |
| B3 | `server.ts` CORS was open to all origins (`cors()`) | Whitelist: `localhost:3000`, `localhost:5173`, `capacitor://localhost` |
| B4+B8 | R2 presign had no input validation; fileName could contain `../` | Added sanitize function + content-type whitelist (audio only) |
| B5 | `useAuth.ts` imported unused `serverTimestamp` | Removed |
| B6 | `RecordView.tsx` imported unused `useDreams` | Removed |
| B7 | Gemini API key hardcoded into client bundle via `define()` | Side-effect fix of B2 |

### Commit `96475d6` — Platform-Aware Storage

- `storage.ts` now detects native vs web via `Capacitor.isNativePlatform()`
- **Web**: tries R2 first, falls back to Firebase Storage
- **Mobile (Android/iOS)**: skips R2 entirely (no Express server in WebView), goes straight to Firebase Storage
- This fixes pointless network errors on mobile

---

## 5. What's Working / What's Not

### ✅ Working End-to-End

1. Google Sign-In → profile auto-created in Firestore
2. Voice recording (Web + Android) → transcribed by Gemini
3. Manual text entry → AI analysis (tags, insight, oracle)
4. Dream save to Firestore with real-time UI update
5. Dream delete with correct `total_dreams` decrement
6. Global Imagery Map (D3.js + TopoJSON, live Firestore aggregation)
7. Global Locations aggregation
8. Android debug APK build (`npx cap sync android && ./gradlew assembleDebug`)
9. Android release AAB build (signed with `thoth-upload-key.jks`)
10. Web build + dev server with R2 presign proxy

### ⚠️ Partially Working

| Feature | Status | Notes |
|---------|--------|-------|
| iOS | Scaffold exists (`ios/` dir) | Needs Xcode signing + real device test |
| Push Notifications | Not started | Plan: FCM for Android, APNs for iOS |
| Background Recording | Not started | Needs Android Foreground Service |
| Offline Cache | Not started | No Room/SQLite yet |

### ❌ Not Started

- WearOS companion app (`android/wear/`)
- iOS TestFlight / App Store release
- Biometric unlock
- Social features (dream sharing)
- Sleep tracking integration

---

## 6. Documentation Guide

| File | Audience | Content |
|------|----------|---------|
| `STATUS.md` | **Public** | Current project status, what works, roadmap highlights |
| `README.md` | **Public** | Project intro, features, tech stack, quick start |
| `docs/PROJECT_STRUCTURE.md` | **Developers** | Accurate directory map (v2.0.0, rewritten May 5) |
| `docs/ARCHITECTURE.md` | **Developers** | System overview, data flow, backend details |
| `docs/API.md` | **Developers** | Service APIs, data models, usage examples |
| `docs/TECHNICAL_DOCUMENTATION.md` | **Developers** | In-depth implementation details (contains outdated Nx references) |
| `docs/FEATURES.md` | **Product** | Feature list with UX psychology notes |
| `docs/ANDROID_PLAN.md` | **Android Team** | Phase-by-phase Android development plan (v1.2.0) |
| `docs/IOS_PLAN.md` | **iOS Team** | iOS Capacitor setup + Xcode config (v1.0.0) |
| `docs/WEAROS_PLAN.md` | **WearOS Team** | WearOS module plan (references Groovy DSL, updated May 5) |
| `docs/PRIVACY.md` | **Legal/Users** | Data storage, AI processing, security |
| `docs/QUOTA.md` | **Users** | Daily limits, personal API key setup |
| `docs/dreambase.md` | **Product** | Infrastructure concept ("atomic imagery") |
| `CHANGELOG.md` | **Everyone** | Version history (rewritten May 5, 2026 — Nx refs removed) |
| `planning/NEXT_STEPS.md` | **Everyone** | Post-device-migration setup checklist |
| `planning/ROADMAP.md` | **Everyone** | Product roadmap (v2.1 → v3.1) |

> **⚠️ Warning**: `TECHNICAL_DOCUMENTATION.md` still references Nx monorepo structure. It is outdated. Trust `PROJECT_STRUCTURE.md` (v2.0.0) instead.

---

## 7. Environment Setup for New Devs

### First-Time Setup

```bash
# 1. Clone
git clone https://github.com/caozhe/ThothApp.git
cd ThothApp

# 2. Install dependencies (root + all workspaces)
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Fill in .env:
#    - Firebase config (get from Firebase Console → Project Settings → Web App)
#    - VITE_GEMINI_API_KEY (get from https://aistudio.google.com/app/apikey)
#    - R2 config (if you have Cloudflare R2 set up)

# 5. Start dev server (Express + Vite middleware)
npm run dev
# → Opens at http://localhost:3000
```

### Android Setup (requires Android Studio)

```bash
# 1. Set JAVA_HOME (Windows PowerShell example)
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"

# 2. Build web assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Open in Android Studio
npx cap open android
# → In Android Studio: Sync Gradle → Run 'app' on device/emulator

# 5. Release build (requires keystore.properties in android/app/)
cd android
.\gradlew.bat bundleRelease
# → Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Setup (requires macOS + Xcode)

```bash
# 1. Install Capacitor iOS (if not done)
npm install @capacitor/ios
npx cap add ios

# 2. Build + sync
npm run build
npx cap sync ios

# 3. Open in Xcode
open ios/App/App.xcworkspace
# → Set Team in Signing & Capabilities → Run on Simulator/Device
```

---

## 8. Key Gotchas & Sharp Edges

### 🔪 Sharp Edge: `packages/common/` is Mostly Dead Code

The `packages/common/src/ai/analyze.ts` and `src/lib/ai.ts` contain **duplicate AI logic**. The web app uses `src/lib/ai.ts`. The `packages/common` was set up for sharing with native modules, but that never happened. **Consolidate into `packages/common` when you start iOS/WearOS native work.**

### 🔪 Sharp Edge: User Profile Firestore Structure

When a user first signs in, `useAuth.ts` calls `setDoc(doc(db, 'users', u.uid), newProfile)`. The Firestore rule `isOwner()` checks `request.auth.uid == userId`, which works because `setDoc` uses the doc ID as the user ID. **Do not change the doc ID pattern.**

### 🔪 Sharp Edge: `allowMixedContent: true` in Capacitor Config

`capacitor.config.ts` has `android.allowMixedContent: true`. This allows HTTPS WebView to load HTTP resources. It is a **Google Play compliance risk**. Remove this after ensuring all R2 endpoints use HTTPS. Tracked in `prepare/HTTPS_MIGRATION.md`.

### 🔪 Sharp Edge: R2 presign Only Works in Dev/Web

The `/api/r2/presign` endpoint lives in `server.ts` (Express). Capacitor apps don't run Express, so R2 uploads fail on mobile. The code in `storage.ts` handles this by detecting the platform and skipping R2 on native. **Don't try to call `/api/r2/presign` from the app — it won't work.**

### 🔪 Sharp Edge: Firebase `google-services.json` Not in Repo

The Android app needs `google-services.json` in `android/app/` for Firebase features. It's in `.gitignore`. **Each developer must download it from Firebase Console** (Project Settings → Android App → Download).

Similarly, iOS needs `GoogleService-Info.plist` in `ios/App/App/`.

### 🔪 Sharp Edge: Android keystore Password

The release keystore (`android/app/thoth-upload-key.jks`) is committed for convenience, but the password in `android/keystore.properties` is a **temporary placeholder** (`Thoth@2026`). **Change it before production Google Play upload.**

---

## 9. Next Steps for the Team

> 📋 **Full details**: See `planning/NEXT_STEPS.md` for post-migration checklist and `planning/ROADMAP.md` for product roadmap.

### Immediate (This Sprint)

- [ ] **Update `TECHNICAL_DOCUMENTATION.md`** — remove Nx references
- [ ] **Test on real Android device** — emulator works, need real device validation
- [ ] **iOS: first successful build** — scaffold exists, needs Xcode work
- [ ] **Add code splitting** — bundle is ~1.3MB JS (Firebase + D3), should be split

### Next Sprint

- [ ] **Push Notifications** — FCM for Android, configure in `ANDROID_PLAN.md` Phase 2
- [ ] **Background Recording Service** — Android Foreground Service + notification
- [ ] **Remove `allowMixedContent: true`** — ensure all R2 URLs are HTTPS
- [ ] **Firebase `google-services.json`** — register debug SHA-1/SHA-256 in Firebase Console

### Future

- [ ] **WearOS module** — `android/wear/`, see `WEAROS_PLAN.md`
- [ ] **iOS TestFlight** — `IOS_PLAN.md` Phase i2/i3
- [ ] **Consolidate `packages/common`** — remove duplicate logic in `src/lib/`
- [ ] **Offline cache** — Room (Android) / CoreData (iOS)

---

## 10. Key Contacts

| Role | Name | Email |
|------|------|-------|
| Project Lead / Dev | Cao Zhe | caozhe@caozhe.com |
| Android Dev | — | — (you?) |
| iOS Dev | — | — (you?) |
| Design | — | — |

---

*Internal document — not for public distribution. When handing off to a new team member, give them this doc + read access to the repo + Firebase Console.*
