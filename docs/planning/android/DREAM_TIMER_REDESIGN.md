# Dream Recording Timer — UX Redesign Report

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | `DREAM_TIMER_REDESIGN.md` |
| Date | 2026-05-23 |
| Status | Approved — Ready for Implementation |
| Affected Files | `src/hooks/useCountdown.ts`, `src/components/RecordView.tsx`, `src/App.tsx` |

---

## 1. Problem Statement

The current dream recording screen features a **mandatory 3-minute countdown** with a "dream dissolution" metaphor. When the timer reaches zero, the UI enters a "Dream Lost" state — the title blurs, the text changes to "The Dream has Dissolved," and the user must explicitly reset.

### Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| Punitive UX | High | Users lose their recording context after 3 minutes despite the audio still existing |
| Time anxiety | Medium | The countdown creates pressure that conflicts with the relaxed "recall your dream" goal |
| Broken metaphor | Medium | Dreams fade from memory, but recordings do not — the analogy is logically inconsistent |
| No user control | Medium | Users cannot disable, pause, or adjust the timer |
| Short duration | Low | 3 minutes may not be enough for complex or multi-part dreams |

---

## 2. Design Decision: C+A Hybrid

### Concept

**Default Mode (C — No Timer):** Recording starts with no countdown. The user records at their own pace with no time pressure. This is the default experience for all users.

**Atmosphere Mode (A — Optional Timer):** Users can optionally enable a poetic "Dream Clarity" countdown. This is a purely ambient/atmospheric effect — when it reaches zero, the UI shows a gentle visual shift but **does NOT interrupt recording or mark the dream as lost**. The recording continues normally.

### Key Principles

1. **No punishment** — Timer expiry never stops recording or invalidates content
2. **User control** — The timer is opt-in, not opt-out
3. **Honest metaphor** — The visual effect represents dream freshness, not data loss
4. **Minimal disruption** — Enabling/disabling the timer should not affect the recording flow

---

## 3. Behavior Specification

### 3.1 Default Mode (Timer Off)

| State | UI Behavior |
|-------|------------|
| Idle | No timer visible. Title: "Whisper to the Subconscious" |
| Recording | No timer. Recording indicator (red pulse) is the only visual cue |
| Recording complete | Normal flow — transcribe, analyze, save |

### 3.2 Atmosphere Mode (Timer On)

| State | UI Behavior |
|-------|------------|
| Idle | Timer toggle visible (small icon near the mic button) |
| Recording started | "Dream Clarity" indicator appears with a soft countdown |
| Countdown > 30s | Normal display — clarity percentage decreases smoothly |
| Countdown ≤ 30s | Warning phase — color shifts from accent to warm amber |
| Countdown = 0 | **Gentle visual shift only** — background subtly changes, text becomes "The dream is settling..." |
| After expiry | Recording continues. No "Lost" state. No blur. User can stop whenever they want |
| Recording complete | Normal flow — transcribe, analyze, save |

### 3.3 Timer Toggle

- **Location**: Small icon button below the main mic button, next to the voice/text toggle
- **Default state**: Off (timer disabled)
- **Toggle on**: Shows duration picker (3min / 5min / 10min), then starts countdown on next recording
- **Toggle off**: Immediately hides the countdown, no effect on current recording
- **Persistence**: Remember user's preference in `localStorage`

---

## 4. Visual Design Specification

### 4.1 Default Mode (No Timer)

No changes to the current UI except:
- Remove the "Collapse" countdown display
- Remove the "Dream Lost" state and its blur effect
- Keep the recording pulse animation as-is

### 4.2 Atmosphere Mode — Timer Active

```
┌─────────────────────────────────────────┐
│                                         │
│     Whisper to the Subconscious         │
│                                         │
│   ┌─────────────────────────────┐       │
│   │  ○ Dream Clarity: 87%       │       │
│   │    ▔▔▔▔▔▔▔▔▔▔▔▔░░░       │       │
│   └─────────────────────────────┘       │
│                                         │
│   "The imagery is still vivid"           │
│                                         │
│              [ 🎤 Mic Button ]           │
│                                         │
│     [ 🕐 Timer ]  [ ⌨️ Type Dream ]     │
│                                         │
└─────────────────────────────────────────┘
```

### 4.3 Atmosphere Mode — Timer Expired (Gentle Shift)

```
┌─────────────────────────────────────────┐
│                                         │
│     Whisper to the Subconscious         │
│     (subtle warm tint on background)     │
│                                         │
│   ┌─────────────────────────────┐       │
│   │  ○ Dream Clarity: Fading   │       │
│   │    ░░░░░░░░░░░░░░░░░       │       │
│   └─────────────────────────────┘       │
│                                         │
│   "The dream is settling into memory..."  │
│                                         │
│              [ 🎤 Mic Button ]           │
│         (still recording, no stop)       │
│                                         │
└─────────────────────────────────────────┘
```

**Key differences from current design:**
- No blur effect on title
- No "Dissolved" text
- No "Signal Lost" message
- Recording continues normally
- Background tint is warm (amber), not dark/oppressive

### 4.4 Color Progression

