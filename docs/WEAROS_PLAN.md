# Thoth WearOS Development Plan

## Overview

**Purpose**: A WearOS companion app for Thoth — ultra-minimal, optimized for bedside use.

> Thoth is a dream journal with voice recording + AI analysis. The WearOS version strips away everything except the one thing you'd want at 3am: **record a dream instantly**.

---

## Design Decisions

### Why a separate module (not part of the phone app)?

| Option | Pros | Cons |
|--------|------|------|
| **Separate `wear/` module in same project** ✅ | Single repo, shared `common/` data layer, one CI pipeline | Slightly complex Gradle setup |
| Standalone WearOS repo | Simpler project structure | Two repos to manage |
| Embedded in phone APK (companion) | One APK | Bloats phone app, Play Store complications |

**Decision**: `wear/` module in the same Android project.

### What WearOS does NOT do

The watch does NOT analyze dreams, show the global map, or let you edit tags. That stays on the phone. The watch is purely a **recording terminal**.

### Feature Scope (Minimal Viable Wear)

| Feature | Priority | Notes |
|---------|----------|-------|
| One-tap voice recording | 🔴 P0 | Large button, records locally, uploads when done |
| Recording timer display | 🔴 P0 | Show elapsed time on watch face |
| Upload to Firestore | 🔴 P0 | After recording, push audio to the same Firebase as phone |
| Recent dreams list | 🟡 P1 | Last 5 dreams, tap to expand snippet |
| Sync status indicator | 🟡 P1 | Show upload progress / success / failure |
| Haptic feedback | 🟢 P2 | Confirm tap, recording start/end |
| Memory collapse nudge | 🟢 P3 | Light vibration + text: "12h since last dream" |

### What gets shared (the `common/` module)

```
common/
├── src/main/java/com/thoth/dreamarchive/common/
│   ├── data/
│   │   ├── firebase/
│   │   │   └── FirebaseRepository.kt    # Auth + Firestore + Storage
│   │   └── model/
│   │       └── Dream.kt                  # Shared Dream data class
│   ├── di/
│   │   └── ServiceLocator.kt             # Manual DI (no Hilt to keep light)
│   └── config/
│       └── Config.kt                    # Firebase config constants
```

---

## Architecture

### Multi-Module Project Structure

```
android/
├── app/                    ← Existing Capacitor phone app
├── wear/                   ← [NEW] WearOS app
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/thoth/dreamarchive/wear/
│   │   │   ├── MainWearActivity.kt       # Single activity (WearOS pattern)
│   │   │   ├── theme/
│   │   │   │   └── WearTheme.kt
│   │   │   ├── ui/
│   │   │   │   ├── recording/
│   │   │   │   │   └── RecordingScreen.kt
│   │   │   │   └── dreams/
│   │   │   │       └── DreamListScreen.kt
│   │   │   ├── viewmodel/
│   │   │   │   ├── RecordingViewModel.kt
│   │   │   │   └── DreamListViewModel.kt
│   │   │   └── service/
│   │   │       └── AudioRecorderService.kt
│   │   └── res/
│   │       ├── layout/
│   │       ├── values/
│   │       └── drawable/
│   └── build.gradle.kts
├── common/                 ← [NEW] Shared data layer
│   ├── src/main/
│   │   ├── java/com/thoth/dreamarchive/common/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle             ← Root: add ':wear', ':common' includes
├── settings.gradle          ← add ':wear', ':common' includes
└── gradle.properties        ← add wear module SDK versions
```

### Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| UI | Jetpack Compose (Wear) | Official WearOS UI toolkit |
| Architecture | MVVM + StateFlow | Standard Android pattern |
| DI | Manual ServiceLocator | Keep common/ lightweight, no Hilt |
| Audio | MediaRecorder API | Standard Android audio |
| Backend | Firebase SDK (Auth + Firestore + Storage) | Shared with phone app |
| Navigation | Wear Navigation Compose | Official WearOS navigation |
| Async | Kotlin Coroutines + Flow | Reactive data |

### Minimum SDK

- **WearOS minimum**: API 30 (Wear OS 3.0)
- **Current phone app**: `minSdkVersion = 22`
- Decision: Keep `wear/` module independent, start at `minSdk 30`

