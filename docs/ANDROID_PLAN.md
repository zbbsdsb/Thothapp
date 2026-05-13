---
title: "Android Development Plan"
description: "Plan for developing Thoth Android app with Capacitor"
category: "specs"
---
# Thoth Android Development Plan

## Overview

**Project**: Thoth - AI Dream Archive
**Current Platform**: React Web (Vite + React 19 + Firebase)
**Target Platform**: Android (Capacitor cross-platform solution)

**Core Strategy**: Reuse existing React code, package as an Android app via Capacitor, and add native capabilities (background recording, push notifications, biometric authentication).

---

## Current State Analysis

| Dimension | Current Web Version | Android Adaptation Notes |
|-----------|---------------------|---------------------------|
| Framework | React 19 + Vite | **Capacitor** to reuse React code |
| App.tsx | 1,329-line single file | Needs to be split into components |
| Core Features | Voice recording, AI analysis, map | Reuse + enhanced background recording |
| Firebase | Auth / Firestore / Storage | Direct reuse |
| Missing | Push notifications, background recording, fingerprint | Need new native plugins |

---

## Technology Choice

### Option A: Capacitor (Recommended) ✅

```
Web App (React)
    ↓ npm run build
  dist/
    ↓ npx cap sync
  Android Project (Gradle)
    ↓ assembleDebug
  Thoth.apk
```

- Reuse 90% of existing React code
- Capacitor plugin ecosystem covers: notifications, camera, geolocation, fingerprint
- Firebase officially supports Android
- APK can be directly uploaded to Google Play

### Option B: React Native (Fallback)
- Consider only when极致 native performance or complex animations are needed
- High rewrite cost — not recommended as a first step

---

## Target Directory Structure

```
Thothapp/
├── apps/
│   ├── web/              ← Existing Vite Web app
│   └── android/          ← [New] Capacitor Android project
│       └── android/      ← Android Studio project (Gradle)
├── packages/
│   ├── common/           ← Existing shared logic
│   ├── types/            ← Existing type definitions
│   └── ui/               ← Existing UI components
└── docs/
    └── ANDROID_PLAN.md   ← This document
```

---

## Android-Exclusive Features

| Feature | Implementation | Priority |
|---------|---------------|----------|
| Background voice recording | Foreground Service + WorkManager | 🔴 P0 |
| Push notifications (Memory Collapse reminder) | Firebase Cloud Messaging (FCM) | 🔴 P0 |
| Fingerprint/Face unlock | AndroidX Biometric API | 🟡 P1 |
| Local offline cache | Room Database | 🟡 P1 |
| Home screen widget | Jetpack Glance | 🟢 P2 |
| App shortcuts | Android Shortcuts API | 🟢 P2 |

---

## Phased Development Plan

### Phase 0: Infrastructure (Days 1–2)

#### 0.1 Environment Setup
```bash
# Install Capacitor core
npm install @capacitor/core @capacitor/cli

# Add Android platform
npx cap add android

# Install required plugins
npm install @capacitor/app \
  @capacitor/haptics \
  @capacitor/local-notifications \
  @capacitor/background-runner
```

