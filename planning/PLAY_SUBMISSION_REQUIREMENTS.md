# Google Play Submission — Information Requirements

> Last updated: 2026-05-09
> Purpose: Checklist of everything needed from the user to submit Thoth to Google Play.

---

## 1. Firebase Configuration

### google-services.json

**Why it's needed:** Without it, Firebase Auth / Firestore / Storage **silently fail** in the release APK — users can't sign in, save dreams, or upload audio.

**How to get it:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Select your Thoth project (or create one if it doesn't exist yet)
3. Click **⚙️ Project Settings**
4. Scroll to **Your apps** → click the **Android** icon (or **Add app → Android**)
5. Enter:
   - **Android package name:** `com.thoth.dreamarchive`
   - **App nickname:** `Thoth`
   - **Debug signing certificate SHA-1:** *(optional for now)*
6. Click **Register app**
7. Download `google-services.json`
8. Place copies in:
   - `android/app/google-services.json`
   - `android/wear/google-services.json`

**⚠️ Important:** `google-services.json` must **never** be committed to Git. It is already in `.gitignore`. Keep a backup in a secure place.

---

## 2. Google Play Console Account

**Why it's needed:** Required to upload and publish the app.

**How to get it:**
1. Visit [play.google.com/console](https://play.google.com/console)
2. Sign in with your Google account
3. Click **Get started** → accept the Terms of Service
4. Pay the **$25 one-time** developer registration fee (credit/debit card)
5. Fill in:
   - Developer name (this is the "Seller" name shown on Play Store)
   - Phone number (verified by SMS)
   - Email address
   - Physical address (required by Google)
6. Wait for **1–3 days** for Google to approve your developer account

---

## 3. Privacy Policy

**Why it's needed:** Google Play **mandates** a publicly accessible Privacy Policy URL for every app. It must be live before you can publish.

**How to deploy it (pick one):**

| Option | Steps | Notes |
|--------|-------|-------|
| **A. Deploy to your domain** | 1. Confirm your domain is hosted (Vercel/Firebase Hosting)<br>2. I will generate the final Privacy Policy page<br>3. You add a `/privacy` route or static page | Recommended — keeps everything under one roof |
| **B. Firebase Hosting** | `firebase init hosting` → deploy `public/privacy.html` | Free, fast, integrates with your Firebase project |
| **C. GitHub Pages** | Create a `thoth-privacy` repo → push HTML → enable Pages | Good if you don't have a domain yet |

> **Minimum content requirement:** The policy must disclose: what data is collected, how it's stored, whether it's shared with third parties (yes: Google Firebase, Google Gemini AI), and how users can delete their data.

---

## 4. App Store Listing Assets

All assets below are required by Play Console before you can publish.

| Asset | Spec | How to get it |
|-------|------|---------------|
| **App Icon** | 512 × 512 px PNG (no transparency) | Use existing `android/app/src/main/res/mipmap-xxx/ic_launcher.png` → export at 512×512 |
| **Feature Graphic** | 1024 × 500 px PNG or JPEG | Design one (dark theme, shows app name + dream imagery) |
| **Phone Screenshots** | 2–8 images, min 320 dp wide | Take screenshots in Android emulator (Pixel 6 or similar) |
| **Tablet Screenshots** | 0 or 2–8 images | Optional but recommended |
| **Short Description** | ≤ 80 characters | I can draft this |
| **Full Description** | ≤ 4000 characters | I can draft this |
| **App Category** | Lifestyle / Health & Fitness | Your choice |
| **Content Rating** | Filled out in Play Console | I can provide the answers |

---

## 5. App Content Rating (Content Rating Questionnaire)

Google requires you to complete a questionnaire. Based on Thoth's nature, here are the expected answers (confirm with your own judgment):

| Question | Answer |
|----------|--------|
| Does your app contain ads? | No |
| Does your app allow user-generated content? | No |
| Does your app share user data with third parties? | Yes — Google Firebase (auth/storage), Google Gemini AI (transcription) |
| Does your app collect any of the following: location, financial info, health info, identity, photos/videos, audio, browsing history? | Yes — **audio** (voice recordings of dreams), **identity** (Google sign-in email/name) |
| Is your app content targeted at children under 13? | No |
| Are users able to make purchases? | No |

> After submission, Google typically completes the rating review within **1–2 hours** for new accounts.

---

## 6. Data Safety Form

Filled out in Play Console. Pre-filled answers below:

| Data type | Collected? | Purpose | Shared with 3rd parties? | Required for app functionality? |
|-----------|-----------|---------|-------------------------|-------------------------------|
| **Email address / Google Account info** | ✅ Yes | Authentication | ❌ No (Firebase only) | ✅ Yes |
| **Audio recordings** (voice/dreams) | ✅ Yes | Core feature: store dream recordings | ❌ No (uploaded to your own Firebase Storage) | ✅ Yes |
| **Text** (dream transcripts) | ✅ Yes | Core feature: AI analysis + storage | ❌ No (processed by Google Gemini, stored in Firestore) | ✅ Yes |
| **Location** | ❌ No | — | — | — |
| **Browsing / browsing history** | ❌ No | — | — | — |
| **Financial info** | ❌ No | — | — | — |
| **Health / fitness** | ❌ No | — | — | — |
| **Photos / videos** | ❌ No | — | — | — |
| **Personal info** | ❌ No | — | — | — |
| **App activity** | ❌ No | — | — | — |
| **Device or other IDs** | ❌ No | — | — | — |

---

## 7. Signing & Build

| Item | Status | Notes |
|------|--------|-------|
| Debug keystore | ✅ Ready | `~/.android/debug.keystore` (default) |
| Release keystore | ✅ Ready | Configured via `android/keystore.properties` |
| `google-services.json` in `android/app/` | ❌ Missing | **Must add before release build** |
| Release AAB | ❌ Not built yet | `./gradlew bundleRelease` — run after step 1 |
| WearOS AAB | ❌ Not built yet | Phase W1–W4 not complete yet |

---

## 8. Optional: WearOS Separate Listing

If you want a **standalone WearOS app** on the Play Store (separate from the phone app):

- Package name for WearOS: `com.thoth.dreamarchive.wear`
- Requires its own `google-services.json` (can be from the same Firebase project, just different app entry)
- Requires a separate Play Console listing (or as a "Companion app" in the same listing)
- WearOS app must complete Phases W1–W4 before submission

---

## Summary: What's Needed from You

| # | Item | Priority | Owner |
|---|------|---------|-------|
| 1 | Download & place `google-services.json` in `android/app/` | 🔴 P0 | You |
| 2 | Register Google Play Console ($25) | 🔴 P0 | You |
| 3 | Deploy Privacy Policy to a public URL | 🟡 P1 | Us (I draft, you deploy) |
| 4 | Take / source screenshots for Store Listing | 🟡 P1 | You |
| 5 | App Icon at 512×512 px | 🟡 P1 | You |
| 6 | Feature Graphic (1024×500) | 🟡 P1 | You (or ask me to design) |
| 7 | Run `./gradlew bundleRelease` after step 1 | 🟡 P1 | Me (when ready) |
| 8 | Fill in Play Console forms (I provide the answers) | 🟡 P1 | You (with my help) |
| 9 | WearOS: complete Phases W1–W4 + separate `google-services.json` | 🔵 Future | TBD |

> **The single most blocking item right now is `google-services.json`.** Everything else can be prepared in parallel, but the release AAB cannot be built without it.