---

## Gradle Configuration

### settings.gradle (add includes)

```groovy
include ':app'
include ':wear'
include ':common'
include ':capacitor-cordova-android-plugins'
```

### wear/build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose)
}

android {
    namespace = "com.thoth.dreamarchive.wear"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.thoth.dreamarchive.wear"
        minSdk = 30          // Wear OS 3.0
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.10"
    }
}

dependencies {
    // Wear Compose BOM
    implementation(platform("androidx.wear.compose:compose-bom:2024.02.00"))
    implementation("androidx.wear.compose:compose-material3")
    implementation("androidx.wear.compose:compose-navigation")

    // Wear Activity
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")

    // Firebase (same as common)
    implementation(project(":common"))
}
```

### common/build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kgp)
    alias(libs.plugins.gms)
}

android {
    namespace = "com.thoth.dreamarchive.common"
    compileSdk = 34

    // Library module — no minSdk enforced
}

dependencies {
    // Firebase BoM
    implementation(platform("com.google.firebase:firebase-bom:32.7.2"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")

    // Serialization
    implementation("com.google.code.gson:gson:2.10.1")
}
```

---

## WearOS-Specific Considerations

### 1. Watch Face Complications (Future)
Not in v1, but the recording button can be exposed as a **complication** on the watch face in future versions.

### 2. Phone ↔ Watch Communication
- **No** Wearable Data Layer API in v1 (adds complexity)
- Recording is standalone: watch records, watch uploads directly to Firebase
- Future: `MessageApi` for phone to trigger watch recording

### 3. Round vs Square Screens
Use `BoxWithConstraints` + `WindowSizeClass` to handle both:
```kotlin
BoxWithConstraints {
    if (boxScope.roundScreen) {
        // Circular layout adjustments
    }
}
```

### 4. Tilt-to-Wake / Dim Screen
- Recording screen: keep screen on (`KeepScreenOn`)
- Dream list: use standard Wear timeout

### 5. Battery Considerations
- No background services running idle
- Record audio only while actively recording
- Upload happens immediately after stop (no queue in v1)

---

## Development Phases

### Phase W0: Scaffold (1 day)
- [ ] Add `common/` module with shared Firebase models
- [ ] Add `wear/` module with Compose setup
- [ ] Configure Gradle multi-module (`settings.gradle`, root `build.gradle`)
- [ ] Set up WearOS theme (dark, matching Thoth brand #0a0a0f)
- [ ] Verify empty shell builds: `./gradlew :wear:assembleDebug`

### Phase W1: Recording (1-2 days)
- [ ] `RecordingScreen.kt` — large circular record button
- [ ] `RecordingViewModel.kt` — timer, recording state
- [ ] `AudioRecorderService.kt` — MediaRecorder (AAC format)
- [ ] Haptic feedback on tap
- [ ] Upload audio to Firebase Storage after stop
- [ ] Upload recording metadata to Firestore

### Phase W2: Dream List (1 day)
- [ ] `DreamListScreen.kt` — scrollable list of last 5 dreams
- [ ] `DreamListViewModel.kt` — Firestore subscription
- [ ] Tap to expand and show transcript snippet

### Phase W3: Polish & Release (0.5 day)
- [ ] Loading states and error handling
- [ ] Upload progress indicator
- [ ] Final APK test on emulator / real device
- [ ] Update `release.yml` to also build `:wear:assembleRelease`

---

## Build & Release

```bash
# Build wear module only
./gradlew :wear:assembleDebug

# Build both phone + wear
./gradlew assembleDebug

# CI already in release.yml — add wear build step
```

**Release APK naming:**
- Phone: `thoth-phone-v1.0.0.apk`
- Wear: `thoth-wear-v1.0.0.apk`
- Both attached to GitHub Release

---

## Risks

| Risk | Mitigation |
|------|-----------|
| WearOS emulator slow | Test on real device when possible |
| Firebase Auth on watch | Use anonymous auth for recording, link to phone account later |
| Audio permission on watch | Request at startup, handle denial gracefully |
| Firebase config duplication | Common module reads from `raw/res/values/firebase_config.xml` |

---

*Document version: v1.0.0 | Created: 2026-04-24*
