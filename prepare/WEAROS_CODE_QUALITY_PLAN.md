# WearOS Code Quality Improvement Plan

> **Created**: 2026-05-12  
> **Author**: WorkBuddy (code review pass)  
> **Target**: `android/wear/` + `android/common/` modules  
> **For**: Trae (implementation) / Developer reference  
> **Scope**: Code quality fixes only — no new features, no architecture rewrites

---

## Priority Legend

| Symbol | Meaning | Effort |
|--------|---------|--------|
| 🔴 Blocker | App crashes / data loss risk / silent failure | < 30 min each |
| 🟡 Should Fix | Bugs waiting to happen / maintainability debt | 30–90 min each |
| 💭 Nice to Have | Style / testability / future-proofing | 1–4 hrs each |

---

## Phase 1 — Immediate Blockers (Fix First, ~2 hours total)

### P1-1 🔴 Remove duplicate `WearTheme` wrapper in `RecordingScreen`

**File**: `wear/ui/recording/RecordingScreen.kt` line 46  
**File**: `wear/MainWearActivity.kt` line 97 (`PermissionScreen`)

`WearTheme { ... }` is already applied by `WearApp()` in `MainWearActivity`. Both `RecordingScreen` and `PermissionScreen` wrap themselves in a second `WearTheme`, causing double theme application which can override colors and typography unexpectedly.

**Fix**:
- Remove the `WearTheme { }` wrapper from `RecordingScreen` (keep just the inner `Box`)
- Remove the `WearTheme { }` wrapper from `PermissionScreen` (it is called outside `WearApp`, so it actually *needs* one — leave it, but note the intentionality in a comment)

```kotlin
// RecordingScreen.kt — BEFORE
@Composable
fun RecordingScreen(...) {
    WearTheme {          // ← DELETE this line
        Box(...)
    }                    // ← DELETE this closing brace
}

// RecordingScreen.kt — AFTER
@Composable
fun RecordingScreen(...) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) { ... }
}
```

---

### P1-2 🔴 Fix audio file deleted before upload retry is possible

**File**: `wear/service/AudioRecorderService.kt` line 63  
**Impact**: If `uploadAudio()` fails, the `.aac` file is already gone — no retry possible.

Current flow: `readBytes()` → `file.delete()` → pass bytes to ViewModel → ViewModel calls `uploadAudio(bytes)`.  
The bytes are in memory, so a *single* retry works, but if the process is killed mid-upload, audio is permanently lost.

**Fix**: Pass the **file path** up instead of bytes. Let the ViewModel delete the file only after a confirmed successful upload.

```kotlin
// AudioRecorderService.kt — change return type
fun stopRecording(): String? {
    return try {
        recorder?.apply { stop(); release() }
        recorder = null
        outputPath.also { outputPath = null }  // Return path, don't read or delete
    } catch (e: Exception) {
        Log.e("AudioRecorder", "stopRecording failed", e)
        release()
        null
    }
}

// RecordingViewModel.kt — caller handles file lifecycle
val audioPath = audioService.stopRecording()
    ?: throw AudioException("Recording failed — no output file")
val audioBytes = File(audioPath).readBytes()
val audioUrlResult = repository.uploadAudio(audioBytes, filename)
if (audioUrlResult.isSuccess) {
    File(audioPath).delete()  // Only delete after confirmed upload
} else {
    throw audioUrlResult.exceptionOrNull() ?: Exception("Upload failed")
}
```

---

### P1-3 🔴 Stop silently swallowing exceptions in `AudioRecorderService`

**File**: `wear/service/AudioRecorderService.kt` line 68–70

```kotlin
// BEFORE — exception message lost forever
} catch (e: Exception) {
    release()
    byteArrayOf()
}

// AFTER — log and rethrow (or return Result<>)
} catch (e: Exception) {
    Log.e("AudioRecorder", "stopRecording failed: ${e.message}", e)
    release()
    throw AudioRecordingException("Recording stop failed", e)
}
```

Also fix the silent `catch (_: Exception) {}` in `release()` (line 84) — at minimum add `Log.w`.

---

### P1-4 🔴 Remove `!!` force-unwrap in `AudioRecorderService`

**File**: `wear/service/AudioRecorderService.kt` line 34 and 45

