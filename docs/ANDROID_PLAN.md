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

### Phase 3: Google Play Release (Days 9–10)

#### 3.1 Release Signing Configuration
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
- `res/values/styles.xml` dark theme configured (upgraded to Material3)
- `res/values/colors.xml` created (dark background #0a0a0f, purple accent #c084fc)
- `gradle-wrapper.properties` networkTimeout set to 300000ms
- `buildFeatures { buildConfig = true }` added to `app/build.gradle`
- Release build minification enabled (`minifyEnabled = true`, `shrinkResources = true`)
- `capacitor.config.ts` comments translated to English

⚠️ **Blockers**
- Android SDK not installed (must be installed via Android Studio)
- Gradle 8.14.3-all.zip download timed out (slow network, wrapper has 2-minute hard limit)

## Quick Start Commands

```bash
cd Thothapp

# Step 1: Install Capacitor (already done — for reinstall)
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android \
  @capacitor/app \
  @capacitor/haptics \
  @capacitor/local-notifications \
  @capacitor/splash-screen \
  @capacitor/status-bar

# Step 2: Initialize (for re-init)
npx cap init Thoth com.thoth.dreamarchive --web-dir=dist

# Step 3: Add Android (for re-add)
npx cap add android

# Step 4: Install Android Studio (required)
# Download: https://developer.android.com/studio
# After install, open Thothapp/android/ directory and wait for Gradle Sync

# Step 5: Place Firebase config
# Download google-services.json from Firebase Console
# Place at android/app/google-services.json

# Step 6: Build and sync
npm run build
npx cap sync android

# Step 7: Run in Android Studio
npx cap open android
# Android Studio: Sync Project → Run 'app'
```

---

*Document version: v1.1.0 | Last updated: 2026-04-23*
