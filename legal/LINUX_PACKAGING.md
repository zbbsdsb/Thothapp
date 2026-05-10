# Linux Packaging Guide (Future)

> **Status**: Template for future Linux release
> **Last updated**: 2026-05-10

---

## 🐧 Target Distributions

### Primary Targets
- [ ] **Ubuntu** (deb package)
- [ ] **Fedora** (rpm package)
- [ ] **Arch Linux** (AUR package)
- [ ] **Flatpak** (universal, recommended)
- [ ] **Snap** (universal, Canonical)

---

## 📦 Flatpak Packaging (Recommended)

### Why Flatpak?
- Works on all major distributions
- Sandboxing improves security
- Automatic updates via Flathub
- Decentralized dependencies

### Flatpak Manifest (`com.thoth.Thoth.yaml`)
```yaml
app-id: com.thoth.Thoth
runtime: org.gnome.Platform
runtime-version: '45'
sdk: org.gnome.Sdk
command: thoth

finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --share=ipc
  - --device=all # Microphone access
  - --talk-name=org.freedesktop.secrets # Keyring access

modules:
  - name: thoth
    buildsystem: simple
    build-commands:
      - make install
    sources:
      - type: archive
        url: https://github.com/zbbsdsb/Thothapp/releases/download/v1.0/thoth-v1.0.tar.gz
        sha256: ...
```

### Submit to Flathub
1. Fork https://github.com/flathub/flathub
2. Create `com.thoth.Thoth/` directory
3. Add manifest and metadata
4. Submit pull request

---

## 📦 Snap Packaging

### Snapcraft YAML (`snap/snapcraft.yaml`)
```yaml
name: thoth
version: '1.0'
summary: AI-powered dream journal
description: |
  Thoth is an AI-powered dream journal that helps you capture,
  understand, and explore your dreams.

confinement: strict
grade: stable

apps:
  thoth:
    command: desktop-launch $SNAP/thoth
    plugs:
      - audio-record
      - network
      - network-bind

parts:
  thoth:
    plugin: make
    source: .
```

### Build and Upload
```bash
snapcraft
snapcraft upload thoth_1.0_amd64.snap
```

---

## 📦 Deb Packaging (Ubuntu/Debian)

### Directory Structure
```
thoth-v1.0/
├── DEBIAN/
│   ├── control
│   ├── postinst
│   └── postrm
├── usr/
│   ├── bin/
│   │   └── thoth
│   ├── share/
│   │   ├── applications/
│   │   │   └── thoth.desktop
│   │   ├── icons/
│   │   │   └── hicolor/
│   │   │       └── 256x256/
│   │   │           └── apps/
│   │   │               └── thoth.png
│   │   └── doc/
│   │       └── thoth/
│   │           ├── copyright
│   │           └── changelog
│   └── lib/
│       └── thoth/
└── etc/
    └── thoth/
        └── config.json
```

### Control File (`DEBIAN/control`)
```
Package: thoth
Version: 1.0
Section: utils
Priority: optional
Architecture: amd64
Depends: libgtk-3-0, libnotify4, libnss3, libxss1, libxtst6, xdg-utils, libatspi2.0-0
Maintainer: Thoth Team <zhaoceaser@gmail.com>
Description: AI-powered dream journal
 Thoth is an AI-powered dream journal that helps you capture,
 understand, and explore your dreams using advanced AI technology.
```

### Build Deb Package
```bash
dpkg-deb --build thoth-v1.0
lintian thoth-v1.0.deb # Check for errors
```

---

## 📦 RPM Packaging (Fedora/RHEL)

### SPEC File (`thoth.spec`)
```
Name:           thoth
Version:        1.0
Release:        1%{?dist}
Summary:        AI-powered dream journal

License:        MIT
URL:            https://thoth.app
Source0:        https://github.com/zbbsdsb/Thothapp/releases/download/v1.0/%{name}-%{version}.tar.gz

BuildRequires:  desktop-file-utils
Requires:       gtk3, libnotify, nss, libXScrnSaver, libXtst, xdg-utils

%description
Thoth is an AI-powered dream journal that helps you capture,
understand, and explore your dreams.

%prep
%setup -q

%build
make %{?_smp_mflags}

%install
make install DESTDIR=%{buildroot}

%files
%doc README.md LICENSE
%{_bindir}/thoth
%{_datadir}/applications/thoth.desktop
%{_datadir}/icons/hicolor/*/apps/thoth.png

%changelog
* Sat May 10 2026 Thoth Team <zhaoceaser@gmail.com> - 1.0-1
- Initial release
```

### Build RPM
```bash
rpmbuild -ba thoth.spec
```

---

## 📦 AppImage (Portable)

### Build Script
```bash
# Download AppImageTool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage

# Create AppDir structure
mkdir -p AppDir/usr/bin
cp thoth AppDir/usr/bin/
cp thoth.png AppDir/
cp thoth.desktop AppDir/

# Build AppImage
./appimagetool-x86_64.AppImage AppDir Thoth-v1.0-x86_64.AppImage
```

---

## 🖼️ Linux Desktop Integration

### Desktop File (`thoth.desktop`)
```desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=Thoth - AI Dream Journal
Comment=AI-powered dream journal with voice recording
Exec=thoth %U
Icon=thoth
Terminal=false
Categories=Utility;Office;
MimeType=x-scheme-handler/thoth;
StartupNotify=true
StartupWMClass=Thoth
```

### AppStream Metadata (`com.thoth.Thoth.appdata.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop">
  <id>com.thoth.Thoth</id>
  <name>Thoth</name>
  <summary>AI-powered dream journal</summary>
  <description>
    <p>
      Thoth is an AI-powered dream journal that helps you capture,
      understand, and explore your dreams.
    </p>
  </description>
  <screenshots>
    <screenshot type="default">
      <image>https://thoth.app/screenshots/main.png</image>
    </screenshot>
  </screenshots>
  <releases>
    <release version="1.0" date="2026-05-10"/>
  </releases>
  <content_rating type="oars-1.1"/>
</component>
```

---

## 🚀 Distribution Checklist

### Pre-Release
- [ ] Test on clean Ubuntu/Fedora/Arch installations
- [ ] Verify microphone permission works
- [ ] Check AppStream metadata validates (`appstream-util validate`)
- [ ] Ensure `.desktop` file is valid (`desktop-file-validate`)
- [ ] Test all packaging formats (deb, rpm, Flatpak, Snap)

### Release
- [ ] Upload to GitHub Releases
- [ ] Submit to Flathub
- [ ] Submit to Snapcraft
- [ ] Upload to personal PPA (Ubuntu)
- [ ] Upload to Copr (Fedora)
- [ ] Create AUR package (Arch)

### Post-Release
- [ ] Announce on Linux communities (Reddit, Hacker News)
- [ ] Monitor issues and feedback
- [ ] Update packages for new versions

---

## 📞 Support

- **Email**: zhaoceaser@gmail.com
- **GitHub Issues**: https://github.com/zbbsdsb/Thothapp/issues

---

**Note**: This is a template. Update with actual build scripts, dependencies, and distribution channels before release.

**Document created**: 2026-05-10  
**Next update**: Before Linux release