#### 0.2 Firebase Android Configuration
1. Download `google-services.json` from [Firebase Console](https://console.firebase.google.com/)
2. Place at `apps/android/android/app/google-services.json`
3. Add Android app in Firebase Console (package name: `com.thoth.dreamarchive`)
4. Configure SHA-1 fingerprints (debug and release signing)

#### 0.3 Verify Build
```bash
npm run build
npx cap sync android
cd apps/android/android
./gradlew assembleDebug
```

---

### Phase 1: Core Feature Adaptation (Days 3–5)

#### 1.1 Refactor App.tsx (Web side)
Split the 1,329-line single file into independent components:

```
src/
├── App.tsx              ← Entry (routing + state elevation)
├── components/
│   ├── CaptureView.tsx  ← Recording / text entry
│   ├── ArchiveView.tsx  ← Dream archive list
│   ├── DreamDetail.tsx  ← Dream detail page
│   ├── GlobalView.tsx   ← Global map
│   └── SettingsView.tsx
├── hooks/
│   ├── useAuth.ts       ← Firebase Auth wrapper
│   ├── useDreams.ts     ← Firestore data subscription
│   └── useRecording.ts  ← Voice recording logic
└── lib/
    ├── firebase.ts      ← Keep existing firebase.ts unchanged
    ├── r2.ts            ← Keep existing R2 upload unchanged
    └── android/          ← [New] Android-specific logic
        ├── notifications.ts
        ├── backgroundRecorder.ts
        └── biometric.ts
```

#### 1.2 Mobile UI Adaptation
- Bottom Tab navigation: Capture / Archive / Global / Settings
- Safe Area handling (notch, Android 10+ gesture navigation)
- Dark mode follows system

#### 1.3 Voice Recording
- Web: Uses `navigator.mediaDevices.getUserMedia` (already exists)
- Android: Via Capacitor plugin or WebView MediaRecorder API
- Background recording: Via Foreground Service + Notification

#### 1.4 Build Verification
```bash
npm run build
npx cap sync android
./gradlew assembleDebug
adb install -r app-debug.apk
```

---

### Phase 2: Android Native Capabilities (Days 6–8)

#### 2.1 Background Recording Service
```kotlin
// android/app/src/main/java/com/thoth/dreamarchive/DreamRecordingService.kt
class DreamRecordingService : Service() {
    // Foreground Service
    // MediaRecorder background recording
    // Recording complete → save locally → upload to Firestore
}
```

#### 2.2 FCM Push Notifications
```typescript
// Trigger conditions:
// 1. More than 12 hours since user last recorded a dream
// 2. Between 6:00–9:00 PM: push "Memories are collapsing..."
// 3. Final 60 seconds countdown: push urgent reminder
```

#### 2.3 Biometric Unlock
```typescript
import { Plugins } from '@capacitor/core';
import { BiometricAuth } from '@capacitor-community/biometric';

// On app open → check if fingerprint is set → verify before entry
```

#### 2.4 Local Room Cache
```kotlin
// Dream data local cache
@Entity(tableName = "dreams")
data class DreamEntity(
    val id: String,
    val transcript: String,
    val tags: List<String>,
    val insight: String,
    val divineOracle: String,
    val createdAt: Long,
    val synced: Boolean
)
```

---

### Phase 3: GitHub Release (Days 9–10)

> **Repo Purpose**: This repository provides open-source code and GitHub Release binaries. No Vercel or production deployment is involved.

#### 3.1 CI/CD Overview

```
PR / push to main/develop
└── ci.yml                     → lint + type-check + test  (quality gate only)

git tag v1.0.0 && git push --tags
└── release.yml
    ├── ci (lint + test)       → must pass before any build
    ├── build-debug             → assembleDebug APK
    └── release                 → softprops/action-gh-release → GitHub Release + APK attached
```

#### 3.2 Release Workflow

```bash
# 1. Tag a version
git tag v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. GitHub Actions pipeline runs automatically:
#    ci.yml (lint + type-check + test)
#        ↓ pass
#    release.yml (build debug APK)
#        ↓
#    softprops/action-gh-release → GitHub Release with APK attached

# 3. Download APK from the Release page
#    Users install via: adb install thoth-debug.apk
```

#### 3.3 Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_GEMINI_API_KEY` | Gemini AI API key |
| `VITE_R2_PUBLIC_URL` | Cloudflare R2 public URL |

#### 3.4 Release Signing (for signed AAB)

Release AAB (Google Play ready) requires signing secrets — configure when ready:

| Secret | Purpose |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Keystore file as base64 string |
| `ANDROID_KEY_ALIAS` | Key alias name |
| `ANDROID_KEY_PASSWORD` | Key password |
| `ANDROID_STORE_PASSWORD` | Keystore password |

#### 3.5 Release APK/AAB Artifacts
```bash
# Generate signing key
keytool -genkey -v -keystore thoth-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias thoth

# Build release APK/AAB
./gradlew assembleRelease
```

#### 3.2 Play Store Assets
- App icon: 512x512 PNG
- Feature screenshots: phone (1080x1920) × 6
- Short description (80 chars) + full description (4000 chars)
- Privacy policy URL (needs deployment)
- Target audience + content rating

#### 3.3 Release Flow
```
Internal testing → Closed testing (200 users) → Production release
```

---

## Android Permission Checklist

```xml
<!-- apps/android/android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.thoth.dreamarchive">

    <!-- Core audio recording permission -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Background service -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Push notifications (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Biometric authentication -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />

    <!-- Location (optional — for tagging dream origin) -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Storage (for caching audio files) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="29" />
</manifest>
```

---

## Key Adaptation Details

### Vite Config Adjustments

```ts
// vite.config.ts additions
build: {
  target: 'esnext',
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        genai: ['@google/genai'],
      }
    }
  }
}
```

### Capacitor Configuration

```ts
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thoth.dreamarchive',
  appName: 'Thoth',
  webDir: 'dist',
  server: {
    // Use local IP for debugging
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,      // Allow R2 HTTP upload
    backgroundColor: '#0a0a0f',   // Dark background matching Web
    overrideUserAgent: 'ThothApp/Android',
    captureInput: true,            // Allow input capture
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0a0f',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
    },
  },
};

export default config;
```

---

## Feature Comparison Table

| Feature | Web | Android | Implementation |
|---------|-----|---------|---------------|
| Voice recording | ✅ | ✅ | MediaRecorder + Foreground Service |
| Manual text entry | ✅ | ✅ | Reuse React component |
| AI analysis (Gemini) | ✅ | ✅ | Reuse API call |
| Dream archive list | ✅ | ✅ | Reuse Firestore subscription |
| Dream detail | ✅ | ✅ | Convert to full-screen route page |
| Global map | ✅ | ⚠️ | Simplified D3; fallback to static heatmap |
| Google login | ✅ | ✅ | Firebase Auth |
| Memory Collapse countdown | ✅ | ✅ + push | Enhanced: FCM push |
| Watch Mode | ⚠️ simulated | 🆕 widget | Glance AppWidget |
| Fingerprint unlock | ❌ | ✅ | AndroidX Biometric |
| Offline cache | ❌ | ✅ | Room Database |
| Quick-record shortcut | ❌ | ✅ | Android Shortcuts |

---

## Risks & Notes

| Risk | Impact | Mitigation |
|------|--------|------------|
| D3.js map performance | Stuttering on low-end Android devices | Test on Galaxy A series; prepare static heatmap fallback |
| Background recording permission | Android 12+ strict controls | Use Foreground Service + explicit notification |
| Custom ROM compatibility | realme/Xiaomi/Huawei killing background tasks | Test on mainstream Chinese ROMs; guide users to add to whitelist |
| Firebase Auth SHA-1 | Google login breaks | Configure SHA-1 in Firebase Console promptly |
| Push notification permission | Android 13+ requires runtime request | Guide permission grant on first launch |
| APK size | Estimated 15–25 MB | Lazy-load D3.js; split Firebase chunks |

---

## Phase 0 Completion Status

✅ **Completed**
- `capacitor.config.ts` created with dark theme, Splash Screen, StatusBar config
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` installed
- `@capacitor/app`, `@capacitor/haptics`, `@capacitor/local-notifications`, `@capacitor/splash-screen`, `@capacitor/status-bar` installed
- `npx cap add android` succeeded, `android/` directory generated
- `npx cap sync android` succeeded, web assets synced to `android/app/src/main/assets/public`
- `AndroidManifest.xml` permissions configured (recording, notifications, biometrics, location, background service)
- `res/values/styles.xml` dark theme configured (Material3)
- `res/values/colors.xml` created (dark background #0a0a0f, purple accent #c084fc)
- `gradle-wrapper.properties` networkTimeout set to 300000ms
- `app/build.gradle` optimized: `buildConfig = true`, release minify + shrinkResources, debug buildType
- CI/CD restructured:
  - `ci.yml` — lint + type-check + test on every PR/push (quality gate only)
  - `release.yml` — tag push triggers: CI gate → assembleDebug → GitHub Release with APK attached
  - Deleted: `deploy-dev.yml`, `deploy-prod.yml`, `build.yml` (not needed — repo is source code + Release distribution)

⚠️ **Blockers (user action required)**
- GitHub Secrets not configured — CI will fail until `VITE_*` secrets are added in repo Settings
- Firebase `google-services.json` not placed in `android/app/` — required for APK to connect to Firebase
- Android SDK not installed locally (for local development/build) — install Android Studio

## Quick Start Commands

```bash
cd Thothapp

# ── Local development ────────────────────────────────────────
npm run dev              # Start web dev server

# ── Android local build ──────────────────────────────────────
# Requires: Android Studio installed
npx cap open android    # Open Android Studio with project
# In Android Studio: Sync → Run 'app' on device/emulator

# ── Trigger GitHub Release ───────────────────────────────────
# Requires: GitHub Secrets configured (see §3.3)
git tag v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
# GitHub Actions runs: ci → build-debug → Release created automatically

# ── Reinitialize Capacitor (if needed) ───────────────────────
npm install @capacitor/core @capacitor/cli
npx cap add android
npm run build && npx cap sync android
```

---

*Document version: v1.2.0 | Last updated: 2026-04-24*