| Phase | Time Remaining | Accent Color | Background |
|-------|---------------|--------------|------------|
| Fresh | 100%–30% | `dream-accent` (default) | No change |
| Warning | 30%–0% | Warm amber `#F59E0B` | Subtle warm tint |
| Settled | 0% (expired) | Muted amber `#92400E` | Soft warm glow |

---

## 5. Technical Specification

### 5.1 Hook Changes: `src/hooks/useCountdown.ts`

```typescript
// New interface
interface UseCountdownOptions {
  duration?: number;       // Timer duration in seconds (default: 180)
  enabled?: boolean;       // Whether the timer is active (default: false)
  warningThreshold?: number; // Seconds remaining when warning starts (default: 30)
}

interface UseCountdownReturn {
  countdown: number | null;
  clarityPercent: number | null;  // 100 → 0, replaces raw seconds
  phase: 'inactive' | 'fresh' | 'warning' | 'settled';
  isSettled: boolean;            // Replaces isDreamLost — NO punitive behavior
  start: () => void;
  stop: () => void;
  reset: () => void;
  format: (seconds: number) => string;
}
```

**Key changes from current implementation:**

| Current | New | Reason |
|---------|-----|--------|
| `COLLAPSE_SECONDS = 180` (hardcoded) | `duration` parameter (configurable) | User choice |
| Auto-starts when `isActive` | Manual `start()` call | User control |
| `isDreamLost` (punitive) | `isSettled` (informational) | No punishment |
| Timer creates interval in useEffect | Timer managed by explicit start/stop | Cleaner lifecycle |
| No phases | `phase: 'inactive' \| 'fresh' \| 'warning' \| 'settled'` | Visual feedback |

### 5.2 Component Changes: `src/components/RecordView.tsx`

**Remove:**
- `isDreamLost` conditional rendering (blur, "Dissolved" text, "Signal Lost" message)
- "Attempt to recall fragments" reset button

**Add:**
- Timer toggle button (icon + label) below mic button
- Duration picker (3min / 5min / 10min) when enabling timer
- `clarityPercent` display (replaces raw countdown)
- Phase-based color transitions
- "Settled" state with warm background tint (non-blocking)

**Props changes:**

```typescript
// Current
interface RecordViewProps {
  countdown: number | null;
  isDreamLost: boolean;
  formatCountdown: (s: number) => string;
  onCancelCountdown: () => void;
  onResetCountdown: () => void;
  // ...
}

// New
interface RecordViewProps {
  timerPhase: 'inactive' | 'fresh' | 'warning' | 'settled';
  clarityPercent: number | null;
  timerEnabled: boolean;
  timerDuration: number;
  onToggleTimer: () => void;
  onChangeDuration: (seconds: number) => void;
  // ... (remove isDreamLost, onCancelCountdown, onResetCountdown)
}
```

### 5.3 State Management: `src/App.tsx`

**Add:**
- `timerEnabled` state (persisted to `localStorage`)
- `timerDuration` state (persisted to `localStorage`)
- Pass new props to `RecordView`

```typescript
// Persist user preference
const [timerEnabled, setTimerEnabled] = useState(() => {
  return localStorage.getItem('thoth_timer_enabled') === 'true';
});

const [timerDuration, setTimerDuration] = useState(() => {
  return parseInt(localStorage.getItem('thoth_timer_duration') ?? '180', 10);
});

useEffect(() => {
  localStorage.setItem('thoth_timer_enabled', String(timerEnabled));
}, [timerEnabled]);

useEffect(() => {
  localStorage.setItem('thoth_timer_duration', String(timerDuration));
}, [timerDuration]);
```

---

## 6. Migration Guide

### Step 1: Update `useCountdown.ts`

- Rename `isDreamLost` → `isSettled`
- Add `enabled` parameter (default: `false`)
- Add `duration` parameter (default: `180`)
- Add `warningThreshold` parameter (default: `30`)
- Add `phase` computed property
- Add `clarityPercent` computed property
- Add `start()` / `stop()` methods
- Remove auto-start on `isActive`

### Step 2: Update `RecordView.tsx`

- Replace countdown display with clarity percentage
- Remove blur/dissolved/lost UI states
- Add settled state with warm tint
- Add timer toggle button
- Add duration picker
- Update color transitions based on phase

### Step 3: Update `App.tsx`

- Add `timerEnabled` and `timerDuration` state with localStorage persistence
- Update props passed to `RecordView`
- Remove `isDreamLost` handling

### Step 4: Cleanup

- Remove all references to `isDreamLost` across the codebase
- Remove `onResetCountdown` and `onCancelCountdown` props
- Update any tests that reference the old behavior

---

## 7. Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/hooks/useCountdown.ts` | **Rewrite** | New interface with enabled/duration/phase |
| `src/components/RecordView.tsx` | **Modify** | Replace punitive UI with atmospheric UI, add toggle |
| `src/App.tsx` | **Modify** | Add timer state management with persistence |
| `src/hooks/index.ts` | **Modify** | Update export if needed |

---

## 8. Out of Scope

- Backend changes (no server impact)
- WearOS changes (WearOS has its own 5-minute timer in `RecordingViewModel.kt`)
- Analytics/event tracking (can be added later)
- A/B testing infrastructure (can be added later)

---

*Last updated: 2026-05-23*
