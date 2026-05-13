# MEMORY.md — Thoth Project Long-Term Context

> Last updated: 2026-05-12

## Developer Profile

- **Name**: Name (GitHub: zbbsdsb)
- **Language**: Chinese for communication, English for code / commits / filenames
- **Style**: Systematic, phased, structured; prefers tables + code examples; self-commits with English messages after tasks complete
- **Two active projects**: Thoth (Android/WearOS) + OasisBio (Next.js 15+)

---

## Project 1: Thoth — AI Dream Journal

- **Package**: `com.thoth.dreamarchive`
- **Repo**: `e:\ceaserzhao\github projects\Thothapp`
- **Stack**: Kotlin / Jetpack Compose / Firebase / Gradle Kotlin DSL
- **Goal**: Google Play release (AAB signed, store listing, privacy policy, screenshots ready)
- **Status**: Focus shifted to WearOS quality improvements

### WearOS Status (as of 2026-05-12)

| Phase | Status |
|-------|--------|
| W0 scaffold | ✅ Complete — wear-debug.apk builds |
| W1 recording flow | ✅ Code complete (RecordingScreen / ViewModel / AudioRecorderService / FirebaseRepository / Dream model) |
| W1 Firebase init crash | ❌ **BLOCKER** — `google-services.json` missing from `android/app/` |
| W1 code quality | 🔧 Review complete, fix plan written at `prepare/WEAROS_CODE_QUALITY_PLAN.md`, Trae task brief at `prepare/TRAE_TASK_WEAROS_QUALITY.md` |
| W2 DreamListScreen | ❌ Hardcoded placeholder, ViewModel skeleton not connected |
| W3 | ❌ Not started |

### Key Code Issues (identified 2026-05-12, assigned to Trae)
1. Double `WearTheme` wrap in `RecordingScreen` + `PermissionScreen`
2. Audio file deleted before upload confirms (no retry possible)
3. Silent exception swallowing in `AudioRecorderService`
4. `recorder!!` force-unwrap
5. `Config.MAX_RECORDING_DURATION_MS` not referenced by ViewModel (duplicated)
6. 44100Hz sample rate may fail on Wear OS (should be 16000Hz)
7. All colors / route strings hardcoded (no Color.kt, no strings.xml, no NavRoutes)

### Android (Phone App) Blockers
- `google-services.json` still missing from `android/app/` — crashes on startup
- Release keystore password `Thoth@2026` is temp — must change before Play Store release

### Authoritative Documents (by date, newest first)
1. `prepare/AI_COLLABORATION.md` — 2026-05-11 (most current)
2. `prepare/WEAROS_CODE_QUALITY_PLAN.md` — 2026-05-12 (code review plan)
3. `docs/WEAROS_HANDOVER.md` — 2026-05-10
4. `HANDOFF.md` — 2026-05-06

### Stale Documents (treated as outdated)
- `planning/NEXT_STEPS.md` — originally 2025-05-05 (SHA fingerprints may be stale)
- `planning/ROADMAP.md` — originally 2025-05-05 (updated header only)

---

## Project 2: OasisBio

- **Stack**: Next.js 15+ / Prisma 6.x / TypeScript
- **Current issue**: ~118 TypeScript errors, incremental phased fix strategy
- **Commit style**: One commit per phase

---

## Conventions

- Git commit messages: English only
- File naming: English only
- No Nx — this is Capacitor + npm workspaces
- `packages/common/` and `packages/ui/` are UNUSED — don't add code there
