---
title: "Project Structure"
description: "Thoth app project structure documentation"
category: "specs"
---
# Thoth Project Structure

This document describes the actual structure of the Thoth AI Dream Archive project — a cross-platform dream journal app built with Capacitor (Android/iOS) + React Web, sharing core logic via npm workspaces.

> **Note**: This project does **not** use Nx. It uses plain npm workspaces for package management. Some older docs may reference Nx — those are outdated.

---

## High-Level Architecture

```
thoth/
├── src/                    # Web app (React + Vite + TailwindCSS)
├── packages/
│   ├── common/             # [UNUSED] Duplicate of src/lib/ — do not add code here
│   └── ui/                 # [UNUSED] Duplicate of src/components/ — do not add code here
├── android/                # Android app (Capacitor native layer)
├── ios/                    # iOS app (Capacitor native layer)
├── docs/                   # Project documentation
├── public/                 # Static assets (served as-is)
├── server.ts               # Express backend (R2 upload proxy, etc.)
├── index.html              # Vite entry point
├── capacitor.config.ts      # Capacitor cross-platform config
├── vite.config.ts          # Vite build config
├── tsconfig.json           # Root TypeScript config
├── package.json            # Root package.json (npm workspaces)
└── firebase.json           # Firebase hosting rules
```

---

## Directory Details

### `src/` — Web Application

The main React web application, also used as the webview layer inside the Android/iOS Capacitor apps.

```
src/
├── components/             # React page components (DreamFeed, WorldMap, etc.)
├── hooks/                  # Custom React hooks (useAuth, etc.)
├── lib/                    # Client-side utilities
│   ├── ai.ts              # AI analysis calls (browser-side)
│   ├── storage.ts         # R2 storage operations (browser-side)
│   ├── firebase.ts        # Firebase client init
│   └── ...
├── types/                  # TypeScript type definitions
├── App.tsx                 # Root component (React Router)
├── main.tsx               # Vite entry point
└── index.css              # TailwindCSS + custom dark theme
```

### `packages/common/` — Shared Core Logic

Shared business logic used by both the web app and (in future) native modules.

```
packages/common/
├── src/
│   ├── ai/
│   │   └── analyze.ts     # AI dream analysis (shared with web)
│   ├── data/               # Data models and Firebase services
│   ├── auth/               # Authentication services
│   ├── storage/            # Storage abstraction
│   └── utils/              # Utility functions
├── package.json            # @thoth/common
└── tsconfig.json
```

> **⚠️ Known Issue**: `src/lib/ai.ts` (web) and `packages/common/src/ai/analyze.ts` contain duplicated AI logic. This should be consolidated into `packages/common` only.

### `packages/ui/` — Shared UI Components

Reusable React components styled with TailwindCSS, consumable by the web app and potentially other frontends.

```
packages/ui/
├── src/
│   ├── components/         # Reusable UI (buttons, cards, etc.)
│   ├── hooks/              # Shared React hooks
│   └── styles/             # TailwindCSS shared styles
├── package.json            # @thoth/ui
└── tsconfig.json
```

### `android/` — Android Application

Native Android project wrapping the web app via Capacitor WebView. Also the home for the future WearOS module.

```
android/
├── app/                    # Main phone app module
│   ├── build.gradle        # App-level Gradle config (signing, build types)
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/          # Capacitor plugin bindings (if any)
│   │   └── res/           # Android resources (themes, icons, splash)
│   ├── capacitor.build.gradle
│   └── keystore.properties  # Gitignored — release signing config
├── wear/                   # [PLANNED] WearOS app module (see docs/WEAROS_PLAN.md)
├── common/                 # [PLANNED] Shared Kotlin module (Firebase, models)
├── capacitor-cordova-android-plugins/  # Cordova plugin bridge
├── build.gradle             # Root Gradle config (plugins, dependencies)
├── variables.gradle         # SDK versions, dependency versions
├── settings.gradle          # Module includes
└── .gitignore              # Keystore + google-services.json excluded
```

**Key Gradle Files:**
- `variables.gradle` — Centralized version management (`compileSdkVersion=36`, `minSdkVersion=24`, `targetSdkVersion=36`, `buildToolsVersion="36.0.0"`)
- `app/build.gradle` — App namespace `com.thoth.dreamarchive`, release signing via `keystore.properties`, Material3 theme support
- `capacitor.build.gradle` — Injected by Capacitor CLI, links JS bundle to WebView

