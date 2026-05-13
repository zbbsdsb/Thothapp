# Thoth WearOS — Development Handover (for New Team)

> **Language**: English
> **Prepared**: 2026-05-10
> **Status**: Active development — Phase W1 recording flow complete, Phase W2/W3 outstanding
> **Author**: Original developer (zhaoceaser)
> **For**: Incoming development team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [What's Implemented vs. Planned](#3-whats-implemented-vs-planned)
4. [Critical Issues — Read Before Building](#4-critical-issues--read-before-building)
5. [Gaps & Optimization Opportunities](#5-gaps--optimization-opportunities)
6. [Phase-by-Phase Next Steps](#6-phase-by-phase-next-steps)
7. [Environment & Build](#7-environment--build)
8. [Firebase Configuration](#8-firebase-configuration)
9. [Known Build-Time Fixes Already Applied](#9-known-build-time-fixes-already-applied)
10. [Style & Conventions](#10-style--conventions)

---

## 1. Project Overview

**Thoth** is a voice-first dream journal with AI analysis (Google Gemini). The WearOS companion app strips everything down to one action: record a dream the moment you wake up.

- **Package name**: `com.thoth.dreamarchive.wear`
- **Minimum SDK**: 30 (Wear OS 3.0)
- **Target/Compile SDK**: 34
- **Architecture**: MVVM + Jetpack Compose (Wear)
- **Backend**: Firebase (Auth + Firestore + Storage)
- **Phone companion**: Capacitor/React Native app at `android/app/` — separate APK

**The watch is standalone**. It does NOT require the phone app to be installed. It records audio locally, then uploads directly to Firebase (Firestore + Storage).

---

## 2. Architecture

### Module Layout

```
android/
├── app/                          # Capacitor phone app (existing)
├── wear/                         # WearOS standalone app (active development)
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/thoth/dreamarchive/wear/
│       │   ├── MainWearActivity.kt        # Single Activity, permission + navigation
│       │   ├── theme/WearTheme.kt         # Dark theme (#0a0a0f background)
│       │   ├── ui/
│       │   │   ├── recording/RecordingScreen.kt
│       │   │   └── dreams/DreamListScreen.kt   # TODO — needs implementation
│       │   ├── viewmodel/
│       │   │   ├── RecordingViewModel.kt       # P0 done ✅
│       │   │   └── DreamListViewModel.kt        # Skeleton only ⚠️
│       │   └── service/
│       │       └── AudioRecorderService.kt      # P0 done ✅
│       └── res/
├── common/                       # Shared library (Firebase models + repository)
│   └── src/main/java/com/thoth/dreamarchive/common/
│       ├── config/Config.kt
│       ├── data/FirebaseRepository.kt
│       ├── di/ServiceLocator.kt
│       └── model/Dream.kt
└── build.gradle / settings.gradle / variables.gradle
```

### Key Dependencies (from `variables.gradle`)

| Library | Version |
|---------|---------|
| Kotlin | `1.9.24` |
| Compose Compiler | `1.5.14` (via `composeKotlinCompilerVersion`) |
| Wear Compose Material3 | `1.0.0-alpha23` |
| Wear Compose Navigation | `1.3.1` |
| Firebase BoM | `32.7.2` |
| Wear Min SDK | `30` |
| Wear Target/Compile SDK | `34` |

> ⚠️ **Alpha dependency**: `wear-compose-material3:1.0.0-alpha23` is an alpha version. Consider upgrading to a stable release before release (e.g., `1.3.0+` if available, with corresponding Kotlin/Compose compiler version bump).

---

## 3. What's Implemented vs. Planned

### Phase W0 — Scaffold ✅ COMPLETE

| Item | Status | Notes |
|------|--------|-------|
| `common/` module | ✅ Done | FirebaseRepository, Dream model, ServiceLocator |
| `wear/` module with Compose | ✅ Done | Full structure in place |
| Gradle multi-module | ✅ Done | `settings.gradle`, `variables.gradle` updated |
| WearOS dark theme | ✅ Done | `#0a0a0f` background, `#6C63FF` accent |
| Debug APK builds | ✅ Done | `wear-debug.apk` (~30 MB) confirmed |

### Phase W1 — Recording ✅ FUNCTIONAL (not yet on real device)

| Item | Status | Notes |
|------|--------|-------|
| Large circular record button | ✅ Done | 96dp, `#6C63FF` accent, "Tap to Record" label |
| Recording timer display | ✅ Done | `MM:SS` format, `CountDownTimer` |
| Pulsing animation | ✅ Done | Scale 1→1.15, 600ms, reverses |
| Auto-stop at 5 min | ✅ Done | `maxRecordingMs = 300_000L` |
| AudioRecorderService | ✅ Done | MediaRecorder, AAC format, 44.1kHz/128kbps |
| Upload to Firebase Storage | ✅ Done | `repository.uploadAudio()` |
| Save to Firestore | ✅ Done | `repository.createDream()` |
| Haptic feedback | ✅ Done | Start: 80ms one-shot; Stop: 60-60-60 waveform |
| Permission handling | ✅ Done | `RECORD_AUDIO` runtime permission in `MainWearActivity` |
| Error state UI | ✅ Done | Error screen with "Try Again" |
| Success state UI | ✅ Done | Checkmark, "Dream saved!", record another button |

### Phase W2 — Dream List ❌ NOT IMPLEMENTED

| Item | Status | Notes |
|------|--------|-------|
| `DreamListScreen.kt` | ⚠️ Stub only | Shows "Recent Dreams (TODO)" — no Firestore binding |
| `DreamListViewModel.kt` | ⚠️ Skeleton only | `loadDreams()` is empty, uses `List<Any>` |
| `FirebaseRepository.getDreams()` | ✅ Done | Flow-based, ordered by `createdAt` |
| Scrollable list UI | ❌ Todo | Needs `LazyColumn` + Wear `ScalingLazyColumn` |
| Tap to expand snippet | ❌ Todo | Transcript + duration display |
| Pull-to-refresh | ❌ N/A | WearOS doesn't use swipe-to-refresh |
| Delete dream | ❌ Todo | `repository.deleteDream()` exists but not wired |

### Phase W3 — Polish ❌ NOT STARTED

| Item | Status | Notes |
|------|--------|-------|
| Loading states | ⚠️ Partial | Circular progress shown on upload, but dream list has none |
| Upload progress indicator | ❌ Missing | Shows indeterminate spinner only |
| Real device test | ❌ Todo | Emulator and real-device testing needed |
| CI/CD — wear release build | ❌ Todo | `release.yml` does not build `:wear:assembleRelease` |
| WearOS companion listing | ❌ Todo | Separate Play Store listing or companion flag in phone listing |

---

## 4. Critical Issues — Read Before Building

### Issue 1: Firebase Does NOT Initialize on the Wear App (🔴 CRITICAL)

**Problem**: The `wear/` module does not apply the `com.google.gms.google-services` plugin. The `common/` library module also cannot apply it (Android Gradle restriction). `FirebaseAuth.getInstance()`, `FirebaseFirestore.getInstance()`, and `FirebaseStorage.getInstance()` will all throw `IllegalStateException` because no `FirebaseApp` has been initialized.

**Impact**: `RecordingViewModel` calls `ServiceLocator.firebaseRepository` in its constructor. If Firebase is not initialized, the app will **crash on launch** — before the user can even see the recording screen.

**Root cause**: `common/build.gradle` explicitly has the comment:
```
// Note: google-services plugin is NOT applied here (library module).
// Firebase is initialized in the :app module.
```

But `wear/` does not initialize Firebase either.

**Fix — required before any testing** (choose one):

**Option A (Recommended — use `google-services.json`):**
1. Download `google-services.json` from Firebase Console → Project Settings → Android App (add the WearOS app as a separate app with package `com.thoth.dreamarchive.wear`)
2. Place it at `android/wear/google-services.json`
3. Add to `wear/build.gradle`:
```groovy
apply plugin: 'com.google.gms.google-services'
```
4. Add to `wear/build.gradle` `dependencies`:
```groovy
implementation platform("com.google.firebase:firebase-bom:${rootProject.ext.firebaseBomVersion}")
```

**Option B (Programmatic initialization — no `google-services.json` needed):**
Add this to `MainWearActivity.onCreate()` before `setContent()`:
```kotlin
// Initialize Firebase programmatically
val config = FirebaseOptions.Builder()
    .setApplicationId("YOUR_APP_ID")       // from Firebase Console
    .setProjectId("thoth-dream-archive")
    .setStorageBucket("thoth-dream-archive.appspot.com")
    .setApiKey("YOUR_API_KEY")             // from Firebase Console
    .build()
if (FirebaseApp.getApps(this).isEmpty()) {
    FirebaseApp.initializeApp(this, config)
}
```

> ⚠️ Option B requires hardcoding the API key in source code. For a production app, Option A with a `google-services.json` is strongly preferred (the key is not a secret — it's embedded in every Firebase Android app).

---

### Issue 2: `DreamListViewModel` Is Never Connected to the Screen

**Problem**: `DreamListScreen` calls `DreamListViewModel()` directly (default ViewModel constructor) but never calls `loadDreams()`. The screen shows a static "Recent Dreams (TODO)" text.

**Fix**: In `DreamListScreen.kt`:
```kotlin
@Composable
fun DreamListScreen(onBack: () -> Unit) {
    val viewModel: DreamListViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.loadDreams()
    }
    // ... replace TODO content with actual LazyColumn rendering uiState.dreams
}
```

---

### Issue 3: `DreamListUiState.dreams` Uses `List<Any>` Instead of `List<Dream>`

**Problem**: `DreamListUiState.dreams` is typed as `List<Any>` with a comment `// TODO: Use Dream type from common/`. The `Dream` class from `common/model/Dream.kt` already exists.

**Fix**: Change to `List<Dream>` and use `Dream` in the UI.

---

### Issue 4: Anonymous Auth Has No Retry or Persistence Strategy

**Problem**: `RecordingViewModel.ensureSignedIn()` calls `signInAnonymously()` once and throws if it fails. If Firebase is temporarily unreachable, the user sees an error and must retry manually.

**Fix**: Add retry logic (e.g., 2 attempts with exponential backoff), or use `AuthStateListener` to handle session persistence.

---

## 5. Gaps & Optimization Opportunities

### High Priority

1. **`DreamListScreen` is a hardcoded stub** — this is the main Phase W2 deliverable
2. **No offline queue** — if upload fails, the audio is lost (deleted from cache after `stopRecording()`). Consider writing to a local SQLite/Realm file and retrying on next launch
3. **No foreground service** — `AudioRecorderService` records in the foreground of the Activity. If the user navigates away or the screen dims, recording may be interrupted. A proper foreground service with a persistent notification is recommended
4. **`keepScreenOn` not set** — the recording screen should use `WindowCompat.setKeepScreenOn()` to prevent screen timeout during recording

### Medium Priority

5. **Light/dark theme not implemented** — `WearTheme` hardcodes dark colors. Should use `ColorScheme.fromProvider()` or system-based `dynamicColor` for Wear OS 4+
6. **No real-device testing** — Phase W1 has not been tested on actual hardware. Emulators do not reliably represent audio quality, haptics, or battery behavior
7. **No Firebase Realtime DB** — not needed for MVP but would enable real-time dream list updates without polling
8. **Dream model is not fully aligned with phone app** — the phone app may use different field names or additional fields in Firestore. Verify `Dream.kt` matches the actual Firestore schema used by the web/phone app

### Low Priority

9. **APK size (~30 MB)** — large for a minimal app. ProGuard/R8 minification is not configured for the wear module. Running `minifyEnabled true` in release builds could reduce this significantly
10. **Memory leak risk** — `AudioRecorderService` is held by `RecordingViewModel`. Verify cleanup in `onCleared()` covers all edge cases (e.g., phone call interruption)
11. **Upload has no progress feedback** — only shows indeterminate spinner. `StorageReference.putBytes()` returns an `UploadTask` with progress listeners
12. **No unit tests** — `AudioRecorderService`, `FirebaseRepository`, and `RecordingViewModel` have no test coverage
13. **No localization** — all strings are hardcoded in English

### Nice-to-Have (P3 in original plan)

14. **Memory collapse nudge** — "12h since last dream" vibration. Not planned for v1, but would be a good v1.1 feature
15. **Watch face complication** — expose the record button as a complication. Requires the `com.google.android.wearable` wear library and a `ComplicationProviderService`

---

## 6. Phase-by-Phase Next Steps

### Phase W2: Dream List (Priority: HIGH — do this first after onboarding)

1. **Connect `DreamListViewModel` to `DreamListScreen`**
   - Add `LaunchedEffect(Unit) { viewModel.loadDreams() }` to the screen
   - Replace `List<Any>` with `List<Dream>` from `common/model/Dream.kt`
   - Wire up `FirebaseRepository.getDreams(userId)` in `loadDreams()`

2. **Implement the scrollable list UI**
   - Use `ScalingLazyColumn` (Wear's responsive equivalent of `LazyColumn`)
   - Show dream date, duration, and first ~60 chars of transcript
   - Handle empty state ("No dreams yet — start recording!")
   - Handle loading state (`CircularProgressIndicator`)
   - Handle error state (Firestore permission denied, network error)

3. **Add tap-to-expand**
   - Show full transcript + tags on tap
   - Optional: show play button to stream `audioUrl` via `AudioTrack`

4. **Handle Firestore security rules**
   - Ensure the anonymous auth UID can read/write `dreams` in Firestore
   - Test that `whereEqualTo("userId", userId)` correctly isolates user data

**Estimated time**: 1 day

---

### Phase W3: Polish & Release Preparation

1. **Real device testing** (most important task here)
   - Install `wear-debug.apk` on a physical watch
   - Test: record 30s, check Firebase Storage + Firestore
   - Test: airplane mode → record → reconnect → verify retry behavior
   - Test: haptic feedback on actual hardware
   - Test: screen stays on during recording

2. **Foreground service for recording**
   - Create `RecordingForegroundService` extending `Service`
   - Show persistent notification ("Recording dream…")
   - Handle `onDestroy()` to save partial audio on crash

3. **Upload progress indicator**
   - Replace `CircularProgressIndicator` with `LinearProgressIndicator` showing actual upload %

4. **CI/CD — add wear release build**
   Update `.github/workflows/release.yml`:
   ```yaml
   - name: Build WearOS Release
     run: ./gradlew :wear:assembleRelease
     env:
       ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
       ANDROID_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
       ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
       ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}

   - name: Upload WearOS AAB
     uses: actions/upload-artifact@v4
     with:
       name: wear-aab
       path: android/wear/build/outputs/aab/release/wear-release.aab
   ```

5. **Play Store — WearOS companion listing**
   - Option A: Add as a "companion app" on the same Play Console listing as the phone app
   - Option B: Create a separate listing for the standalone WearOS app
   - Package name: `com.thoth.dreamarchive.wear` (already configured)
   - Requires its own screenshots, store listing, and Privacy Policy URL

**Estimated time**: 0.5–1 day

---

## 7. Environment & Build

### Build Commands

```bash
# Build wear debug APK
cd android
.\gradlew.bat :wear:assembleDebug

# Build both phone + wear
.\gradlew.bat assembleDebug

# Build wear release APK (requires keystore config in secrets)
.\gradlew.bat :wear:assembleRelease

# Clean build artifacts
.\gradlew.bat :wear:clean
```

### Required Environment Variables (for release builds)

| Secret | Purpose |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Keystore file (base64-encoded) |
| `ANDROID_STORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (`thoth-upload`) |
| `ANDROID_KEY_PASSWORD` | Key password |

### Known Environment Issues (already fixed)

The following was fixed on 2026-05-10 — do NOT revert:

- `gradle.properties` had `org.gradle.java.home` pointing to `C:\Program Files\Android\openjdk\jdk-21.0.8` which does not exist on this machine. Updated to `F:\Android\jdk17\jdk-17.0.14+7`. If building on a new machine, verify this path or set it via `local.properties`:
  ```properties
  org.gradle.java.home=F\:\\Android\\jdk17\\jdk-17.0.14+7
  ```

---

## 8. Firebase Configuration

### Phone vs. Wear — Two Firebase Apps

The WearOS app should be registered as a **separate Android app** in Firebase Console:

| | Phone App | WearOS App |
|-|-----------|------------|
| Package name | `com.thoth.dreamarchive` | `com.thoth.dreamarchive.wear` |
| google-services.json | `android/app/google-services.json` | `android/wear/google-services.json` |
| App ID (from Firebase) | `1:...:android:...` | Different `1:...:android:...` |

Both can point to the **same Firebase project** (`thoth-dream-archive`), which means they share the same Firestore database, Storage bucket, and Auth — a WearOS recording immediately appears in the phone app's dream list.

### Firestore Schema

The `Dream` document structure in Firestore:

```
dreams/{dreamId}
├── id:          string
├── userId:      string
├── transcript:   string
├── audioUrl:    string | null
├── duration:    number (seconds)
├── tags:        string[]
├── insight:     string | null
├── sentiment:   string | null
├── country:     string | null
├── createdAt:   Timestamp (server-set)
└── isPublic:    boolean
```

> ⚠️ **Important**: WearOS uploads a dream with `transcript = ""` (empty). The phone app or a Cloud Function should transcribe and fill this in later. Verify this is handled on the phone/web side.

### Firestore Security Rules

The current rules (from `firestore.rules`) must allow anonymous auth. Verify this entry exists:

```
match /dreams/{dreamId} {
  allow read, write: if request.auth != null
                     && request.auth.uid == resource.data.userId;
}
```

---

## 9. Known Build-Time Fixes Already Applied

The following deviations from the original `WEAROS_PLAN.md` were applied during the actual build run on May 6–10, 2026. **Do NOT revert these — they are required for the project to build:**

| Item | Original Plan | Applied Fix |
|------|--------------|-------------|
| Wear Compose BOM | `compose-bom:2024.02.00` | BOM does not exist — replaced with explicit `1.0.0-alpha23` |
| Kotlin version | `2.0.21` | JDK 17 constraint → `1.9.24` |
| `common/build.gradle` | Apply `google-services` plugin | Removed (library modules can't use it) |
| JVM target | Not specified | Added `compileOptions` + `kotlinOptions jvmTarget = '17'` |
| `gradle.properties` | JDK 21 path | Updated to `F:\Android\jdk17\...` |

---

## 10. Style & Conventions

### Code Style
- **Language**: Kotlin (1.9.24)
- **Coroutines**: Use `viewModelScope.launch {}` for all async work in ViewModels
- **State**: `StateFlow` (not `LiveData`) — `collectAsStateWithLifecycle()` in Compose
- **No Hilt/Dagger**: Manual `ServiceLocator` pattern (already in place)
- **Error handling**: `Result<T>` from `FirebaseRepository`, surfaced via `RecordingState.Error`

### String Conventions
All UI strings are currently hardcoded in English. If localization is needed, move to `res/values/strings.xml` and use `stringResource()`.

### Commit Message Style
English, conventional commits format:
```
feat(wear): add dream list screen with Firestore binding
fix(wear): initialize Firebase before ServiceLocator access
chore(wear): upgrade Compose to stable 1.3.0
```

---

## Quick Start for New Team Members

```bash
# 1. Clone the repo
git clone https://github.com/zbbsdsb/Thothapp.git
cd Thothapp

# 2. Install Firebase config (REQUIRED before build)
# Download google-services.json from Firebase Console → WearOS app
# Place at: android/wear/google-services.json

# 3. Apply google-services plugin (edit wear/build.gradle)
# Add: apply plugin: 'com.google.gms.google-services'

# 4. Sync Gradle
cd android
.\gradlew.bat :wear:sync

# 5. Build
.\gradlew.bat :wear:assembleDebug

# 6. Install on watch/emulator
adb install -r wear/build/outputs/apk/debug/wear-debug.apk
```

---

*Last updated: 2026-05-10 by AI assistant during handoff review*
