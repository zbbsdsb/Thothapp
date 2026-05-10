# Google Play Console Submission Guide

> **App Name**: Thoth - AI Dream Journal
> **Generated**: 2026-05-10
> **Status**: Ready for submission

---

## 📱 Store Listing

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
🔒 Privacy: https://zbbsdsb.github.io/Thothapp/privacy.html

---

Start your dream journey today. Download Thoth now.
```
*Character count: ~2,100/4000*

---

## 🖼️ Graphic Assets

| Asset | Location | Status |
|-------|----------|--------|
| **App Icon** | `android/app/src/main/res/mipmap-*/ic_launcher.png` | ✅ Auto-extracted from AAB |
| **Feature Graphic** | `store-assets/feature-graphic.png` | ✅ Ready (1024×500) |
| **Screenshots (Phone)** | `store-assets/screenshots/*.png` | ⏳ 4/8 uploaded |
| **Screenshots (Tablet)** | Optional | ❌ Optional |
| **Promo Video** | YouTube URL (optional) | ❌ Optional |

### Screenshot Upload Order
1. `screenshot-01-dreamlist.png` - Dream list (main screen)
2. `screenshot-02-record.png` - Voice recording interface
3. `screenshot-03-detail.png` - Dream detail page
4. `screenshot-04-settings.png` - Settings page
5. (Optional) AI analysis interface
6. (Optional) Global dream map
7. (Optional) Recording in progress (180s countdown)
8. (Optional) Login page

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
| **Privacy Policy URL** | https://zbbsdsb.github.io/Thothapp/privacy.html |

---

## 🔒 Data Safety Section

### Data Collection

| Data Type | Collected? | Purpose | Shared? | Can Delete? |
|-----------|------------|---------|---------|-------------|
| **Name** | ✅ Yes | Account auth | No | ✅ Yes |
| **Email** | ✅ Yes | Account auth | No | ✅ Yes |
| **Audio Files** | ✅ Yes | Dream recording | No* | ✅ Yes |
| **Text (dream content)** | ✅ Yes | Dream journal | No* | ✅ Yes |
| **App Activity** | ⚠️ Anonymous | Analytics | No | N/A |

\* Audio and text are sent to Google Gemini for processing only, not shared with third parties.

### Security Practices
- [x] Data encrypted in transit (HTTPS/TLS)
- [x] Data encrypted at rest (Firebase AES-256)
- [x] Users can request data deletion
- [x] Users can export their data
- [ ] Third-party data sharing (checked if applicable)

---

## 📋 Permissions Declaration

| Permission | Required? | Purpose | Foreground? |
|-----------|-----------|---------|-------------|
| `RECORD_AUDIO` | ✅ Yes | Record dream voice memos | Yes (with notification) |
| `INTERNET` | ✅ Yes | Sync with Firebase, AI processing | N/A |
| `ACCESS_FINE_LOCATION` | ⚠️ Optional | Tag dream location (user choice) | No |
| `POST_NOTIFICATIONS` | ⚠️ Optional | Memory Collapse reminders | N/A |
| `FOREGROUND_SERVICE` | ✅ Yes | Recording notification | Yes |
| `FOREGROUND_SERVICE_MICROPHONE` | ✅ Yes | Recording notification | Yes |

### Permission Explanation Text (Copy into Play Console)

**RECORD_AUDIO**
```
Used to record voice memos of your dreams immediately after waking. Audio is processed locally and via Google Gemini AI for transcription. You can delete recordings anytime.
```

**ACCESS_FINE_LOCATION** (Optional)
```
Optional permission to tag your dreams with location context. This helps categorize dreams by geographic region on the global dream map. You can skip this permission.
```

**POST_NOTIFICATIONS** (Optional)
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

## ✅ Pre-Submission Checklist

### Technical
- [x] `google-services.json` in `android/app/`
- [x] Firebase SDK dependencies added
- [x] Release signing configured (`keystore.properties`)
- [x] `targetSdkVersion` = 36 (Play requirement)
- [x] AAB built and tested (`store-assets/thoth-v1.0-release.aab`)
- [x] App bundle under 150MB (5.2 MB)

### Store Listing
- [x] App name: Thoth - AI Dream Journal
- [x] Short description
- [x] Full description
- [ ] Screenshots uploaded (min 2, recommended 5-8)
- [ ] Feature graphic uploaded
- [x] Privacy policy URL live and accessible

### Compliance
- [x] Privacy policy written (`docs/PRIVACY.md`)
- [x] Privacy policy hosted and URL accessible
- [ ] Data safety section completed (use table above)
- [ ] Permissions justified (use text above)
- [ ] Content rating questionnaire completed

---

## 📎 Next Steps

1. **Log in to Google Play Console**
   - URL: https://play.google.com/console
   - Use same Google account that paid $25 registration fee

2. **Create Application**
   - Click "Create App"
   - Fill in: App name, Language, App type (Application), Free/Paid
   - Select "Health & Fitness" as category

3. **Complete Store Listing**
   - Copy/paste "Store Listing" section above
   - Upload Feature Graphic (`store-assets/feature-graphic.png`)
   - Upload screenshots (`store-assets/screenshots/*.png`)

4. **Upload AAB**
   - Go to "App Bundle Explorer"
   - Drag & drop `store-assets/thoth-v1.0-release.aab`
   - Wait for processing (5-10 minutes)

5. **Complete Data Safety**
   - Go to "Data Safety" section
   - Answer questions using "Data Safety Section" table above
   - Declare security practices

6. **Declare Permissions**
   - Go to "App Content" > "Permissions"
   - Explain each permission using "Permissions Declaration" text above

7. **Complete Content Rating**
   - Answer questionnaire
   - Expected rating: "Everyone" or "Teen"

8. **Submit for Review**
   - Click "Send for Review"
   - Wait for Google review (1-3 days, first review may take 3-7 days)

---

## 📞 Support

- **Technical Support**: zhaoceaser@gmail.com
- **Google Play Developer Support**: https://support.google.com/googleplay/android-developer/

---

**Document generated**: 2026-05-10  
**Next update**: After first release approved
