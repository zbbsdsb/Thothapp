# Thoth — Google Play Release Bug Investigation & Preparation

## Overview
- **Summary**: This document outlines the investigation and fixes required for a successful Google Play release of the Thoth AI Dream Journal app. Identifies critical bugs, missing assets, and compliance requirements.
- **Purpose**: Ensure the app is stable, secure, and compliant with Google Play policies prior to submission.
- **Target Users**: End users of the Thoth app on Android, and the development team preparing for release.

## Goals
1. Fix the critical infinite render bug in App.tsx
2. Ensure all Google Play compliance requirements are met
3. Verify all required store listing assets are present
4. Ensure API keys and configurations are set up correctly
5. Test the app build process and ensure AAB generation works
6. Validate data safety and permissions declarations

## Non-Goals (Out of Scope)
- Feature development for new functionality
- iOS App Store release (focus on Google Play)
- Complete WeChat Pay or Alipay integration (for future releases)
- Wear OS integration (future scope)

## Background & Context
Thoth is an AI-powered dream journal app built with Capacitor (Android/iOS), React, Firebase, and Google Gemini AI. The app has been developed and is now being prepared for release on Google Play. Key context:

- **Technical Stack**: React + Vite + Capacitor + Firebase + Express backend
- **Current Version**: 1.0.8
- **Current Status**: App build process exists, store listing content is drafted, but there are known bugs and missing elements.
- **Critical Bug Found**: Infinite render in App.tsx line 36 (useState() used where useEffect() should be)

## Functional Requirements

### FR-1: Fix Infinite Render Bug
- **Description**: App.tsx line 36 uses useState() with a callback that causes infinite re-renders
- **Scope**: Frontend React app
- **Acceptance**: No console errors, app doesn't freeze or continuously re-render

### FR-2: Privacy Policy Hosting
- **Description**: Privacy policy must be publicly accessible via a HTTPS URL
- **Scope**: Web hosting/setup
- **Acceptance**: Privacy policy URL responds 200 OK, content matches docs/PRIVACY.md

### FR-3: Store Listing Assets Completion
- **Description**: All required Play Store listing assets must be present and correct
- **Scope**: Graphic assets, screenshots
- **Acceptance**: 
  - Screenshots uploaded (min 2)
  - Feature graphic exists and meets specs (1024x500)
  - App icon correct and properly sized

### FR-4: Permission Justification
- **Description**: Each permission requested must be properly justified in the Play Console
- **Scope**: AndroidManifest.xml, Play Console
- **Acceptance**: All permissions documented and justified according to Play policy

### FR-5: Data Safety Form Completion
- **Description**: Google Play Data Safety form must be accurately filled out
- **Scope**: Play Console
- **Acceptance**: Data collection and sharing accurately declared, encryption practices documented

## Non-Functional Requirements

### NFR-1: Stability
- **Description**: App must not crash on launch or common user flows
- **Acceptance**: 
  - No ANRs (App Not Responding) on common devices
  - No crashes recorded during testing
  - Memory usage stays within reasonable limits

