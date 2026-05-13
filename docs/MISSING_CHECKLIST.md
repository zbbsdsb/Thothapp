---
title: "Missing Items Checklist"
description: "Checklist of items required before production release"
category: "specs"
---
# Thoth — Missing Items Checklist

> Items required before a production build or release can run end-to-end.
> Organized by urgency: **Blocker** → **High** → **Medium** → **Nice-to-Have**.
>
> **Current Setup**: Web frontend deployed on **Vercel** (Firebase already connected ✅). GitHub Actions only builds Android/iOS APKs/IPAs.

---

## Blocker — App Build Will Fail Without These

### 1. Firebase Configuration

| Item | Status | Where |
|------|--------|-------|
| Firebase project | ✅ Configured (Vercel) | [console.firebase.google.com](https://console.firebase.google.com) |
| `firebase-applet-config.json` | ⚠️ Placeholder | Replace with real project config |
| Firestore database | ✅ Created | Firebase Console |
| Google Auth | ✅ Enabled | Firebase Console → Authentication |
| Anonymous Auth | ✅ Enabled | Firebase Console → Authentication |

> **Note**: Web/Vercel already works. Android/iOS builds need `google-services.json` / `GoogleService-Info.plist` locally.

### 2. Firebase Android — `google-services.json` ⚠️ **NEEDED**

| Item | File | Where |
|------|------|-------|
| `google-services.json` | `android/app/google-services.json` | Firebase Console → Project Settings → Android App → Download |

> Without this file, Android APK will crash on startup (Firebase cannot initialize).

### 3. Firebase iOS — `GoogleService-Info.plist` ⚠️ **NEEDED (when Mac available)**

| Item | File | Where |
|------|------|-------|
| `GoogleService-Info.plist` | `ios/App/App/GoogleService-Info.plist` | Firebase Console → Project Settings → iOS App → Download |

### 4. Gemini API Key

| Item | Status | Where |
|------|--------|-------|
| Gemini API Key | ✅ Set in Vercel | [ai.google.dev](https://ai.google.dev) |

> Already configured in Vercel Dashboard. For local dev, add to `.env`: `VITE_GEMINI_API_KEY=...`

---

## High — Core Features Will Fail Without These

### 5. R2 Storage (Audio Upload)

> **Web**: Handled by Vercel (dev server + R2 presign). 
> **Android/iOS**: Use Firebase Storage fallback (already implemented in `src/lib/storage.ts`).

| Item | Env Var | Where to Get |
|------|---------|-------------|
| R2 Account ID | `R2_ACCOUNT_ID` | Cloudflare Dashboard → R2 |
| R2 Access Key ID | `R2_ACCESS_KEY_ID` | R2 → Manage API Tokens |
| R2 Secret Access Key | `R2_SECRET_ACCESS_KEY` | Same step |
| R2 Bucket Name | `R2_BUCKET_NAME` | Cloudflare Dashboard → R2 |
| R2 Public URL | `R2_PUBLIC_URL` + `VITE_R2_PUBLIC_URL` | R2 bucket → Settings |

### 6. WeChat Pay — App Payment (Merchant Mode)

#### Backend (for payment server)

| Item | Env Var | Where to Get |
|------|---------|-------------|
| Merchant ID | `WX_MCHID` | [pay.weixin.qq.com](https://pay.weixin.qq.com) |
| APIv3 Serial Number | `WX_SERIAL_NO` | WeChat Pay → APIv3 Certificates |
| APIv3 Private Key | `WX_PRIVATE_KEY_PATH` | Download from WeChat Pay |
| APIv3 AES Key | `WX_APIV3_KEY` | WeChat Pay Merchant Platform |
| WeChat App ID | `WX_APP_ID` | [open.weixin.qq.com](https://open.weixin.qq.com) |

#### Frontend (already coded in `src/lib/payment.ts`)

| Item | Env Var | Where |
|------|---------|-------|
| WeChat App ID | `VITE_WX_APP_ID` | Same as `WX_APP_ID` |
| Payment Server URL | `VITE_PAYMENT_SERVER_URL` | Your backend domain |

#### WeChat Open Platform

| Item | Requirement |
|------|------------|
| Open Platform account | [open.weixin.qq.com](https://open.weixin.qq.com) |
| Register mobile app | Applications → Mobile App → Fill info |
| App ID (wx...) | From registered app (enterprise account required) |

> ⚠️ App Payment requires **verified enterprise account**. Individual accounts cannot use it.

---

## Medium — CI/CD (GitHub Actions)

### 7. GitHub Actions Secrets

> **Current Setup**: Web deployed on **Vercel** (already configured ✅). 
> GitHub Actions only builds **Android APK / iOS IPA**.
> 
> `release.yml` runs `npm run build` to bundle frontend into Android/iOS, which needs `VITE_*` env vars embedded at build time.

| Secret | Required For |
|--------|--------------|
| `VITE_FIREBASE_API_KEY` | Frontend build (embedded in APK) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend build |
| `VITE_FIREBASE_PROJECT_ID` | Frontend build |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend build |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend build |
| `VITE_FIREBASE_APP_ID` | Frontend build |
| `VITE_GEMINI_API_KEY` | Frontend build |
| `VITE_R2_PUBLIC_URL` | Frontend build |
| `VITE_WX_APP_ID` | Frontend build |
| `VITE_PAYMENT_SERVER_URL` | Frontend build |
| `R2_ENDPOINT` | Backend (for R2 presign in APK) |
| `R2_ACCESS_KEY_ID` | Backend |
| `R2_SECRET_ACCESS_KEY` | Backend |
| `R2_BUCKET_NAME` | Backend |
| `WX_MCHID` | Backend (WeChat Pay) |
| `WX_SERIAL_NO` | Backend |
| `WX_PRIVATE_KEY_PATH` | Backend |
| `WX_APIV3_KEY` | Backend |
| `WX_APP_ID` | Backend |
| `PAYMENT_SERVER_BASE_URL` | Backend |

### 8. Android Release Signing

| Item | Env Var | Status |
|------|---------|--------|
| Keystore | `ANDROID_KEYSTORE_BASE64` | ✅ `thoth-upload-key.jks exists |
| Store password | `ANDROID_STORE_PASSWORD` | ⚠️ Current: `Thoth@2026` (temp, change before release!) |
| Key alias | `ANDROID_KEY_ALIAS` | `thoth-upload` |
| Key password | `ANDROID_KEY_PASSWORD` | Same as store password |

> Until configured, `release.yml` builds **debug APK only**.

### 9. iOS Code Signing (Mac required)

| Item | Secret | How to Get |
|------|--------|-----------|
| .p12 Certificate | `IOS_P12_CERTIFICATE_BASE64` | Mac Keychain → Export .p12 |
| .p12 Password | `IOS_P12_PASSWORD` | Set when exporting |
| .mobileprovision | `IOS_PROVISIONING_PROFILE` | Apple Developer Portal |
| Code Sign Identity | `IOS_CODE_SIGN_IDENTITY` | e.g. `Apple Distribution: Name (TEAM_ID)` |
| Team ID | `IOS_TEAM_ID` | Apple Developer Portal → Membership |

> For local dev: open `ios/App/App.xcworkspace` in Xcode (needs Mac).

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
