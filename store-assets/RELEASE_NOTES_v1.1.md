# Thoth v1.1 Release Notes

## 📦 Release Information

| Item | Details |
|------|---------|
| **App Name** | Thoth — AI Dream Archive |
| **Package ID** | `oasis.thoth` |
| **Version** | `1.1` (versionCode: 2) |
| **Build Date** | 2026-05-17 |
| **AAB File** | `store-assets/thoth-v1.1-release.aab` |
| **AAB Size** | ~5.0 MB |
| **Min SDK** | 24 (Android 7.0) |
| **Target SDK** | 34 (Android 14) |
| **Signing** | ✅ Signed with `thoth-upload-key.jks` |

---

## 🆕 What's New in v1.1

### ✨ New Features
- **Docs Page Redesign** — Completely revamped documentation UI with:
  - 🔍 Real-time search functionality
  - 🏷️ Category badges (Guides / Features / Specs)
  - ✨ Smooth Framer Motion animations
  - 📝 Enhanced Markdown rendering with custom styles
  - 🎯 Quick-access cards for popular docs

### 🐛 Bug Fixes
- **Delete Confirmation Dialog** — Fixed "Confirm Dissolution" dialog stuck issue:
  - Added conditional rendering — dialog only shows when `dreamToDelete` is set
  - Fixed `HistoryView` to trigger confirmation dialog instead of direct delete
  - Added demo mode support for delete operation
- **Build Configuration** — Separated debug and release signing properly

### 🎨 UI Improvements
- Enhanced visual hierarchy across all pages
- Improved dark theme consistency
- Smoother transitions and micro-interactions

---

## 📋 Technical Details

### Dependencies
- `@capacitor/android`: ^8.3.1
- `firebase-bom`: (managed by BoM)
- `motion`: ^12.38.0
- `react-markdown`: ^10.1.0
- `tailwindcss`: ^4.1.14

### Build Configuration
- **Release signing**: `thoth-upload` alias with `thoth-upload-key.jks`
- **Code obfuscation**: ProGuard enabled with resource shrinking
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 24 (Android 7.0)

---

## 🚀 Installation & Testing

### Test APK (Debug)
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Bundle (AAB)
```
store-assets/thoth-v1.1-release.aab
```

---

## 📝 Upgrade Notes

- Existing users will see the new Docs page design after update
- Delete functionality now requires confirmation (safer UX)
- No breaking changes in this release

---

## 🔐 Signing Certificate Fingerprints

> ⚠️ **Important**: Keep `thoth-upload-key.jks` and `keystore.properties` secure and backed up. You will need them for all future updates.

Generate fingerprints with:
```bash
keytool -list -v -keystore thoth-upload-key.jks -alias thoth-upload
```

---

**Build by**: WorkBuddy AI  
**Date**: 2026-05-17
