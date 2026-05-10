# Thoth — Google Play Store Listing

> **App Name**: Thoth
> **Generated**: 2026-05-09
> **Status**: Ready for Play Console

---

## 📱 Store Listing Content

### App Name
```
Thoth - AI Dream Journal
```

### Short Description (80 characters max)
```
AI-powered dream journal with voice recording, analysis, and global dream map.
```
*Character count: 79/80*

### Full Description (4000 characters max)

```
🌙 Discover the hidden meanings in your dreams with Thoth.

Thoth is an AI-powered dream journal that helps you capture, understand, and explore your dreams like never before. Using advanced AI technology, Thoth transforms your nighttime visions into meaningful insights.

✨ KEY FEATURES

🎙️ Voice Recording
Wake up and immediately capture your dreams by voice. Thoth's intuitive interface lets you record dream memories before they fade.

🤖 AI-Powered Analysis
Powered by Google Gemini AI, Thoth automatically transcribes your recordings and extracts meaningful tags, symbols, and insights from your dreams.

📖 Personal Dream Archive
Build your personal dream database. Search, filter, and revisit your dreams anytime. Your dream history is always at your fingertips.

🗺️ Global Dream Map
Explore a real-time world map showing collective dream patterns. Discover what the world is dreaming about, filtered by tags and regions.

⏳ Memory Collapse Countdown
Dreams fade fast — Thoth gives you a 180-second window to capture your dream before it dissolves into the depths of memory.

🔒 Private & Secure
Your dreams are personal. Thoth uses Google OAuth for secure authentication, and all data is encrypted in transit and at rest.

🌐 Cross-Platform
Available on Android and Web. Your dreams sync seamlessly across all your devices.

---

🚀 HOW IT WORKS

1. Sign in with Google
2. Record your dream voice memo immediately upon waking
3. Let AI transcribe and analyze your dream
4. Review tags, insights, and the oracle's wisdom
5. Explore the global dream community map

---

💎 WHY THOTH?

Dreams are windows into our subconscious. Thoth helps you:
• Never forget a dream again
• Identify recurring symbols and themes
• Gain AI-powered insights into your dream patterns
• Connect with collective human dream experiences worldwide

---

🔔 OPTIONAL: Memory Collapse Reminders
Enable notifications to get gentle reminders to capture your dreams after waking.

---

📧 Support: zhaoceaser@gmail.com
🌐 Web: https://thoth.app
🔒 Privacy: https://thoth.app/privacy

---

Start your dream journey today. Download Thoth now.
```

*Character count: ~2,100/4000*

---

## 📊 App Category & Details

| Field | Value |
|-------|-------|
| **Application Type** | Application |
| **Category** | Health & Fitness (or Lifestyle) |
| **Tags/Keywords** | dream journal, AI, sleep, dreams, Gemini, voice recording, self-reflection, mental health |
| **Content Rating** | Everyone (or Teen if dream content) |
| **Website** | https://thoth.app |
| **Email** | zhaoceaser@gmail.com |
| **Phone** | (optional) |
| **Privacy Policy URL** | https://thoth.app/privacy |

---

## 🖼️ Graphic Assets Checklist

| Asset | Specification | Status |
|-------|---------------|--------|
| **App Icon** | 512×512 px, 32-bit PNG | ✅ Exists (ic_launcher.png) |
| **Feature Graphic** | 1024×500 px, JPG/PNG | ❌ Need to create |
| **Screenshots (Phone)** | Min 2, Max 8, 16:9 or 9:16 | ❌ Need to capture |
| **Screenshots (Tablet)** | Optional | ❌ Optional |
| **Promo Video** | YouTube URL (optional) | ❌ Optional |

### Screenshot Recommendations
Suggested capture scenes:
1. **Home screen** - Dream list view
2. **Voice recording** - Recording in progress
3. **AI Analysis** - Dream transcript with tags
4. **Global Map** - Dream map visualization
5. **Dream Detail** - Single dream view with insights

---

## 🔒 Data Safety Section (Play Console)

### Data Collection

