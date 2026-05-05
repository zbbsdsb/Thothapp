# Thoth — Android Module

Capacitor-based Android application for Thoth AI Dream Archive. This module wraps the React web app (`dist/`) inside a native Android WebView, with native plugin bridges (SplashScreen, StatusBar, Haptics, LocalNotifications).

---

## Quick Start

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets into Android project
npx cap sync android

# 3. Build debug APK/AAB
cd android
.\gradlew.bat assembleDebug        # APK (debug)
.\gradlew.bat bundleDebug          # AAB (debug)

# 4. Install on connected device/emulator
npx cap run android
```

---

## Environment Setup

### Required Tools

| Tool | Version | Notes |
|------|---------|-------|
| JDK | 17+ (bundled with Android Studio) | `JAVA_HOME` must be set |
| Android Studio | Latest | SDK Platform & Build Tools |
| Android SDK Build Tools | **36.0.0** | Matches `variables.gradle` |
| Gradle | 8.13+ (wrapper included) | No manual install needed |
| Node.js | 20+ | For `npm run build` and Capacitor CLI |
| Capacitor CLI | 8.3.1+ | `npx cap` |

### Environment Variables (Windows / PowerShell)

```powershell
# Must be set before running Gradle
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"   # or your SDK path
```

> **Tip**: Add these to your PowerShell profile (`notepad $PROFILE`) for persistence.

### Verify Setup

```bash
.\gradlew.bat -v        # Should print Gradle + JDK version
.\gradlew.bat tasks      # List available Gradle tasks
```

---

## Project Structure

```
android/
├── app/                              # Main application module
│   ├── build.gradle                  # App-level Gradle config
│   ├── capacitor.build.gradle        # Injected by Capacitor CLI
│   ├── proguard-rules.pro            # Release minification rules
│   ├── keystore.properties          # [GITIGNORED] Release signing config
│   └── src/main/
│       ├── AndroidManifest.xml       # App permissions, theme, activity
│       ├── java/.../MainActivity.kt # Capacitor activity (auto-generated)
│       └── res/
│           ├── values/themes.xml     # Material3 Dark theme
│           ├── values/colors.xml    # Brand colors (#0a0a0f, #00d4ff)
│           ├── mipmap-xxxhdpi/     # App icons (all densities)
│           └── drawable/            # Splash, adaptive icons
├── capacitor-cordova-android-plugins/  # Cordova plugin bridge
│   └── build.gradle
├── build.gradle                      # Root Gradle (plugins, classpath)
├── variables.gradle                  # [KEY FILE] SDK versions & dep versions
├── settings.gradle                   # Module includes + Capacitor settings
├── gradle.properties                # JVM args, AndroidX enable
├── .gitignore                       # Keystore, google-services.json ignored
└── README.md                        # This file
```

---

## Gradle Configuration

### `variables.gradle` — Version Centralization

All SDK and dependency versions are centralized here (injected via `rootProject.ext.*`):

```groovy
ext {
    minSdkVersion = 24          // Android 7.0 (Nougat) minimum
    compileSdkVersion = 36       // Android 16 (API 36)
    targetSdkVersion = 36        // Target latest
    buildToolsVersion = "36.0.0" // Must match installed Build Tools

    // AndroidX versions
    androidxActivityVersion = '1.11.0'
    androidxAppCompatVersion = '1.7.1'
    coreSplashScreenVersion = '1.2.0'
    // ... (see file for full list)
}
```

> **⚠️ Important**: If you see `Failed to find Build Tools revision XX.0.0`, update `buildToolsVersion` to match what's installed in Android Studio SDK Manager.

### `build.gradle` (Root)

```groovy
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.13.0'    // AGP version
        classpath 'com.google.gms:google-services:4.4.2'      // Firebase plugin
    }
}

apply from: "variables.gradle"   // Load SDK versions
```

### `app/build.gradle` — App Module

Key sections:

```groovy
android {
    namespace = "com.thoth.dreamarchive"
    compileSdk = rootProject.ext.compileSdkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion

    defaultConfig {
        applicationId "com.thoth.dreamarchive"
        minSdkVersion 24
        targetSdkVersion 36
        versionCode 1
        versionName "1.0"
    }

    signingConfigs {
        release {   // Configured via keystore.properties (gitignored)
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            minifyEnabled false
        }
    }
}

dependencies {
    implementation "com.google.android.material:material:1.12.0"  // Material3
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
}
```

---

## Signing Configuration

### Debug Builds (Development)

Debug builds are automatically signed with the default debug keystore (`~/.android/debug.keystore`).

**Debug SHA-256** (for Firebase Console):
```
6A:5D:05:F8:B5:D8:74:A4:42:AE:04:7B:4A:7F:3C:EA:CD:EC:9C:60:FB:DA:0B:6D:73:4F:9B:09:C8:09:F4:1F
```

Add this fingerprint to Firebase Console → Project Settings → Android App → SHA certificates.

### Release Builds (Google Play)

Release builds are signed with a custom keystore, configured via `android/app/keystore.properties` (gitignored).

#### Setting Up Release Signing

1. **Generate upload keystore** (done — `app/thoth-upload-key.jks`):
   ```bash
   keytool -genkey -v -keystore thoth-upload-key.jks ^
     -keyalg RSA -keysize 2048 -validity 10000 ^
     -alias thoth-upload
   ```

2. **Create `keystore.properties`** in `android/app/` (gitignored):
   ```properties
   storeFile=thoth-upload-key.jks
   storePassword=YOUR_SECURE_PASSWORD
   keyAlias=thoth-upload
   keyPassword=YOUR_SECURE_PASSWORD
   ```

3. **Verify signing**:
   ```bash
   .\gradlew.bat signingReport
   ```

#### Release SHA-256 Fingerprints

| Keystore | SHA-256 |
|----------|---------|
| Upload Key (thoth-upload-key.jks) | `F7:FD:2E:98:78:47:9E:83:41:26:D5:11:1A:2D:D8:F4:18:4A:18:D1:27:97:15:A0:AF:BD:32:1D:E3:E7:A8:86` |
| Google Play App Signing (after upload) | Get from Play Console → Setup → App Integrity |

> **⚠️ CRITICAL**: After first upload to Google Play, Google manages the final signing key. Add the **Google Play App Signing SHA-256** to Firebase Console, NOT the upload key.

---

## Build Commands Reference

### Development Builds

```bash
# Debug APK (fast, auto-signed with debug keystore)
.\gradlew.bat assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Install directly to device/emulator
npx cap run android

