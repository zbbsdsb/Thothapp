---
title: "WearOS Development Plan"
description: "Thoth WearOS app development plan and architecture"
category: "specs"
---
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
│   │   └── FirebaseRepository.kt    # Auth + Firestore + Storage
│   ├── model/
│   │   └── Dream.kt                  # Shared Dream data class
│   ├── di/
│   │   └── ServiceLocator.kt         # Manual DI (no Hilt to keep light)
│   └── config/
│       └── Config.kt                 # Firebase config constants
```

---

## Architecture

### Multi-Module Project Structure

```
android/
├── app/                    ← Existing Capacitor phone app (Groovy DSL)
├── wear/                   ← [NEW] WearOS app module (Groovy DSL)
│   ├── build.gradle        # Module-level Gradle config
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/thoth/dreamarchive/wear/
│       │   ├── MainWearActivity.kt       # Single activity (WearOS pattern)
│       │   ├── theme/
│       │   │   └── WearTheme.kt
│       │   ├── ui/
│       │   │   ├── recording/
│       │   │   │   └── RecordingScreen.kt
│       │   │   └── dreams/
│       │   │       └── DreamListScreen.kt
│       │   ├── viewmodel/
│       │   │   ├── RecordingViewModel.kt
│       │   │   └── DreamListViewModel.kt
│       │   └── service/
│       │       └── AudioRecorderService.kt
│       └── res/
│           ├── values/
│           └── drawable/
├── common/                 ← [NEW] Shared Kotlin module (Firebase, models)
│   ├── build.gradle
│   └── src/main/
│       ├── java/com/thoth/dreamarchive/common/
│       └── AndroidManifest.xml
├── build.gradle             ← Root: already has google-services plugin classpath
├── variables.gradle         ← SDK versions (inherit from here)
├── settings.gradle          ← add ':wear', ':common' includes
└── gradle.properties        ← add wear-specific config if needed
```

> **Note**: The existing project uses **Groovy DSL** (`.gradle` files), NOT Kotlin DSL (`.gradle.kts`). WearOS modules should follow the same convention for consistency.

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
- **Current phone app**: `minSdkVersion = 24` (Android 7.0)
- Decision: Keep `wear/` module at `minSdk 30`, `common/` library has no minSdk constraint

---

## Gradle Configuration

### `settings.gradle` (add includes)

```groovy
// Existing:
include ':app'
include ':capacitor-cordova-android-plugins'

// NEW — add before `apply from: 'capacitor.settings.gradle'`:
include ':wear'
include ':common'

apply from: 'capacitor.settings.gradle'
```

### `variables.gradle` (add WearOS SDK versions)

```groovy
ext {
    // Existing:
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
    buildToolsVersion = "36.0.0"

    // NEW — WearOS:
    wearMinSdkVersion = 30
    wearCompileSdkVersion = 34
    wearTargetSdkVersion = 34

    // Wear Compose BOM version
    wearComposeBomVersion = '2024.02.00'

    // Kotlin version (must match project's Kotlin version)
    kotlinVersion = '2.0.21'

    // Firebase BoM
    firebaseBoMVersion = '32.7.2'
}
```

### `wear/build.gradle` (Groovy DSL — matches existing project convention)

```groovy
apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply plugin: 'kotlin-kapt'

