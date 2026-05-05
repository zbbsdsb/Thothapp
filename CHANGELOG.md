# Changelog

All notable changes to the Thoth project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `STATUS.md` — public-facing project status document
- `HANDOFF.md` — internal team handoff documentation

### Fixed
- **Critical**: `useRecording.ts` now calls `addDream()` to persist voice-recorded dreams (previously discarded all data)
- **Critical**: `RecordView.tsx` — added missing `Mic2` import (crashed on mode toggle)
- **Critical**: `useDreams.ts` — added missing `serverTimestamp` import
- **High**: `App.tsx` — `handleDeleteConfirm` now actually deletes the Firestore document (previously only updated counter)
- **High**: `useDreams.ts` — `total_dreams` uses `increment(-1)` instead of raw `-1`
- **Medium**: `package.json` name changed from `"react-example"` to `"thoth"`
- **Medium**: `.gitignore` now ignores `firebase-applet-config.json`
- **Medium**: `vite.config.ts` — removed manual `define()` injection, now uses Vite native `VITE_` prefix
- **Medium**: `server.ts` — CORS restricted to whitelist, R2 presign now validates fileName and contentType
- **Medium**: `storage.ts` — platform-aware routing (web → R2 first, mobile → Firebase Storage directly)
- **Medium**: Removed unused imports (`serverTimestamp` in `useAuth.ts`, `useDreams` in `RecordView.tsx`)

### Changed
- `ANDROID_PLAN.md` — completed Phase 0, updated to v1.2.0
- `PROJECT_STRUCTURE.md` — rewritten to reflect actual npm workspaces (not Nx), v2.0.0
- `WEAROS_PLAN.md` — updated Gradle config examples to Groovy DSL (matching actual project)

---

## [2.0.0] - 2026-04-23 (Milestone)

### Added
- Capacitor cross-platform shell (Android generated, iOS scaffolded)
- npm workspaces structure (`packages/*`)
- Android Gradle build system (Groovy DSL, Material3, signing config)
- Firebase integration (Auth, Firestore, Storage)
- Cloudflare R2 storage with Firebase Storage fallback
- Global Imagery Map (D3.js + TopoJSON)
- Memory Collapse Countdown (180s timer with animations)
- Divine Oracle AI-generated insight sentences
- Dream tagging and psychological analysis (Gemini AI)
- Watch Mode UI (circular display simulation)

### Changed
- **Project structure**: Actually uses npm workspaces, NOT Nx (many docs incorrectly referenced Nx — fixed in v2.0.0 docs)
- `capacitor.config.ts` — dark theme, splash screen, status bar config
- Android `variables.gradle` — centralized SDK versions (compileSdk=36, minSdk=24, targetSdk=36)

### Fixed
- Various UX improvements and performance optimizations

---

## [1.0.8] - 2026-04-19

### Added
- Initial release of Thoth AI Dream Archive
- Core dream capture and analysis functionality
- AI-powered transcription and analysis (Gemini)
- Divine Oracle feature
- Memory Collapse Countdown
- Global Imagery Map
- User authentication with Google
- Firebase Firestore integration
- Cloudflare R2 storage integration
- Web application interface

---

[Unreleased]: https://github.com/caozhe/ThothApp/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/caozhe/ThothApp/releases/tag/v2.0.0
[1.0.8]: https://github.com/caozhe/ThothApp/releases/tag/v1.0.8
