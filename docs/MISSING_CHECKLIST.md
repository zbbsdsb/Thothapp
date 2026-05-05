# Thoth — Missing Items Checklist

> Items required before a production build or release can run end-to-end.
> Organized by urgency: **Blocker** → **High** → **Medium** → **Nice-to-Have**.

---

## Blocker — App Will Not Build / Run Without These

### 1. Firebase Configuration

| Item | File | Status | Action |
|------|------|--------|--------|
| Dedicated Firebase project | — | ❌ Missing | Create at [console.firebase.google.com](https://console.firebase.google.com) |
| `firebase-applet-config.json` | `firebase-applet-config.json` | ⚠️ Placeholder | Replace with real project config (projectId, appId, apiKey, authDomain, storageBucket, messagingSenderId) |
| Firestore database | — | ⚠️ Using shared demo DB | Create a dedicated Firestore database in your Firebase project |
| Firestore security rules | `firestore.rules` | ⚠️ Deployed | Deploy: `firebase deploy --only firestore:rules` |
| Storage security rules | `storage.rules` | ⚠️ Deployed | Deploy: `firebase deploy --only storage:rules` |
| Google Auth provider | Firebase Console | ❌ Not enabled | Enable **Google** in Firebase Console → Authentication → Sign-in method |
| Apple Sign-In (iOS) | Firebase Console | ❌ Not enabled | Enable **Apple** if targeting iOS |
| Anonymous Auth | Firebase Console | ❌ Not enabled | Enable **Anonymous** (used for WearOS fallback) |

### 2. Firebase Android — `google-services.json`

| Item | File | Where |
|------|------|-------|
| `google-services.json` | `android/app/google-services.json` | Firebase Console → Project Settings → Your apps → Android → Download `google-services.json` |

> Without this file, the Android APK will crash on startup (Firebase cannot initialize).

### 3. Firebase iOS — `GoogleService-Info.plist`

| Item | File | Where |
|------|------|-------|
| `GoogleService-Info.plist` | `ios/App/App/GoogleService-Info.plist` | Firebase Console → Project Settings → Your apps → iOS → Download |

> Without this file, iOS build will fail to link Firebase.

### 4. Gemini API Key

| Item | Env Var | Where to Get |
|------|---------|-------------|
| Gemini API Key | `VITE_GEMINI_API_KEY` | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) |

> Used client-side. Currently prompted from user input. In production, move to server-side proxy.

---

## High — Build Will Succeed But Core Features Will Fail

### 5. R2 Storage (Audio Upload)

| Item | Env Var | Where to Get |
|------|---------|-------------|
| R2 Account ID | `R2_ACCOUNT_ID` (backend) | Cloudflare Dashboard → R2 Overview |
| R2 Access Key ID | `R2_ACCESS_KEY_ID` (backend) | R2 → Manage R2 API Tokens → Create Token |
| R2 Secret Access Key | `R2_SECRET_ACCESS_KEY` (backend) | Same token creation step |
| R2 Bucket Name | `R2_BUCKET_NAME` (backend) | Cloudflare Dashboard → R2 → Create bucket |
| R2 Public URL | `R2_PUBLIC_URL` (backend) + `VITE_R2_PUBLIC_URL` (frontend) | R2 bucket → Settings → Public access |
| R2 Custom Domain (optional) | — | Cloudflare → R2 → Custom Domains |

> **Fallback**: If R2 fails, `uploadAudio()` in `src/lib/storage.ts` falls back to Firebase Storage automatically.

### 6. WeChat Pay — App Payment

#### Backend (server environment variables)

| Item | Env Var | Where to Get |
|------|---------|-------------|
| Merchant ID | `WX_MCHID` | WeChat Pay Merchant Platform |
| APIv3 Serial Number | `WX_SERIAL_NO` | WeChat Pay → APIv3 Key & Certificates |
| APIv3 Private Key File | `WX_PRIVATE_KEY_PATH` | Download from WeChat Pay, store securely |
| APIv3 AES Key (32 chars) | `WX_APIV3_KEY` | WeChat Pay Merchant Platform |
| WeChat App ID | `WX_APP_ID` | WeChat Open Platform → Mobile App |
| Payment Server Base URL | `PAYMENT_SERVER_BASE_URL` | Your deployed backend domain |
| Payment Server URL (frontend) | `VITE_PAYMENT_SERVER_URL` | Same as above, for frontend |

