# Next Steps — Post Device Migration

> **Purpose**: Follow this guide after setting up Thothapp on your new device.
> **Last Updated**: 2026-05-12
> **⚠️ Status Notice**: Core setup steps are still valid. SHA-256 fingerprints below were generated in May 2025 — re-verify against your current keystore before registering with Firebase Console. WearOS sections have been superseded by `docs/WEAROS_HANDOVER.md`.

---

## 🚀 Quick Start Checklist

### 1. Environment Setup (New Device)

```bash
# Clone the repo
git clone https://github.com/your-username/Thothapp.git
cd Thothapp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure `.env`

Edit `.env` and fill in these **required** values:

| Variable | Source | Required For |
|----------|--------|--------------|
| `VITE_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com/) | Web app, Auth, Firestore |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) | Voice transcription |
| `R2_*` | Cloudflare Dashboard | Web audio uploads |

⚠️ **Firebase Console**: Add both Debug and Release SHA-256 fingerprints:
- Debug: `6A:5D:05:F8:B5:D8:74:A4:42:AE:04:7B:4A:7F:3C:EA:CD:EC:9C:60:FB:DA:0B:6D:73:4F:9B:09:C8:09:F4:1F`
- Release: `F7:FD:2E:98:78:47:9E:83:41:26:D5:11:1A:2D:D8:F4:18:4A:18:D1:27:97:15:A0:AF:BD:32:1D:E3:E7:A8:86`

### 3. Verify Build

```bash
npm run build        # Should pass ✅
npm run dev          # Start dev server at localhost:5173
```

---

## 📱 Mobile Development Setup

### Android

```bash
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

**Required files** (not in repo, store securely):
- `android/app/google-services.json` — Download from Firebase Console → Project Settings → Android App
- `android/keystore.properties` — Create with:
  ```properties
  storeFile=thoth-upload-key.jks
  storePassword=YOUR_PASSWORD
  keyAlias=thoth-upload
  keyPassword=YOUR_PASSWORD
  ```
- `android/app/thoth-upload-key.jks` — Your upload keystore

### iOS (Mac only)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

**Required files**:
- `ios/App/App/GoogleService-Info.plist` — Download from Firebase Console

---

## 🔥 Firebase Deployment (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy Firestore rules + Hosting
firebase deploy
```

---

## 📋 Development Priorities

### Immediate (Next 1-2 weeks)
- [ ] Test Android build on physical device
- [ ] Verify R2 uploads work on web (dev server)
- [ ] Remove `allowMixedContent: true` after R2 migrates to HTTPS
- [ ] Update `thoth-upload-key.jks` password before Play Store release

### Short-term (Next month)
- [ ] Code splitting to reduce bundle size (~1.3MB → target <500KB)
- [ ] Add unit tests for critical hooks (`useRecording`, `useAuth`)
- [ ] Implement offline support (Service Worker caching)
- [ ] Add error boundaries and user-friendly error messages

### Medium-term (Next quarter)
- [ ] Replace Express dev server with Cloudflare Worker for R2 presign
- [ ] Add dream sharing / social features
- [ ] Implement dream visualization enhancements (3D globe?)
- [ ] Performance optimization (lazy loading, virtual scrolling for dream list)

---

## 🔗 Key Documents

| Document | Purpose |
|----------|---------|
| `HANDOFF.md` | **Start here** — Full project handoff guide |
| `STATUS.md` | Current feature status (what works ✅, what's planned 📋) |
| `README.md` | Public-facing project overview |
| `CHANGELOG.md` | Version history and recent fixes |
| `docs/` | Detailed technical docs (API, Architecture, Features) |

---

## ⚠️ Critical Reminders

1. **Never commit `.env`** — It's in `.gitignore`
2. **Change keystore password** — Current temp password `Thoth@2026` is in `HANDOFF.md`
3. **`google-services.json` not in repo** — Must be downloaded after Firebase setup
4. **`allowMixedContent: true`** — Remove this from `capacitor.config.ts` once R2 uses HTTPS
5. **Workspaces** — This is an npm workspaces project, NOT Nx

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|-----------|
| `npm run build` fails | Check Node version (>=18), delete `node_modules` and `package-lock.json`, reinstall |
| Android build fails | Open in Android Studio, sync Gradle, check `google-services.json` exists |
| R2 uploads fail | Ensure dev server is running (`npm run dev`), check `.env` R2 variables |
| Firebase Auth fails | Verify `VITE_FIREBASE_*` vars, check Auth enabled in Firebase Console |

---

**Last commit before device migration**: `d0684d3` (README.md update)
