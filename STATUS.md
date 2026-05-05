# Thoth — Project Status

> Last updated: May 5, 2026

## What is Thoth?

Thoth is a cross-platform AI dream journal that captures voice recordings of dreams immediately after waking, transcribes and analyzes them with Gemini AI, and archives them in a personal + global imagery database. Available on Android and Web.

## Current Status

**Overall: Alpha — Core loop functional, polishing for closed beta**

| Module | Status | Notes |
|--------|--------|-------|
| Voice Recording & Transcription | ✅ Working | Web: MediaRecorder API. Android: Capacitor WebView. |
| AI Analysis (Gemini) | ✅ Working | Transcription + tag extraction + insight generation. |
| Dream Archive (CRUD) | ✅ Working | Firestore-backed, real-time updates, delete with stats sync. |
| Global Imagery Map | ✅ Working | D3.js + TopoJSON world map, live tag/country aggregation. |
| User Auth (Google OAuth) | ✅ Working | Firebase Auth, auto-create profile on first sign-in. |
| Audio Storage | ✅ Working | Web → Cloudflare R2. Android → Firebase Storage (fallback). |
| Memory Collapse Countdown | ✅ Working | 180s timer with dissolve animation. |
| Android APK Build | ✅ Working | Capacitor 8, signed with upload keystore, Play-ready. |
| iOS Build | ⚠️ Scaffold | Capacitor shell generated, not yet built/tested. |
| WearOS | 📋 Planned | Plan documented, not started. |
| Push Notifications | 📋 Planned | FCM integration not yet implemented. |
| Offline Cache | 📋 Planned | No Room/SQLite cache yet. |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TailwindCSS 4 + Framer Motion |
| Mobile Shell | Capacitor 8 (Android live, iOS scaffold) |
| Backend | Express (R2 presign proxy, dev server) |
| Database | Firebase Firestore (Auth + Firestore + Storage) |
| AI | Google Gemini (`@google/genai`) |
| File Storage | Cloudflare R2 (web) + Firebase Storage (mobile fallback) |
| Visualization | D3.js + TopoJSON |
| Build | Vite → `dist/`, Capacitor sync → native wrapper |

## What Works End-to-End

1. **Sign in** with Google → profile auto-created in Firestore
2. **Record** a dream via voice or type text
3. **AI processes** the transcript → tags, insight, oracle sentence
4. **Dream saved** to Firestore, audio uploaded to R2/Firebase Storage
5. **Browse** personal archive with search/filter
6. **Explore** global dream map showing collective imagery patterns
7. **Delete** dreams with proper Firestore document removal + counter sync

## Known Limitations

- No push notifications yet (Memory Collapse reminders are in-app only)
- No offline support — requires internet for all operations
- iOS not yet tested on real devices
- Bundle size is large (~1.3MB JS, mostly Firebase + D3) — needs code splitting
- Public Gemini API key has a daily quota (3 dreams/day); users can add their own key

## Roadmap Highlights

- [ ] Code splitting to reduce initial bundle size
- [ ] Push notifications for Memory Collapse reminders
- [ ] iOS build verification and TestFlight
- [ ] WearOS companion app
- [ ] Background recording service (Android)

> 📋 For detailed next steps and product roadmap, see [`planning/NEXT_STEPS.md`](planning/NEXT_STEPS.md) and [`planning/ROADMAP.md`](planning/ROADMAP.md).

---

*This is a living document. For detailed architecture and API docs, see `docs/`. For team handoff, see [`HANDOFF.md`](HANDOFF.md).*