# Sync web assets without full rebuild
npx cap sync android
```

### Release Builds

```bash
# Release AAB (for Google Play)
.\gradlew.bat bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab

# Release APK (for side-loading / testing)
.\gradlew.bat assembleRelease
# Output: app/build/outputs/apk/release/app-release-unsigned.apk
# (Signed if keystore.properties exists)
```

### Cleaning

```bash
.\gradlew.bat clean          # Clean build cache
.\gradlew.bat cleanBuildCache  # Clean Gradle build cache
```

---

## Capacitor Workflow

Capacitor syncs the web build output (`dist/`) into the Android project.

```bash
# Full sync (web build + copy to Android + update natives)
npm run build && npx cap sync android

# Sync only (after manual web build)
npx cap sync android

# Update Capacitor native code (after plugin changes)
npx cap update android

# Open Android Studio
npx cap open android
```

### `capacitor.config.ts` — Android-Specific Settings

```ts
android: {
  allowMixedContent: true,     // ⚠️ TEMPORARY: remove after R2 HTTPS migration
  backgroundColor: '#0a0a0f', // Match web dark theme
  overrideUserAgent: 'ThothApp/Android',
  androidScheme: 'https',      // Use HTTPS scheme in WebView
}
```

---

## Firebase Setup

### `google-services.json`

This file is **not required** for Capacitor apps where Firebase is initialized in JavaScript (`src/lib/firebase.ts`). However, if you use native Firebase features (FCM, Crashlytics), place `google-services.json` in `android/app/`.

The `app/build.gradle` includes a safe guard:

```groovy
try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied.")
}
```

### Firebase Console Configuration

Add both SHA-256 fingerprints in Firebase Console → Project Settings → Your Android App:

1. **Debug SHA-256** (for development builds)
2. **Release SHA-256** (for production — use Google Play App Signing key after first upload)

---

## WearOS Module (Planned)

A separate `wear/` module is planned for WearOS smartwatch support. See `docs/WEAROS_PLAN.md` for the full architecture.

When implemented, the project structure will be:

```
android/
├── app/        ← Existing phone app
├── wear/        ← [PLANNED] WearOS app (minSdk 30, Jetpack Compose)
├── common/      ← [PLANNED] Shared Kotlin module (Firebase, data models)
└── ...
```

Gradle configuration for the WearOS module is documented in `docs/WEAROS_PLAN.md`.

---

## Troubleshooting

### `JAVA_HOME is not set`

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
# Add to PowerShell profile for persistence:
# Add-Content $PROFILE '$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"'
```

### `Failed to find Build Tools revision XX.0.0`

The project's `variables.gradle` specifies `buildToolsVersion = "36.0.0"`. If you have a different version installed:

1. Open Android Studio → SDK Manager → SDK Tools → check installed Build Tools version
2. Update `variables.gradle` → `buildToolsVersion = "YOUR_VERSION"`
3. Also update `capacitor-cordova-android-plugins/build.gradle` if present

### `Theme.Material3.Dark.NoActionBar not found`

Ensure `com.google.android.material:material:1.12.0` is in `app/build.gradle` dependencies.

### `Keystore file not found`

`keystore.properties` uses relative paths. If `storeFile=thoth-upload-key.jks`, the keystore must be in `android/app/` (same dir as `keystore.properties`).

**Wrong**: `storeFile=app/thoth-upload-key.jks` (resolves to `app/app/...`)  
**Correct**: `storeFile=thoth-upload-key.jks`

### `allowMixedContent` Google Play Rejection Risk

`capacitor.config.ts` sets `allowMixedContent: true` to allow HTTP requests from the HTTPS WebView. This violates Google Play's cleartext traffic policy.

**Fix**: Ensure all R2 endpoints use HTTPS, then remove `allowMixedContent: true` from `capacitor.config.ts`.

---

## Google Play Release Checklist

- [ ] `keystore.properties` configured with secure password (not `Thoth@2026`)
- [ ] `versionCode` incremented in `app/build.gradle`
- [ ] `versionName` updated in `app/build.gradle`
- [ ] Release AAB built: `.\gradlew.bat bundleRelease`
- [ ] AAB tested on release configuration: `.\gradlew.bat assembleRelease` + side-load APK
- [ ] `allowMixedContent: true` removed (or justified in Play Console)
- [ ] Privacy policy URL added to Firebase Console + Play Console
- [ ] App signed with upload key, uploaded to Play Console
- [ ] Google Play App Signing SHA-256 added to Firebase Console
- [ ] Store listing complete (screenshots, descriptions, graphics)

---

## Useful Gradle Tasks

```bash
.\gradlew.bat tasks --all          # List all available tasks
.\gradlew.bat signingReport        # Show signing configs and fingerprints
.\gradlew.bat dependencyInsight --dependency androidx.activity --configuration compileClasspath
.\gradlew.bat app:dependencies     # Show dependency tree
```

---

*Last updated: 2026-05-05*