| Data Type | Collected? | Purpose | Shared? | Can Delete? |
|-----------|-----------|---------|---------|-------------|
| **Name** | ✅ Yes | Account auth | No | ✅ Yes |
| **Email** | ✅ Yes | Account auth | No | ✅ Yes |
| **Audio Files** | ✅ Yes | Dream recording | No* | ✅ Yes |
| **Text (dream content)** | ✅ Yes | Dream journal | No* | ✅ Yes |
| **App Activity** | ⚠️ Anonymous | Analytics | No | N/A |

*Audio and text are sent to Google Gemini for processing only, not shared with third parties.

### Security Practices
- [x] Data encrypted in transit (HTTPS/TLS)
- [x] Data encrypted at rest (Firebase AES-256)
- [x] Users can request data deletion
- [x] Users can export their data
- [ ] Third-party data sharing (checked if applicable)

---

## 📋 Permissions Declaration (Play Console)

| Permission | Required? | Purpose | Foreground? |
|-----------|-----------|---------|-------------|
| `RECORD_AUDIO` | ✅ Yes | Record dream voice memos | Yes (with notification) |
| `INTERNET` | ✅ Yes | Sync with Firebase, AI processing | N/A |
| `ACCESS_FINE_LOCATION` | ⚠️ Optional | Tag dream location (user choice) | No |
| `POST_NOTIFICATIONS` | ⚠️ Optional | Memory Collapse reminders | N/A |
| `FOREGROUND_SERVICE` | ✅ Yes | Recording notification | Yes |
| `FOREGROUND_SERVICE_MICROPHONE` | ✅ Yes | Recording notification | Yes |

### Permission Explanation Text (for Play Console)

**RECORD_AUDIO**
```
Used to record voice memos of your dreams immediately after waking. Audio is processed locally and via Google Gemini AI for transcription. You can delete recordings anytime.
```

**ACCESS_FINE_LOCATION**
```
Optional permission to tag your dreams with location context. This helps categorize dreams by geographic region on the global dream map. You can skip this permission.
```

**POST_NOTIFICATIONS**
```
Optional permission to send Memory Collapse reminders — gentle notifications to capture your dreams after waking.
```

---

## 🚀 Release Notes (What's New)

### Version 1.0 (Initial Release)

```
🎉 Welcome to Thoth — Your AI Dream Journal

✨ Initial release features:
• Voice recording for capturing dreams
• AI-powered transcription and analysis (Gemini)
• Personal dream archive with search
• Global dream map visualization
• Memory Collapse countdown timer
• Google OAuth secure sign-in
• Cross-platform sync (Android + Web)

Start capturing your dreams today!
```

---

## ✅ Pre-Launch Checklist

### Technical
- [x] `google-services.json` in `android/app/`
- [x] Firebase SDK dependencies added
- [x] Release signing configured (`keystore.properties`)
- [x] `targetSdkVersion` = 36 (Play requirement)
- [ ] ProGuard rules for Firebase added
- [ ] AAB build tested (`Build > Generate Signed Bundle`)
- [ ] App bundle under 150MB (or use Play Asset Delivery)

### Store Listing
- [x] App name: Thoth
- [x] Short description
- [x] Full description
- [ ] Screenshots uploaded (min 2)
- [ ] Feature graphic uploaded
- [ ] Privacy policy URL live

### Compliance
- [x] Privacy policy written (`docs/PRIVACY.md`)
- [ ] Privacy policy hosted and URL accessible
- [ ] Data safety section completed
- [ ] Permissions justified
- [ ] Content rating questionnaire completed

---

## 📎 Next Steps

1. **Host Privacy Policy**
   - Option A: Deploy to Vercel `/privacy` route
   - Option B: Use GitHub Pages
   - Option C: Use existing `docs/PRIVACY.md` converted to HTML

2. **Capture Screenshots**
   - Use Android Emulator or physical device
   - Capture 5-8 key screens
   - Resize to 9:16 (1080×1920) or 16:9 (1920×1080)

3. **Create Feature Graphic**
   - Size: 1024×500 px
   - Include: App icon + "Thoth" text + dream-themed visual

4. **Build Signed AAB**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

5. **Upload to Play Console**
   - Create app in Play Console
   - Fill store listing
   - Upload AAB
   - Submit for review

---

*Document generated by Dev Agent — 2026-05-09*