### NFR-2: Security
- **Description**: No API keys or secrets exposed in client-side code
- **Acceptance**:
  - Firebase API keys are properly secured (they're public by design)
  - Private keys are kept server-side only
  - No secrets in .env files committed to repo

### NFR-3: Build Performance
- **Description**: AAB (Android App Bundle) must generate correctly and be under size limits
- **Acceptance**:
  - `./gradlew bundleRelease` completes without errors
  - AAB size < 150MB (or uses Play Asset Delivery properly)

### NFR-4: Signing
- **Description**: App must be properly signed for release
- **Acceptance**:
  - keystore.properties configured properly
  - Release build uses release signing config
  - SHA-256 fingerprint uploaded to Play Console

## Constraints

- **Technical**: 
  - Must build with Android Gradle Plugin as configured
  - Must support minSdkVersion 24 (Android 7)
  - Target API level must be 36 (as per Play requirements)
- **Business**:
  - Must be completed before targeted release date
  - Must comply with Google Play policies (Data Safety, permissions, content rating)
- **Dependencies**:
  - Firebase project must remain active
  - Gemini API must be accessible
  - Cloudflare R2 must remain configured

## Assumptions

1. Firebase google-services.json is present and correctly configured in android/app/
2. Keystore is available and passwords known
3. Google Cloud project is properly set up for Google Sign-In
4. Gemini API key quota is sufficient for launch
5. Privacy policy content (docs/PRIVACY.md) is finalized and doesn't require changes

## Acceptance Criteria

### AC-1: Infinite Render Bug Fixed
- **Given**: App running in emulator or physical device
- **When**: User opens the app and navigates normally
- **Then**: No console errors about excessive re-renders; app remains responsive; React DevTools shows stable component tree
- **Verification**: programmatic (run linter, manual testing)
- **Notes**: Check App.tsx line 36 specifically

### AC-2: Privacy Policy Hosted & Accessible
- **Given**: A user or Google Play crawler
- **When**: Accessing the privacy policy URL (e.g., https://thoth.app/privacy)
- **Then**: Page loads with 200 OK; content matches PRIVACY.md document
- **Verification**: human-judgment (manual link check)
- **Notes**: Can be hosted on GitHub Pages, Vercel, or similar

### AC-3: Store Assets Complete
- **Given**: The Google Play Console listing
- **When**: Reviewing the store listing assets
- **Then**: 
  - At least 2 phone screenshots present
  - Feature graphic exists and meets dimensions 1024x500
  - App icon present and correctly sized (512x512, etc.)
  - All graphic assets follow Play Store branding guidelines
- **Verification**: human-judgment (visual inspection in Play Console)
- **Notes**: Screenshots should show key app flows: recording, history, global map

### AC-4: Permissions Justified & Declared
- **Given**: The Play Console permissions declaration form
- **When**: Submitting the app for review
- **Then**: 
  - RECORD_AUDIO: justified for voice recording of dreams
  - POST_NOTIFICATIONS: justified for memory collapse reminders
  - ACCESS_FINE_LOCATION: justified for optional location tagging on global map
  - All other permissions properly declared and justified
- **Verification**: programmatic (check AndroidManifest.xml) + human-judgment (check Play Console form)
- **Notes**: Ensure no unused permissions; remove what's not needed

### AC-5: Data Safety Form Completed
- **Given**: The Google Play Data Safety form
- **When**: Filling it out
- **Then**:
  - All data collection accurately declared
  - Encryption in transit confirmed (HTTPS)
  - Encryption at rest confirmed (Firebase)
  - User data deletion/export capabilities documented
- **Verification**: human-judgment (form completion check)
- **Notes**: Reference docs/GOOGLE_PLAY_STORE_LISTING.md for guidance

### AC-6: Release Build Successful
- **Given**: A clean codebase with all fixes applied
- **When**: Running `./gradlew bundleRelease` in android/ directory
- **Then**: Build completes successfully, signed AAB generated
- **Verification**: programmatic (run build command)
- **Notes**: Check that minifyEnabled true works, no ProGuard errors

### AC-7: App Launch & Basic Flow Works
- **Given**: Installed signed AAB on physical Android device
- **When**: User opens app, signs in with Google, records test dream
- **Then**: 
  - App launches without crashing
  - Google Sign-In works
  - Voice recording works
  - AI transcription/analysis completes
  - Dream saves to history
- **Verification**: human-judgment (manual testing)
- **Notes**: Test on different API levels if possible (min 24, target 36)

### AC-8: No Exposed Secrets
- **Given**: The codebase and built APK/AAB
- **When**: Scanning for API keys and secrets
- **Then**: No private keys or secrets found in client-side code or repo
- **Verification**: programmatic (grep for keys, check .gitignore)
- **Notes**: Firebase API keys are public by design; Gemini key should be server-side or properly secured

## Open Questions
- [ ] **Q1**: Where will we host the privacy policy? (Options: GitHub Pages, Vercel static site, existing web app)
- [ ] **Q2**: Have screenshots been captured for all key flows? Need at least 2.
- [ ] **Q3**: Is the keystore password still "Thoth@2026" or has it been changed?
- [ ] **Q4**: Do we need to implement full Alipay/WeChat Pay for v1.0 release, or can they come later?
- [ ] **Q5**: What's the target release date?
