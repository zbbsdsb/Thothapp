# Thoth v1.1 — Release Notes

---

## Release Information

| Item | Details |
|------|---------|
| **App** | Thoth — AI Dream Archive |
| **Package ID** | `oasis.thoth` |
| **Version** | `1.1` (versionCode 2) |
| **Release Date** | May 17, 2026 |
| **Min SDK** | API 24 (Android 7.0) |
| **Target SDK** | API 34 (Android 14) |
| **Bundle Size** | ~5.0 MB |

---

## What's New

### ✨ Redesigned Docs Page
A complete overhaul of the documentation experience:
- **Real-time search** — Find docs instantly by title or description
- **Category badges** — Visual indicators for Guides, Features, and Specs
- **Smooth animations** — Framer Motion transitions throughout
- **Enhanced Markdown** — Custom-styled code blocks, tables, and blockquotes
- **Quick-access cards** — Jump straight to popular docs from the landing page

### 🐛 Bug Fixes
- **Delete confirmation dialog** — Fixed an issue where the confirmation dialog would appear stuck. The dialog now only renders when a deletion is initiated.
- **Demo mode delete** — Fixed delete operations in demo mode that were failing silently.
- **Build configuration** — Properly separated debug and release signing configurations.

### 🎨 UI Improvements
- Improved visual consistency across all pages
- Smoother transitions and micro-interactions
- Refined dark theme color palette

---

## Technical Notes

### Signed Build
This bundle is signed with the production keystore (`thoth-upload-key.jks`). Keep your keystore and `keystore.properties` file backed up securely — you'll need them for all future updates.

### What's Included
- Voice-based dream recording with AI transcription
- Dream journaling with rich metadata (location, tags, imagery)
- Global dream statistics and trends
- Firebase-powered sync and authentication
- Privacy-first design

### Permissions Required
- **Microphone** — For voice-based dream recording
- **Storage** (optional) — For saving dream recordings locally
- **Internet** — For Firebase sync and AI transcription

---

## Installation

### Test with Debug APK
Install `android/app/build/outputs/apk/debug/app-debug.apk` on your device for testing.

### Production Release
Upload `thoth-v1.1-release.aab` to Google Play Console.

---

## Upgrade Notes

- **No breaking changes** — This is a minor release with UI improvements and bug fixes
- Existing users will see the new Docs page design after updating
- Delete operations now require explicit confirmation for better UX

---

*Built with WorkBuddy AI · May 17, 2026*