### `ios/` — iOS Application

Capacitor-based iOS project (Swift/Objective-C). Mirrors the Android structure but for iOS.

### Root Config Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor plugins, WebView settings, splash screen, status bar |
| `vite.config.ts` | Vite dev server, build output (`dist/`), TailwindCSS plugin |
| `tsconfig.json` | TypeScript config with path aliases for `packages/*` |
| `server.ts` | Express backend — R2 presigned URL generation, CORS, static serve |
| `firebase.json` | Firebase hosting config + Firestore/Storage security rules |
| `package.json` | Root workspace — `workspaces: ["packages/*"]` |

---

## Module Dependency Graph

```
src/ (web app)
  ├── depends on → packages/common
  ├── depends on → packages/ui
  └── depends on → firebase (browser SDK)

packages/ui
  └── depends on → react, tailwindcss

packages/common
  └── depends on → firebase (browser SDK), @google/genai

android/app
  ├── wraps → dist/ (via Capacitor)
  └── depends on → capacitor-android, com.google.android.material

server.ts (standalone Express server)
  └── depends on → @aws-sdk/client-s3, express, cors, dotenv
```

---

## Build System

### Web Build

```bash
npm run build        # → vite build → dist/
npm run dev          # → tsx server.ts (Express + Vite dev middleware)
```

### Android Build

```bash
# Prerequisite: JAVA_HOME must point to Android Studio JDK
# e.g. C:\Program Files\Android\openjdk\jdk-21.0.8

npm run build                # Build web → dist/
npx cap sync android         # Sync dist/ into Android project
cd android
.\gradlew.bat bundleRelease # Build AAB (signed with keystore.properties)
```

### iOS Build

```bash
npm run build
npx cap sync ios
# Open android/app.xcworkspace in Xcode → Archive → Upload
```

---

## npm Workspaces

The project uses **npm workspaces** (not Nx) for package management:

```json
// package.json
{
  "name": "thoth-dream-archive",
  "workspaces": ["packages/*"]
}
```

Installing dependencies:
```bash
npm install              # Installs root + all workspace dependencies
npm run -w packages/common build   # Build specific workspace
```

---

## Capacitor Configuration Highlights

From `capacitor.config.ts`:

```ts
{
  appId: 'com.thoth.dreamarchive',
  webDir: 'dist',              // Web assets directory
  android: {
    allowMixedContent: true,   // ⚠️ TEMPORARY — remove when R2 is fully HTTPS
    backgroundColor: '#0a0a0f',
    overrideUserAgent: 'ThothApp/Android',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: { backgroundColor: '#0a0a0f', showSpinner: false },
    StatusBar:     { style: 'DARK', backgroundColor: '#0a0a0f' },
  }
}
```

> **Compliance Note**: `allowMixedContent: true` allows HTTPS WebView to load HTTP resources. This is a **Google Play policy risk**. Ensure all R2 endpoints use HTTPS before production release.

---

## Known Architecture Issues

These are documented here to be fixed in future sprints:

1. **Duplicate AI logic**: `src/lib/ai.ts` and `packages/common/src/ai/analyze.ts` both implement AI analysis. Consolidate into `packages/common`.
2. **Duplicate storage logic**: `src/lib/storage.ts` (browser) and `server.ts` (Express) both implement R2 upload. Consider a shared interface.
3. **`package.json` name**: Root `package.json` still has `"name": "react-example"` — should be `"thoth-dream-archive"`.
4. **Nx references in docs**: `PROJECT_STRUCTURE.md` (this file) previously incorrectly described an Nx monorepo. Now fixed.
5. **`allowMixedContent`**: Temporary workaround — track R2 HTTPS migration in `prepare/HTTPS_MIGRATION.md`.

---

## Adding a New Platform

To add a new Capacitor platform (e.g., Desktop via Tauri):

1. Create platform-specific directory (`desktop/`)
2. Add Capacitor integration in `capacitor.config.ts`
3. Add build scripts in root `package.json`
4. Document platform-specific setup in `docs/`

---

*Document version: v2.0.0 | Rewritten: 2026-05-05 | Replaces incorrect Nx-based v1.0.0*
