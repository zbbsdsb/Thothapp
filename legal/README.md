# legal/

This folder contains legal documents and submission guidelines for app store releases.

## Folder Structure

```
legal/
├── README.md                          # This file
├── PLAY_CONSOLE_SUBMISSION.md        # Google Play Console submission guide
├── PRIVACY_POLICY.md                 # Privacy policy (shared across platforms)
├── TERMS_OF_SERVICE.md              # Terms of service (for iOS/App Store)
├── APP_STORE_SUBMISSION.md          # Apple App Store submission guide (future)
└── LINUX_PACKAGING.md              # Linux packaging guidelines (future)
```

## Usage

### For Google Play Console
1. Follow `PLAY_CONSOLE_SUBMISSION.md`
2. Copy/paste text from the guide into Play Console fields
3. Upload assets from `store-assets/`

### For Apple App Store (Future)
1. Follow `APP_STORE_SUBMISSION.md`
2. Prepare privacy policy and terms of service
3. Complete App Store Connect questionnaire

### For Linux Distributions (Future)
1. Follow `LINUX_PACKAGING.md`
2. Prepare `.desktop` files, AppStream metadata
3. Submit to Flathub, Snapcraft, or distro repositories

## Notes
- All documents should be kept up-to-date across platforms
- Privacy policy must be accessible via public URL
- Terms of service are required for iOS but optional for Android
- Linux packaging may require additional metadata (AppStream, etc.)

---

**Maintained by**: Thoth Development Team  
**Last updated**: 2026-05-10
