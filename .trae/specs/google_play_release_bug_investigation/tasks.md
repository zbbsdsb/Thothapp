# Thoth — Google Play Release Bug Investigation & Preparation (Implementation Tasks)

## [pending] Task 1: Fix Infinite Render Bug in App.tsx
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - Fix the infinite render issue in `src/App.tsx` line 36
  - Replace useState() with useEffect() where appropriate
  - Add proper dependency array
  - Ensure user country fetch only runs once on mount
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic`: Run TypeScript type check and linter (`npm run type-check && npm run lint`)
  - `human-judgement`: Manually test app launch and verify no excessive re-renders, no console errors about max depth exceeded
- **Notes**: The bug is at line 36, current code uses useState() with a function that runs on every render. Should use useEffect() with an empty dependency array (or [user] as dependency).

## [pending] Task 2: Host Privacy Policy & Verify Accessibility
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - Convert `docs/PRIVACY.md` to HTML or host as markdown with GitHub Pages/Vercel
  - Verify URL returns 200 OK
  - Add URL to Google Play Console listing
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic`: Use curl or browser to verify URL responds with 200 OK and content exists
  - `human-judgement`: Verify content matches PRIVACY.md
- **Notes**: Options for hosting: (a) Add static HTML to public/ folder and deploy via Vercel/GitHub Pages, (b) Use existing markdown renderer, (c) Use a simple HTML page on GitHub Pages.

## [pending] Task 3: Prepare & Validate Store Listing Assets
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - Capture at least 2 high-quality screenshots of key app flows
  - Resize screenshots to 1080x1920 (or similar standard size)
  - Verify feature graphic meets specs (1024x500)
  - Check app icon sizes are correct
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: Check file dimensions with image info tool
  - `human-judgement`: Visually inspect assets in store-assets/ folder, verify they meet Play Store guidelines
- **Notes**: Screenshot scenes: (1) Home/recording screen, (2) AI analysis result, (3) Global map, (4) Dream history (optional but recommended). See docs/GOOGLE_PLAY_STORE_LISTING.md for guidance.

## [pending] Task 4: Review & Justify Android Permissions
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - Review `android/app/src/main/AndroidManifest.xml`
  - Remove any unused permissions
  - Document justification for each permission requested
  - Ensure permissions request flow is implemented (runtime permissions for RECORD_AUDIO, etc.)
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic`: Inspect AndroidManifest.xml for permissions
  - `human-judgement`: Verify permissions are justified in Play Console form (or draft document)
- **Notes**: Make sure ACCESS_FINE_LOCATION is optional and clearly explained.

## [pending] Task 5: Complete Data Safety Form Draft
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - Using docs/GOOGLE_PLAY_STORE_LISTING.md as guide, draft Data Safety form responses
  - Document data collection, sharing, encryption practices
  - Confirm user data deletion/export capabilities
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement`: Review draft against docs and Play Console requirements
- **Notes**: Can create a Markdown draft first in docs/ folder before entering into Play Console.

## [pending] Task 6: Test Release Build (AAB Generation)
- **Priority**: P0
- **Depends On**: Task 1 (bug fix)
- **Description**:
  - Clean previous builds
  - Run `npm run build` to build web bundle
  - Sync Capacitor: `npx cap sync android`
  - Run release build: `cd android && ./gradlew bundleRelease`
  - Verify signed AAB is generated in `android/app/build/outputs/bundle/release/`
  - Check AAB size (<150MB target)
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic`: Run build commands and verify exit code 0, check AAB exists
  - `human-judgement`: Inspect build logs for any warnings or errors
- **Notes**: If ProGuard/R8 issues, check proguard-rules.pro and add rules as needed.

## [pending] Task 7: Install & Test Signed AAB on Device
- **Priority**: P0
- **Depends On**: Task 6
- **Description**:
  - Install signed AAB on physical Android device (via adb, bundletool, or Play Internal Testing)
  - Test full user flow: launch, sign in, record, AI analysis, save, view history
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgement`: Manual testing on Android device, logcat for crashes/ANRs
- **Notes**: Test on minimum API 24 if possible, also target API 36.

## [pending] Task 8: Security Audit & Secret Check
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - Review codebase for exposed API keys/secrets
  - Verify .gitignore covers sensitive files
  - Ensure firebase-applet-config.json is properly handled (public keys ok)
  - Check no server-side keys are in client code
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic`: Grep repo for patterns like "private_key", "secret", check .gitignore
  - `human-judgement`: Manual review of key files for security issues
- **Notes**: Firebase API keys are intentionally public, that's normal. Alipay/WeChat private keys should NOT be committed.

## [pending] Task 9: Update Version Code & Name
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - Update android/app/build.gradle: versionCode from 1 to next integer
  - Update versionName from "1.0" to "1.0.0" or appropriate
  - Update footer in App.tsx if needed
- **Acceptance Criteria Addressed**: (Part of release prep)
- **Test Requirements**:
  - `programmatic`: Verify version in build.gradle matches expectations
- **Notes**: versionCode must increment for each Play Store submission.

## [pending] Task 10: Update Play Console Listing
- **Priority**: P1
- **Depends On**: Tasks 2, 3, 5
- **Description**:
  - Enter all listing content into Google Play Console
  - Upload screenshots and feature graphic
  - Set content rating (complete questionnaire)
  - Set pricing and distribution (free app)
- **Acceptance Criteria Addressed**: (Part of store listing completion)
- **Test Requirements**:
  - `human-judgement`: Review listing in Play Console Draft mode
- **Notes**: Reference docs/GOOGLE_PLAY_STORE_LISTING.md for content.

---
## Task Dependency Order
- All P0 tasks can be worked on in parallel except 6 & 7 which depend on 1
- P1 tasks should be done after P0s complete
