# Thoth — Google Play Release Verification Checklist

## Critical Bugs Fixed
- [ ] **Checkpoint 1**: Infinite render bug in App.tsx fixed (useState → useEffect)
- [ ] **Checkpoint 2**: No console errors or warnings on app launch
- [ ] **Checkpoint 3**: App remains responsive during normal use
- [ ] **Checkpoint 4**: No memory leaks or excessive re-renders visible in React DevTools

## Privacy & Compliance
- [ ] **Checkpoint 5**: Privacy policy URL publicly accessible (200 OK)
- [ ] **Checkpoint 6**: Privacy policy content matches docs/PRIVACY.md
- [ ] **Checkpoint 7**: Data Safety form completed with accurate declarations
- [ ] **Checkpoint 8**: All Android permissions documented and justified
- [ ] **Checkpoint 9**: No unused permissions in AndroidManifest.xml

## Store Listing Assets
- [ ] **Checkpoint 10**: At least 2 phone screenshots captured and resized correctly
- [ ] **Checkpoint 11**: Feature graphic exists and meets 1024x500 dimensions
- [ ] **Checkpoint 12**: App icon present in all required sizes
- [ ] **Checkpoint 13**: Screenshots show key app flows (record, history, map)

## Build & Signing
- [ ] **Checkpoint 14**: `npm run build` completes without errors
- [ ] **Checkpoint 15**: `npx cap sync android` works without issues
- [ ] **Checkpoint 16**: `./gradlew bundleRelease` generates signed AAB successfully
- [ ] **Checkpoint 17**: AAB size <150MB (or uses Play Asset Delivery properly)
- [ ] **Checkpoint 18**: ProGuard/R8 minify works with no class/method not found errors
- [ ] **Checkpoint 19**: keystore.properties correctly configured
- [ ] **Checkpoint 20**: Version code incremented from previous build

## App Functionality Testing
- [ ] **Checkpoint 21**: App launches without crashing on Android device
- [ ] **Checkpoint 22**: Google Sign-In works correctly
- [ ] **Checkpoint 23**: Voice recording permission request appears and works
- [ ] **Checkpoint 24**: Audio recording functionality operational
- [ ] **Checkpoint 25**: AI transcription/analysis completes successfully
- [ ] **Checkpoint 26**: Dream saves to Firestore/history correctly
- [ ] **Checkpoint 27**: Global map displays correctly
- [ ] **Checkpoint 28**: Settings screen accessible and functional

## Security
- [ ] **Checkpoint 29**: No private keys/secrets exposed in codebase
- [ ] **Checkpoint 30**: .gitignore correctly ignores sensitive files
- [ ] **Checkpoint 31**: Firebase API keys (public by design) are present but no private keys exposed
- [ ] **Checkpoint 32**: HTTPS used for all external API calls
- [ ] **Checkpoint 33**: Firebase Firestore/Storage rules are enforced

## Play Console Preparation
- [ ] **Checkpoint 34**: App created in Google Play Console
- [ ] **Checkpoint 35**: All store listing content entered (name, desc, etc.)
- [ ] **Checkpoint 36**: Screenshots and feature graphic uploaded
- [ ] **Checkpoint 37**: Content rating questionnaire completed
- [ ] **Checkpoint 38**: Pricing & distribution set (free app)
- [ ] **Checkpoint 39**: SHA-256 fingerprint uploaded to Play Console & Firebase
- [ ] **Checkpoint 40**: App signed with release keystore (not debug)
