# Task Brief for Trae — WearOS Code Quality (Phase 1 + 2)

> **From**: WorkBuddy (code review pass completed 2026-05-12)  
> **Project**: Thoth — `e:\ceaserzhao\github projects\Thothapp`  
> **Module scope**: `android/wear/` + `android/common/`  
> **Do NOT touch**: `android/app/`, `src/`, `packages/`, iOS, Web  
> **Language**: All code and commits in English. Developer communicates in Chinese.

---

## Context

WearOS Phase W1 (recording flow) is structurally complete but has several bugs and quality issues found during a code review. This task is **not** about adding features — it's about fixing what's there.

The full detailed plan with code samples is at:  
`prepare/WEAROS_CODE_QUALITY_PLAN.md`

---

## Phase 1 — Blockers (do these first)

### Fix 1: Remove redundant `WearTheme` in `RecordingScreen`

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/ui/recording/RecordingScreen.kt`

The `RecordingScreen` composable wraps itself in `WearTheme { }` at line 46. But its caller `WearApp()` in `MainWearActivity.kt` already provides `WearTheme`. Delete the inner wrapper — keep only the `Box`.

```kotlin
// REMOVE the WearTheme { } wrapper around the Box in RecordingScreen
// The Box should be the top-level element returned by RecordingScreen
```

---

### Fix 2: Stop deleting audio file before upload confirms

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/service/AudioRecorderService.kt`

`stopRecording()` currently reads the file to bytes AND deletes it (line 62–63). If upload fails, the audio is gone forever.

Change `stopRecording()` to return the **file path** (String?) instead of ByteArray. The ViewModel will read the bytes and delete the file only after a confirmed successful upload.

See full before/after code in `prepare/WEAROS_CODE_QUALITY_PLAN.md` → P1-2.

---

### Fix 3: Don't swallow exceptions in `AudioRecorderService`

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/service/AudioRecorderService.kt`

The `catch` block at line 68 silently returns `byteArrayOf()` without logging the actual error. Add a `Log.e(...)` call before returning, so failures are visible in Logcat.

Also add `Log.w(...)` in the silent `catch (_: Exception) {}` inside `release()` (line 84).

---

### Fix 4: Remove `!!` force-unwrap from `AudioRecorderService`

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/service/AudioRecorderService.kt`

Line 34: `recorder!!.apply { ... }` — use a local `val` to avoid `!!`.  
Line 45: `return outputPath!!` — throw `IllegalStateException` instead.

See full before/after in `prepare/WEAROS_CODE_QUALITY_PLAN.md` → P1-4.

---

## Phase 2 — Quality Improvements

### Fix 5 (trivial, 2 min): Use `Config.MAX_RECORDING_DURATION_MS`

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/viewmodel/RecordingViewModel.kt` line 40

```kotlin
// BEFORE
private val maxRecordingMs = 5 * 60 * 1000L

// AFTER
private val maxRecordingMs = Config.MAX_RECORDING_DURATION_MS
```

---

### Fix 6: Lower audio sample rate to 16kHz for Wear OS

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/service/AudioRecorderService.kt` lines 38–39  
**File**: `android/common/src/main/java/com/thoth/dreamarchive/common/config/Config.kt`

Wear OS mics are optimised for voice at 16kHz. 44100Hz may cause `prepare()` to fail on some watches.

Add to `Config.kt`:
```kotlin
const val AUDIO_SAMPLE_RATE = 16000   // voice-optimised for Wear OS
const val AUDIO_BIT_RATE = 64000
```

Use in `AudioRecorderService`:
```kotlin
setAudioSamplingRate(Config.AUDIO_SAMPLE_RATE)
setAudioEncodingBitRate(Config.AUDIO_BIT_RATE)
```

---

### Fix 7: Extract color constants to `Color.kt`

**Files**: `RecordingScreen.kt`, `MainWearActivity.kt`

Create `android/wear/src/main/java/com/thoth/dreamarchive/wear/theme/Color.kt`:

```kotlin
package com.thoth.dreamarchive.wear.theme

import androidx.compose.ui.graphics.Color

val ThothPurple  = Color(0xFF6C63FF)
val RecordingRed = Color(0xFFFF4444)
val ErrorRed     = Color(0xFFFF5252)
val SuccessGreen = Color(0xFF4CAF50)
val SurfaceDark  = Color(0xFF2A2A3A)
```

Replace all inline hex color literals in `RecordingScreen.kt` and `MainWearActivity.kt` with these named constants.

---

### Fix 8: Extract route strings to `NavRoutes`

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/MainWearActivity.kt`

Create `NavRoutes.kt` in the `wear` package:
```kotlin
object NavRoutes {
    const val RECORDING = "recording"
    const val DREAMS = "dreams"
}
```

Replace all `"recording"` and `"dreams"` string literals in `MainWearActivity.kt`.

---

### Fix 9: Replace `CountDownTimer` with coroutine timer

**File**: `android/wear/src/main/java/com/thoth/dreamarchive/wear/viewmodel/RecordingViewModel.kt`

Replace the `CountDownTimer` (lines 55–64) with a `viewModelScope.launch { while(isActive) { delay(1000); ... } }` coroutine. This ties the timer lifecycle to the ViewModel correctly.

Full code sample in `prepare/WEAROS_CODE_QUALITY_PLAN.md` → P2-3.

---

### Fix 10: Migrate UI strings to `strings.xml`

Create `android/wear/src/main/res/values/strings.xml` with all user-facing text:
- `"Tap to Record"`, `"Recording…"`, `"Saving dream…"`, `"Dream saved!"`, `"Try Again"`, `"Mic access needed"`, `"Allow"`

Use `stringResource(R.string.xxx)` in Composables.

---

### Fix 11: Guard `audioUrl == null` before Firestore write

**File**: `RecordingViewModel.kt` line 93

If audio upload fails silently (returns `null`), the current code still writes a Dream record with no audio. Add a hard fail:

```kotlin
val audioUrl = audioUrlResult.getOrElse {
    throw Exception("Audio upload failed: ${it.message}")
}
```

---

## Commit Strategy

Commit after each phase, not after each individual fix. Suggested commit messages:

```
fix(wear): remove double WearTheme wrap, fix audio file lifecycle, stop swallowing exceptions
refactor(wear): extract colors/routes/strings, use Config constants, replace CountDownTimer
```

---

## Files You Will Touch

| File | Changes |
|------|---------|
| `wear/.../RecordingScreen.kt` | Remove WearTheme wrap, use color constants, use stringResource |
| `wear/.../MainWearActivity.kt` | Use NavRoutes, use color constants, use stringResource, add onResume check |
| `wear/.../RecordingViewModel.kt` | Use Config constant, coroutine timer, audioUrl guard |
| `wear/.../AudioRecorderService.kt` | Return path not bytes, add logging, remove `!!`, fix sample rate |
| `common/.../Config.kt` | Add AUDIO_SAMPLE_RATE, AUDIO_BIT_RATE |
| `wear/theme/Color.kt` | **NEW FILE** — color constants |
| `wear/NavRoutes.kt` | **NEW FILE** — route string constants |
| `wear/res/values/strings.xml` | **NEW FILE** — UI strings |

---

## Do NOT Change

- `android/app/` (Capacitor phone app — different team/phase)
- `FirebaseRepository.kt` (out of scope)
- `DreamListScreen.kt` (that's W2, a separate task)
- Any Web/iOS/`src/` files
