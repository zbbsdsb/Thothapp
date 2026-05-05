# Thoth App — Product Roadmap

> **Status**: Updated 2025-05-05
> **Current Version**: v2.0.0 (Post-migration, security-hardened)

---

## 🎯 Vision

Build the world's first real-time, collaborative dream archiving platform that visualizes the collective subconscious through interactive maps and AI-powered analysis.

---

## 📊 Current Status (v2.0.0)

### ✅ Completed
- **Core Recording**: Voice-to-text with Gemini API
- **Firebase Integration**: Auth, Firestore, Storage
- **Cross-Platform**: Web (PWA), Android, iOS (Capacitor)
- **Security Hardening**: CORS, path traversal protection, env var alignment
- **Documentation**: HANDOFF.md, STATUS.md, README.md, CHANGELOG.md

### ⚠️ Known Limitations
- Bundle size ~1.3MB (needs code splitting)
- R2 uploads fallback to Firebase on mobile (no Express server)
- `allowMixedContent: true` in Capacitor (should remove after HTTPS migration)
- No offline support yet

---

## 🗺️ Roadmap

### Phase 1: Polish & Performance (1-2 months)

#### 🔧 Technical Debt
- [ ] **Code Splitting** — Reduce main bundle from 1.3MB to <500KB
  - Lazy load D3.js visualization
  - Dynamic import for Framer Motion animations
  - Split vendor and app chunks
- [ ] **Remove `allowMixedContent`** — Ensure all R2 URLs use HTTPS
- [ ] **Update Keystore Password** — Replace temp password `Thoth@2026` before release
- [ ] **Add Error Boundaries** — Prevent white screens, show user-friendly errors
- [ ] **Unit Tests** — Cover critical hooks: `useRecording`, `useAuth`, `useDreams`

#### 🎨 UX Improvements
- [ ] **Loading States** — Skeleton screens for dream list and map
- [ ] **Offline Indicator** — Show when user is offline
- [ ] **Recording Timer** — Visual feedback during voice recording
- [ ] **Dream Edit/Delete** — Allow users to modify their archived dreams
- [ ] **Search & Filter** — Filter dreams by date, tags, sentiment

---

### Phase 2: Core Features (2-3 months)

#### 🌍 Global Dream Map Enhancements
- [ ] **Real-time Updates** — WebSocket or Firestore listeners for live dream feed
- [ ] **Heatmap Visualization** — Density-based rendering for busy regions
- [ ] **Dream Clusters** — Group nearby dreams, show aggregate themes
- [ ] **Click-to-Explore** — Tap a country to see dream snippets and stats
- [ ] **Time Slider** — View dreams from specific date ranges

#### 🤖 AI-Powered Insights
- [ ] **Dream Patterns** — Weekly/monthly trend analysis
- [ ] **Theme Extraction** — Auto-tag dreams (flying, water, family, etc.)
- [ ] **Sentiment Tracking** — Mood over time visualization
- [ ] **Dream Similarity** — "Dreams like yours" from global archive
- [ ] **Lucid Dream Detection** — Flag potential lucid dreams via keywords

#### 👥 Social Features (MVP)
- [ ] **Public/Private Toggle** — Users choose dream visibility
- [ ] **Follow Dreamers** — Subscribe to interesting dream archives
- [ ] **Dream Reactions** — Emoji reactions on public dreams
- [ ] **Share to Social** — Export dream summary as image/card

---

### Phase 3: Scale & Monetization (3-6 months)

#### 🏗️ Infrastructure
- [ ] **Replace Express with Cloudflare Worker** — For R2 presign (removes web-only limitation)
- [ ] **CDN Optimization** — Cache static assets and R2 audio files
- [ ] **Database Sharding** — Prepare Firestore for millions of dreams
- [ ] **Image Support** — Allow dreamers to attach sketches/photos
- [ ] **Service Worker** — Full offline support with background sync

#### 💎 Premium Features (Potential Monetization)
- [ ] **Advanced Analytics** — Detailed personal dream statistics
- [ ] **Dream Journal Export** — PDF/Markdown export of dream history
- [ ] **AI Dream Interpretation** — Personalized psychological insights
- [ ] **Custom Themes** — Dark/light/system + premium color schemes
- [ ] **Ad-Free Experience** — For premium subscribers

#### 🌐 Platform Expansion
- [ ] **Desktop Apps** — Electron wrapper for Windows/Mac
- [ ] **Watch Apps** — Quick voice memo to dream archive
- [ ] **Voice Assistants** — "Hey Google, archive my dream"

---

### Phase 4: Community & Impact (6+ months)

#### 🏆 Community Features
- [ ] **Dream Challenges** — Weekly themes (e.g., "Lucid Dreaming Week")
- [ ] **Moderation Tools** — Report inappropriate content
- [ ] **Dream Admin Dashboard** — Manage public dreams and users
- [ ] **API for Researchers** — Anonymous dream data for psychology studies

#### 📱 Integrations
- [ ] **Fitbit/Oura** — Correlate sleep quality with dream recall
- [ ] **Notion/Roam** — Export dreams to note-taking apps
- [ ] **Spotify** — "Dream playlist" based on dream mood

---

## 🎯 Success Metrics

### User Engagement
- DAU/MAU ratio > 30%
- Average dreams archived per user > 5
- Recording completion rate > 80%

### Technical Health
- Page load time < 1.5s
- Animation frame rate 60fps
- Crash-free sessions > 99%

### Business (If Monetizing)
- Premium conversion > 5%
- CAC (Customer Acquisition Cost) < $10
- LTV (Lifetime Value) > $50

---

## 🚫 Out of Scope (For Now)

- **Multi-language support** — English-only initially (AI transcription limitation)
- **Video dreams** — Audio-only for MVP
- **Blockchain/Web3** — No NFTs or crypto integration planned
- **Live streaming** — Not a social media platform

---

## 📅 Release Schedule

| Version | Target Date | Key Features |
|---------|-------------|--------------|
| **v2.1** | +1 month | Code splitting, error boundaries, edit/delete dreams |
| **v2.2** | +2 months | Real-time map updates, dream search/filter |
| **v3.0** | +4 months | AI insights, theme extraction, social MVP |
| **v3.1** | +6 months | Cloudflare Worker, offline support, premium features |

---

**Next Milestone**: v2.1 — Performance & Polish (Code splitting + UX improvements)
