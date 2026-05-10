# Apple App Store Submission Guide (Future)

> **Status**: Template for future iOS release
> **App Name**: Thoth - AI Dream Journal
> **Last updated**: 2026-05-10

---

## 📱 App Store Connect Preparation

### Required Assets
- [ ] App icon (1024×1024 px PNG)
- [ ] Screenshots (iPhone 6.5", 5.5", iPad if applicable)
- [ ] App preview video (optional, 15-30 seconds)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

---

## 🔒 Privacy Requirements (iOS 14+)

### App Privacy Section
Complete the App Privacy section in App Store Connect:

| Data Type | Collection | Purpose | Linked to User? | Tracking? |
|-----------|------------|---------|------------------|-----------|
| Contact Info (Email) | ✅ Yes | Account auth | ✅ Yes | ❌ No |
| User Content (Audio) | ✅ Yes | Dream recording | ✅ Yes | ❌ No |
| User Content (Text) | ✅ Yes | Dream journal | ✅ Yes | ❌ No |

**Data Not Collected**:
- Location
- Identifiers (except for auth)
- Usage Data (anonymous only)
- Diagnostics

---

## 📋 App Store Review Guidelines Compliance

### Key Points
- [ ] **Guideline 2.1 - Performance**: App functions as expected, no crashes
- [ ] **Guideline 2.3 - Accurate Metadata**: Screenshots match actual app functionality
- [ ] **Guideline 3.1.1 - In-App Purchase**: If offering premium features, use IAP
- [ ] **Guideline 4.2 - Minimum Functionality**: App provides substantial value
- [ ] **Guideline 5.1 - Data Collection and Storage**: User consent for microphone
- [ ] **Guideline 5.2 - Data Disclosure**: Privacy policy explains data use

---

## 🎙️ Microphone Permission (Required)

Add to `ios/Thoth/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Thoth uses the microphone to record your dream voice memos.</string>
```

**App Store Connect explanation**:
```
This app requires microphone access to record voice memos of your dreams immediately after waking. Audio is processed locally and via Google Gemini AI for transcription. Users can delete recordings anytime.
```

---

## 📦 Build and Upload

### Using Xcode
1. Open `ios/Thoth.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute App → App Store Connect
5. Upload (wait ~10-20 minutes)

### Using Command Line
```bash
cd ios
xcodebuild -workspace Thoth.xcworkspace -scheme Thoth -configuration Release archive -archivePath Thoth.xcarchive
xcodebuild -exportArchive -archivePath Thoth.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath .
```

---

## ✍️ App Store Listing

### App Name
```
Thoth - AI Dream Journal
```

### Subtitle (30 chars max)
```
AI dream journal & analysis
```

### Promotional Text (170 chars max)
```
Discover the hidden meanings in your dreams with AI-powered voice recording, analysis, and global dream map.
```

### Description (4000 chars max)
```
🌙 Discover the hidden meanings in your dreams with Thoth.

[Copy from GOOGLE_PLAY_STORE_LISTING.md, adapt if needed]
```

### Keywords (100 chars max)
```
dream journal,AI,sleep,dreams,Gemini,voice recording,self-reflection
```

---

## 🚀 Submit for Review

1. Log in to https://appstoreconnect.apple.com
2. Create new iOS app
3. Fill in all metadata (use text above)
4. Upload build (from Xcode or Transporter)
5. Select build for submission
6. Submit for review
7. Wait for Apple review (1-3 days)

---

## 📞 Support

- **Technical Support**: zhaoceaser@gmail.com
- **Apple Developer Support**: https://developer.apple.com/support/

---

**Note**: This is a template. Update with actual screenshots, build numbers, and final descriptions before submission.

**Document created**: 2026-05-10  
**Next update**: Before iOS release