```kotlin
// BEFORE
recorder = MediaRecorder(context)
recorder!!.apply { ... }     // ← !! is unnecessary, recorder was just assigned

// AFTER — use local val to eliminate !! entirely
val rec = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    MediaRecorder(context)
} else {
    @Suppress("DEPRECATION") MediaRecorder()
}
rec.apply {
    setAudioSource(MediaRecorder.AudioSource.MIC)
    setOutputFormat(MediaRecorder.OutputFormat.AAC_ADTS)
    setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
    setAudioSamplingRate(AUDIO_SAMPLE_RATE)
    setAudioEncodingBitRate(AUDIO_BIT_RATE)
    setOutputFile(outputPath)
    prepare()
    start()
}
recorder = rec
return outputPath ?: throw IllegalStateException("outputPath is null after setup")
```

---

## Phase 2 — Should Fix (~3–4 hours total)

### P2-1 🟡 Centralise all hardcoded colors into `WearTheme`

**Files affected**: `RecordingScreen.kt` (8 occurrences), `MainWearActivity.kt` (1 occurrence)

Create `wear/theme/Color.kt`:

```kotlin
// Color.kt
val ThothPurple = Color(0xFF6C63FF)     // brand accent / idle button
val RecordingRed = Color(0xFFFF4444)    // active recording indicator
val ErrorRed = Color(0xFFFF5252)        // error state
val SuccessGreen = Color(0xFF4CAF50)    // upload success
val SurfaceDark = Color(0xFF2A2A3A)     // secondary button background
```

Then reference these constants everywhere instead of inline hex literals.

---

### P2-2 🟡 Use `Config.MAX_RECORDING_DURATION_MS` in `RecordingViewModel`

**File**: `wear/viewmodel/RecordingViewModel.kt` line 40

```kotlin
// BEFORE
private val maxRecordingMs = 5 * 60 * 1000L   // duplicates Config value

// AFTER
private val maxRecordingMs = Config.MAX_RECORDING_DURATION_MS
```

One line change. Eliminates sync risk.

---

### P2-3 🟡 Replace `CountDownTimer` with a coroutine timer

**File**: `wear/viewmodel/RecordingViewModel.kt` lines 55–64

`CountDownTimer` is poorly integrated with coroutine cancellation. If the ViewModel is cleared while recording, the timer callback fires into a dead scope.

```kotlin
// AFTER — coroutine-based timer, auto-cancels with viewModelScope
private var timerJob: Job? = null

private fun startTimer() {
    timerJob = viewModelScope.launch {
        val startTime = System.currentTimeMillis()
        while (isActive) {
            val elapsed = ((System.currentTimeMillis() - startTime) / 1000).toInt()
            _uiState.update { it.copy(elapsedSeconds = elapsed) }
            if (elapsed * 1000L >= Config.MAX_RECORDING_DURATION_MS) {
                stopAndUpload()
                break
            }
            delay(1000L)
        }
    }
}

// In startRecording(), replace timer = object : CountDownTimer... with:
startTimer()

// In stopAndUpload(), replace timer?.cancel() with:
timerJob?.cancel()
timerJob = null
```

---

### P2-4 🟡 Extract hardcoded route strings to a `NavRoutes` object

**File**: `wear/MainWearActivity.kt` lines 79–86

```kotlin
// NavRoutes.kt (new file in wear/ package)
object NavRoutes {
    const val RECORDING = "recording"
    const val DREAMS = "dreams"
}

// MainWearActivity.kt — use constants
startDestination = NavRoutes.RECORDING
composable(NavRoutes.RECORDING) { ... }
composable(NavRoutes.DREAMS) { ... }
navController.navigate(NavRoutes.DREAMS)
```

---

### P2-5 🟡 Migrate all UI strings to `strings.xml`

**Files**: `RecordingScreen.kt`, `MainWearActivity.kt`

Create `wear/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">Thoth</string>
    <string name="label_tap_to_record">Tap to Record</string>
    <string name="label_recording">Recording…</string>
    <string name="label_saving_dream">Saving dream…</string>
    <string name="label_dream_saved">Dream saved!</string>
    <string name="label_try_again">Try Again</string>
    <string name="label_mic_access_needed">Mic access needed</string>
    <string name="label_allow">Allow</string>
</resources>
```

