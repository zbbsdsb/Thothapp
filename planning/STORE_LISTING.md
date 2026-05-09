# Thoth — Google Play Store Listing

> Draft: 2026-05-09
> Status: Ready for review and submission

---

## Store Listing Fields

### App Name
```
Thoth — Dream Journal
```
*(or simply "Thoth" — shorter names rank better on mobile)*

---

### Short Description (≤ 80 characters)

**Recommended:**
```
Record your dreams. Let AI uncover the patterns in your subconscious.
```
*Count: 67 characters ✅*

**Alternative A (emphasize privacy):**
```
Your dreams, private. Voice recording + AI analysis, just for you.
```
*Count: 68 characters ✅*

**Alternative B (emphasize mapping):**
```
Log dreams by voice. AI tags them. See your dream world on a global map.
```
*Count: 73 characters ✅*

---

### Full Description (≤ 4000 characters)

**Copy the following into Play Console → Main store listing → Full description:**

---

**Catch your dreams before they fade.**

Thoth is a voice-first dream journal that lets you capture what you dreamed the moment you wake up — no fumbling, no typing, just press and record. Your dream is transcribed and analyzed by Google Gemini AI, giving you tags, patterns, and insights you couldn't get from notes alone.

**Why Thoth?**

**Voice-first, bedside-ready.**
The entire recording flow is designed for 3am — one tap, speak freely, done. No app to navigate, no form to fill out. Your dream is saved and waiting for you in the morning.

**AI that actually understands dreams.**
Gemini AI doesn't just transcribe — it identifies recurring themes, emotional tones, archetypal imagery, and connections to your personal dream history. Over time, it surfaces patterns in your subconscious that you'd never notice on your own.

**Your dream archive, visualized.**
Browse your full dream history with search and filters. See where your imagery clusters on the global dream map — a real-time view of the collective dreamscape contributed by all Thoth users worldwide.

**Memory Collapse — don't let your dreams decay.**
Neuroscience suggests dream memories degrade within 48 hours without rehearsal. Thoth tracks how long it's been since your last dream and nudges you to record before the memory collapses. Think of it as spaced repetition, but for your subconscious.

**Your data stays yours.**
Dreams are deeply personal. Thoth uses Firebase Authentication (Google sign-in) to protect your account, stores everything in your private Firestore database, and never sells or shares your data. Only you can see your dreams.

**WearOS companion coming soon.**
The Thoth watch app brings one-tap recording to your wrist — perfect for bedside use without reaching for your phone.

**What's included:**
• Voice recording with one-tap start
• AI-powered transcription and tagging
• Dream archive with search and filters
• Global dream imagery map
• Memory Collapse countdown timer
• WearOS companion app (coming soon)

Record your dreams. Find the patterns. Understand yourself better.

---

*Keywords (optional, in Play Console keyword field):*
dream journal, dream log, dream catcher, lucid dreaming, sleep tracker, dream diary, voice recorder, sleep journal, subconscious, AI dream analyzer, sleep app, dream mapping

---

## Screenshots & Graphic Assets

### Required Screenshots

| Slot | Type | Size | Notes |
|------|------|------|-------|
| Phone screenshot 1 | Recording screen | 1080×1920 px (or any 16:9–9:19 ratio) | Show the voice recording button, 3am use case |
| Phone screenshot 2 | Dream list / archive | same ratio | Show personal dream history |
| Phone screenshot 3 | AI analysis result | same ratio | Show tags + insight card |
| Phone screenshot 4 | Global dream map | same ratio | Show the world map with dream clusters |
| Phone screenshot 5 | Memory Collapse | same ratio | Show the countdown timer |
| Feature graphic | Hero image | 1024 × 500 px | Dark themed, app name + dream imagery |

### How to Take Screenshots

**Android Emulator (recommended for consistent quality):**
1. Open Android Studio → Device Manager → Start a Pixel 6 / Pixel 7 device
2. `cd android` → `./gradlew installDebug` (or run from Android Studio)
3. Navigate to each screen in the app
4. Press **Ctrl+S** (Windows) or use the emulator toolbar to capture

**Or on a real device:**
1. Install the debug APK
2. Navigate to each screen
3. Hold Power + Volume Down to screenshot

### Feature Graphic Design Direction

- **Background:** Deep dark (#0a0a0f or similar), dreamlike (subtle nebula, stars, or wave texture)
- **Text:** "Thoth" in large, clean white or pale gold serif/sans-serif font
- **Optional:** Small app icon in corner, subtle phone silhouette
- **Style:** Premium, minimal, calming — NOT busy or colorful
- **Tools:** Canva, Figma, or run `image_gen` to generate concept options

---

## Additional Store Fields

| Field | Recommended Value |
|-------|------------------|
| **App type** | Application |
| **Category** | Lifestyle |
| **Sub-category** | (none — Lifestyle is the only option) |
| **Tags** | dream, journal, sleep, voice recorder, AI, wellness |
| **Content rating** | Everyone (no adult content, no violence, no profanity) |
| **Contact email** | *(your email — e.g. contact@thoth.app)* |
| **Website** | *(your domain — e.g. https://thoth.app)* |

---

## Local Availability

| Setting | Recommended |
|---------|------------|
| Countries | All countries (or select specific markets) |
| Distribution | Enable in all countries by default |

---

*Document version: v1.0.0 | Ready to copy into Play Console*