#### Frontend

| Item | Env Var | Where |
|------|---------|-------|
| WeChat App ID (frontend) | `VITE_WX_APP_ID` | Same as `WX_APP_ID` |

#### Android — WXEntryActivity

| Item | File | Status |
|------|------|--------|
| `WXEntryActivity.java` | `android/app/src/.../wxapi/WXEntryActivity.java` | ✅ Created |
| `AndroidManifest.xml` (WXEntryActivity) | `android/app/src/main/AndroidManifest.xml` | ✅ Registered |
| `thoth://` URL scheme | `capacitor.config.ts` | ✅ Configured |

#### WeChat Open Platform Registration

| Item | Requirement |
|------|------------|
| WeChat Open Platform account | [open.weixin.qq.com](https://open.weixin.qq.com) |
| Register mobile app | Applications → Mobile App → Fill in bundle ID + app name |
| App ID (wx...) | From the registered app |
| App Secret | From the registered app (keep secret) |

> ⚠️ App payment requires **enterprise/weChat verified** account. Individual accounts cannot use App Payment.

---

## Medium — CI/CD and Build Artifacts

### 7. GitHub Actions Secrets

> Configure in: GitHub Repo → Settings → Secrets and variables → Actions

| Secret | Used By | Required For |
|--------|---------|------------|
| `VITE_FIREBASE_API_KEY` | `release.yml` | Vite build |
| `VITE_FIREBASE_AUTH_DOMAIN` | `release.yml` | Vite build |
| `VITE_FIREBASE_PROJECT_ID` | `release.yml` | Vite build |
| `VITE_FIREBASE_STORAGE_BUCKET` | `release.yml` | Vite build |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `release.yml` | Vite build |
| `VITE_FIREBASE_APP_ID` | `release.yml` | Vite build |
| `VITE_GEMINI_API_KEY` | `release.yml` | Vite build |
| `VITE_R2_PUBLIC_URL` | `release.yml` | Vite build |
| `VITE_WX_APP_ID` | `release.yml` | Vite build |
| `VITE_PAYMENT_SERVER_URL` | `release.yml` | Vite build |
| `R2_ENDPOINT` | `release.yml` | Backend build |
| `R2_ACCESS_KEY_ID` | `release.yml` | Backend build |
| `R2_SECRET_ACCESS_KEY` | `release.yml` | Backend build |
| `R2_BUCKET_NAME` | `release.yml` | Backend build |
| `WX_MCHID` | `release.yml` | Backend build |
| `WX_SERIAL_NO` | `release.yml` | Backend build |
| `WX_PRIVATE_KEY_PATH` | `release.yml` | Backend build |
| `WX_APIV3_KEY` | `release.yml` | Backend build |
| `WX_APP_ID` | `release.yml` | Backend build |
| `PAYMENT_SERVER_BASE_URL` | `release.yml` | Backend build |

### 8. Android Release Signing

| Item | Env Var | Where to Get |
|------|---------|-------------|
| Keystore file (JKS/PKCS12) | `ANDROID_KEYSTORE_BASE64` | Generate with `keytool`, keep backup |
| Store password | `ANDROID_STORE_PASSWORD` | You set this |
| Key alias | `ANDROID_KEY_ALIAS` | You set this |
| Key password | `ANDROID_KEY_PASSWORD` | You set this |

> Until these are configured, `release.yml` builds **debug APK only**. Signed release AAB is commented out.

Generate a new keystore:
```bash
keytool -genkey -v -keystore thoth-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias thoth-release -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD -dname "CN=Thoth"
```

### 9. iOS Code Signing

> Requires a Mac to set up. Needed only for real device testing and App Store.

| Item | Secret | How to Get |
|------|--------|-----------|
| .p12 Certificate | `IOS_P12_CERTIFICATE_BASE64` | macOS Keychain → Export Apple Distribution as .p12 → base64 encode |
| .p12 Password | `IOS_P12_PASSWORD` | Set when exporting |
| .mobileprovision | `IOS_PROVISIONING_PROFILE` | Apple Developer Portal → Certificates → Profiles |
| Code Sign Identity | `IOS_CODE_SIGN_IDENTITY` | e.g. `Apple Distribution: Your Name (TEAM_ID)` |
| Profile Name | `IOS_PROVISIONING_PROFILE_NAME` | From the .mobileprovision file |
| Team ID | `IOS_TEAM_ID` | Apple Developer Portal → Account → Membership |

> For local development: open `ios/App/App.xcworkspace` in Xcode and configure signing manually.

---

## Nice-to-Have — Polish and Production Hardening

### 10. Firestore Rules Improvements

Current rules are solid but these enhancements are recommended:

```rules
// Add to users/{userId} update rule:
// Prevent external_apis from being written by the client
// (currently: allow any map, should restrict to known keys)

function isSafeApiKey(key) {
  return key in ['gemini', 'openai', 'deepseek', 'minimax'];
}

function isValidExternalApis(data) {
  return data.keys().hasOnly(isSafeApiKey)
         && data[request.auth.uid] is string;
}
```

### 11. WeChat Pay — Security Hardening

| Item | Status | Description |
|------|--------|-------------|
| Callback signature verification | ⚠️ TODO in server.ts line 180 | Implement HMAC-SHA256 verification of `Wechatpay-Signature` header |
| Database persistence | ⚠️ Map in memory | Replace `orderStore` with SQLite/PostgreSQL before production |
| Idempotency | ⚠️ Not implemented | Add `Wechatpay-Nonce` + timestamp deduplication |
| Certificate auto-refresh | ❌ Not implemented | Auto-renew WX serial cert before expiry |

### 12. Payment Server Deployment

The backend (`server.ts`) needs a production host:

| Item | Options |
|------|---------|
| VPS / Cloud Server | AWS EC2, DigitalOcean, Railway, Render |
| Domain + SSL | Required for WeChat Pay callback (HTTPS mandatory) |
| Payment callback URL | Must be publicly accessible, e.g. `https://api.thothapp.com/api/payment/callback` |
| WeChat Pay callback IP whitelist | Add server IP to WeChat Pay merchant platform |

### 13. WeChat Official Account (Optional — for JSAPI fallback)

If offering WeChat login or JSAPI payment for WeChat browser users:

| Item | Requirement |
|------|------------|
| Service Account / Subscription | WeChat Public Platform registration |
| App ID + App Secret | From WeChat Public Platform |
| JSAPI Authorization Directory | Configure in WeChat Public Platform → JS API |

### 14. Firebase Realtime Database (Optional)

Currently not used. Consider if:
- Real-time cross-device sync is needed (e.g. watch records → phone updates instantly)
- Presence detection ("user is recording")

### 15. Apple Developer Program

Required for iOS App Store release:

| Item | Cost | URL |
|------|------|-----|
| Apple Developer Program | $99/year | [developer.apple.com/programs](https://developer.apple.com/programs) |

---

## Quick Start — Get a Basic Build Running Today

```bash
# 1. Create Firebase project → download config → replace firebase-applet-config.json
# 2. Firebase Console → Authentication → enable Google + Anonymous
# 3. Firebase Console → Firestore → create database → deploy rules
# 4. Firebase Console → Project Settings → Android → download google-services.json
# 5. Get Gemini API key → set VITE_GEMINI_API_KEY in .env
# 6. Get Cloudflare R2 credentials → set R2_* + VITE_R2_PUBLIC_URL in .env
# 7. GitHub → Settings → Secrets → add VITE_* secrets
# 8. Git tag + push → GitHub Release auto-builds APK
```

---

## Document Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-04-24 | Initial checklist |

*Auto-generated based on codebase analysis. Update as new integrations are added.*