Then use `stringResource(R.string.label_tap_to_record)` in Composables.

---

### P2-6 🟡 Add `audioUrl == null` guard before saving to Firestore

**File**: `wear/viewmodel/RecordingViewModel.kt` line 93–99

```kotlin
// BEFORE — saves dream even if audio upload failed silently
val audioUrl = audioUrlResult.getOrNull()

// AFTER — fail fast if upload failed
val audioUrl = audioUrlResult.getOrElse {
    throw AudioUploadException("Audio upload failed", it)
}
```

---

### P2-7 🟡 Extract audio config constants and lower sample rate for Wear OS

**File**: `wear/service/AudioRecorderService.kt` lines 38–39

Most Wear OS devices have microphones optimised for voice at 16kHz, not 44.1kHz. High sample rates cause `prepare()` failures on some watches.

Add to `Config.kt`:
```kotlin
const val AUDIO_SAMPLE_RATE = 16000      // 16kHz — voice-optimised for Wear OS
const val AUDIO_BIT_RATE = 64000         // 64kbps — sufficient for voice
```

Use in `AudioRecorderService`:
```kotlin
setAudioSamplingRate(Config.AUDIO_SAMPLE_RATE)
setAudioEncodingBitRate(Config.AUDIO_BIT_RATE)
```

---

## Phase 3 — Nice to Have (hand off to future sprint)

### P3-1 💭 Fix `micPermissionGranted` not re-checked on `onResume`

**File**: `wear/MainWearActivity.kt`  
User can revoke mic permission via system settings and return. The UI won't reflect the change until the app restarts.

```kotlin
override fun onResume() {
    super.onResume()
    micPermissionGranted = ContextCompat.checkSelfPermission(
        this, Manifest.permission.RECORD_AUDIO
    ) == PackageManager.PERMISSION_GRANTED
}
```

---

### P3-2 💭 Bind `RecordingViewModel` to Activity scope (not composable scope)

**File**: `wear/ui/recording/RecordingScreen.kt` line 41  
Currently: `viewModel: RecordingViewModel = viewModel()` — creates a new instance per nav destination.  
Should be: `viewModel(LocalContext.current as ComponentActivity)` to survive back-stack navigation.

---

### P3-3 💭 Make `ServiceLocator` Firebase fields private

**File**: `common/di/ServiceLocator.kt`  
`auth`, `firestore`, `storage` are public — external code can bypass the Repository layer. Mark them `private`.

---

### P3-4 💭 Add `@Deprecated` annotation to `ServiceLocator.repository`

```kotlin
@Deprecated(
    message = "Use firebaseRepository instead",
    replaceWith = ReplaceWith("firebaseRepository")
)
val repository: FirebaseRepository get() = firebaseRepository
```

---

### P3-5 💭 Move `FIREBASE_PROJECT_ID` out of source into `BuildConfig`

**File**: `common/config/Config.kt`  
Sensitive config should not be committed to git. Inject via `build.gradle`:

```kotlin
// android/common/build.gradle.kts
buildConfigField("String", "FIREBASE_PROJECT_ID", "\"thoth-dream-archive\"")
```

Then reference as `BuildConfig.FIREBASE_PROJECT_ID`.

---

## Execution Order for Trae

```
Phase 1 (fix blockers first, can be done in one session):
  P1-1 → P1-2 → P1-3 → P1-4

Phase 2 (quality improvements, can be split across sessions):
  P2-2 (trivial, 2 min) → P2-7 (config extraction) → P2-1 (colors) → 
  P2-4 (nav routes) → P2-3 (timer refactor) → P2-5 (strings.xml) → P2-6 (guard)

Phase 3 (optional, deferred):
  P3-1 → P3-2 → P3-3 → P3-4 → P3-5
```

**Estimated total for Phase 1+2**: ~6–8 hours of focused development  
**Files to touch**: 6 Kotlin files + 1 new `Color.kt` + 1 new `NavRoutes.kt` + `strings.xml`

---

## What NOT to Change

- Do **not** introduce Hilt/Koin in this pass — too large a refactor, will break build
- Do **not** rewrite `FirebaseRepository` — it's outside scope
- Do **not** implement W2 (DreamListScreen) or W3 features — separate phase
- Do **not** modify `android/app/` (Capacitor phone app) — different module