android {
    namespace = "com.thoth.dreamarchive.wear"
    compileSdk rootProject.ext.wearCompileSdkVersion

    defaultConfig {
        applicationId "com.thoth.dreamarchive.wear"
        minSdk rootProject.ext.wearMinSdkVersion
        targetSdk rootProject.ext.wearTargetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    buildFeatures {
        buildConfig true
        compose true
    }

    composeOptions {
        kotlinCompilerExtensionVersion rootProject.ext.kotlinVersion
    }

    packagingOptions {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    // Wear Compose BOM
    implementation platform("androidx.wear.compose:compose-bom:${rootProject.ext.wearComposeBomVersion}")
    implementation "androidx.wear.compose:compose-material3"
    implementation "androidx.wear.compose:compose-navigation"

    // Wear Activity
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-compose:2.7.0'

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0'

    // Shared common module
    implementation project(':common')
}
```

### `common/build.gradle` (Groovy DSL — library module)

```groovy
apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'
apply plugin: 'com.google.gms.google-services'

android {
    namespace = "com.thoth.dreamarchive.common"
    compileSdk rootProject.ext.compileSdkVersion

    defaultConfig {
        minSdk 24  // Match phone app minimum
        // No targetSdk needed for library
    }

    buildFeatures {
        buildConfig true
    }
}

dependencies {
    // Firebase BoM (version from variables.gradle)
    implementation platform("com.google.firebase:firebase-bom:${rootProject.ext.firebaseBoMVersion}")
    implementation 'com.google.firebase:firebase-auth-ktx'
    implementation 'com.google.firebase:firebase-firestore-ktx'
    implementation 'com.google.firebase:firebase-storage-ktx'

    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0'

    // Kotlin stdlib
    implementation "org.jetbrains.kotlin:kotlin-stdlib:${rootProject.ext.kotlinVersion}"
}
```

> **Important**: `common/` module requires `google-services.json` in its `src/main/` directory (or at `android/app/` with the plugin applied at root level). Since the existing phone app doesn't use `google-services.json` (Firebase is initialized in JS), the WearOS `common/` module will need to initialize Firebase in Kotlin. Two options:
> 1. Add `google-services.json` to `common/src/main/` — simplest
> 2. Initialize Firebase programmatically with `FirebaseOptions` builder

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
    if (maxWidth < 200.dp) {
        // Small round screen — simplify layout
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

### Phase W0: Scaffold ✅ COMPLETE (May 6, 2026 — commit `edc004c`)

- [x] Add `common/` module with shared Firebase models
- [x] Add `wear/` module with Compose setup
- [x] Configure Gradle multi-module (`settings.gradle`, `variables.gradle`)
- [x] Set up WearOS theme (dark, matching Thoth brand `#0a0a0f`)
- [x] Verify empty shell builds: `.\gradlew.bat :wear:assembleDebug` → `wear-debug.apk` (30 MB)

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
.\gradlew.bat :wear:assembleDebug

# Build both phone + wear
.\gradlew.bat assembleDebug

# CI already in release.yml — add wear build step
```

**Release APK naming:**
- Phone: `thoth-phone-v1.0.0.apk`
- Wear: `thoth-wear-v1.0.0.apk`
- Both attached to GitHub Release

---

## Dependencies to Add to `android/build.gradle` (root)

The root `build.gradle` already has `com.google.gms:google-services:4.4.2` in `buildscript`. To add Kotlin Gradle Plugin:

```groovy
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.13.0'
        classpath 'com.google.gms:google-services:4.4.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21'  // NEW
    }
}
```

---

## Risks

| Risk | Mitigation |
|------|-----------|
| WearOS emulator slow | Test on real device when possible |
| Firebase Auth on watch | Use anonymous auth for recording, link to phone account later |
| Audio permission on watch | Request at startup, handle denial gracefully |
| Firebase config duplication | `common/` module reads from `google-services.json` or programmatic init |
| Kotlin version mismatch | Ensure `kotlinVersion` in `variables.gradle` matches `kotlin-gradle-plugin` in root `build.gradle` |

---

## Build Environment Notes (Windows, Phase W0)

The plan was designed for standard Android Studio setups, but Phase W0 was built without Android Studio. Key deviations:

| Item | Plan | Actual (as-built) |
|------|------|-------------------|
| Android SDK path | `C:\Users\...\AppData\Local\Android\Sdk` | `F:\Android\Sdk` |
| JDK | System JDK | JDK 17 (Temurin) at `F:\Android\jdk17\jdk-17.0.14+7` |
| `gradle.properties` extra key | — | `org.gradle.java.home=F:\\Android\\jdk17\\jdk-17.0.14+7` |
| Wear Compose BOM | `androidx.wear.compose:compose-bom` | **Does not exist** — use explicit versions (see below) |
| `variables.gradle` Kotlin | `kotlinVersion = '2.0.21'` | `kotlinVersion = '1.9.24'` (JDK 17 constraint) |

### Correct WearOS Compose dependency versions (no BOM)

```groovy
// wear/build.gradle — replace BOM block with:
implementation 'androidx.wear.compose:compose-material3:1.0.0-alpha23'
implementation 'androidx.wear.compose:compose-navigation:1.3.1'
implementation 'androidx.wear.compose:compose-foundation:1.3.1'
```

### Things that differ from plan docs

1. **`common/build.gradle`** — do NOT apply `com.google.gms.google-services` plugin (library modules not allowed)
2. **JVM target** — both `:common` and `:wear` need `compileOptions { sourceCompatibility/targetCompatibility JavaVersion.VERSION_17 }` + `kotlinOptions { jvmTarget = '17' }`
3. **Color values** — `ColorScheme` params expect `Color` objects, not raw hex `Long`; wrap with `Color(0xFF...)`
4. **Wear `Text`** — import from `androidx.wear.compose.material3`, not `androidx.compose.material3`

---

## Differences from v2.0.0 of This Plan

This version (v2.1.0) adds Phase W0 completion status and real build-environment notes from the Windows (non-Android Studio) build run on May 6, 2026. Corrections vs v2.0.0:

1. `wearComposeBomVersion` variable removed — BOM does not exist; replaced with explicit artifact versions
2. `kotlinVersion` corrected to `1.9.24` (v2.0.0 had `2.0.21`, which requires JDK 21+)
3. `common/build.gradle` — `google-services` plugin removed (library module restriction documented)
4. Added `compileOptions`/`kotlinOptions` blocks to both `:common` and `:wear` (JVM 17)
5. Added `Build Environment Notes` section for non-standard Windows SDK paths

**v2.0.0 context** (still valid): Groovy DSL, `variables.gradle` centralized versions, Kotlin Gradle Plugin added to root `buildscript`, `google-services.json` needed by `common/` module.

---

*Document version: v2.1.0 | Updated: 2026-05-06 | Phase W0 complete — wear-debug.apk builds (30 MB)*
