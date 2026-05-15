# Good First Issues for Thoth

A curated list of beginner-friendly issues for new contributors to the Thoth project.

## What are "Good First Issues"?

Good First Issues are well-defined tasks that are:
- **Self-contained**: Can be completed independently
- **Low risk**: Changes are contained and easy to review
- **Well-documented**: Clear requirements and acceptance criteria
- **Helpful for learning**: Expose contributors to different parts of the codebase

---

## Frontend Issues

### GFI-1: Improve Loading States
- **Labels**: `good-first-issue`, `frontend`, `enhancement`
- **Description**: Add skeleton loaders or spinners to the HistoryView while dreams are loading from Firestore
- **Location**: `src/components/HistoryView.tsx`
- **Difficulty**: Easy
- **Time**: ~1-2 hours
- **Acceptance Criteria**:
  - [ ] Show loading indicator when fetching dreams
  - [ ] Handle empty state (no dreams yet)
  - [ ] Handle error state (Firestore unavailable)
- **Related Files**: `src/hooks/useDreams.ts`, `src/types/index.ts`

### GFI-2: Add Keyboard Shortcuts
- **Labels**: `good-first-issue`, `frontend`, `enhancement`
- **Description**: Implement keyboard shortcuts for common actions (e.g., 'R' to start recording, 'Esc' to close modals)
- **Location**: `src/App.tsx`
- **Difficulty**: Easy
- **Time**: ~2-3 hours
- **Acceptance Criteria**:
  - [ ] Add keyboard event listeners
  - [ ] Show tooltip/hint for shortcuts
  - [ ] Respect focus states (don't trigger when typing in input)
- **Related Files**: `src/components/RecordView.tsx`, `src/components/DreamDetailModal.tsx`

### GFI-3: Dark/Light Theme Toggle
- **Labels**: `good-first-issue`, `frontend`, `enhancement`
- **Description**: Add a theme toggle in Settings to switch between dark and light mode
- **Location**: `src/components/SettingsView.tsx`
- **Difficulty**: Easy
- **Time**: ~3-4 hours
- **Acceptance Criteria**:
  - [ ] Add toggle in SettingsView
  - [ ] Persist preference in localStorage
  - [ ] Apply theme CSS variables
  - [ ] Respect system preference initially
- **Related Files**: `src/index.css`, `src/styles/theme.ts`

### GFI-4: Implement Search/Filter for Dreams
- **Labels**: `good-first-issue`, `frontend`, `enhancement`
- **Description**: Add search bar and filters (by date, tags) in HistoryView
- **Location**: `src/components/HistoryView.tsx`
- **Difficulty**: Medium
- **Time**: ~4-6 hours
- **Acceptance Criteria**:
  - [ ] Text search across dream content
  - [ ] Filter by date range
  - [ ] Filter by tags
  - [ ] Clear filters button
- **Related Files**: `src/lib/firestore.ts`, `src/types/index.ts`

---

## Documentation Issues

### GFI-5: Write User Guide for Getting Started
- **Labels**: `good-first-issue`, `documentation`
- **Description**: Create a comprehensive user guide in `docs/guides/getting-started.md`
- **Location**: `docs/guides/getting-started.md`
- **Difficulty**: Easy
- **Time**: ~2-3 hours
- **Acceptance Criteria**:
  - [ ] Installation instructions for Android/Web
  - [ ] Sign up/sign in flow
  - [ ] How to record a dream
  - [ ] How to view dream history
  - [ ] How to use the global map
  - [ ] FAQ section
- **Related Files**: `docs/ARCHITECTURE.md`, `docs/FEATURES.md`

### GFI-6: API Documentation for Developers
- **Labels**: `good-first-issue`, `documentation`, `backend`
- **Description**: Document all backend API endpoints in `docs/API.md`
- **Location**: `docs/API.md`
- **Difficulty**: Medium
- **Time**: ~3-4 hours
- **Acceptance Criteria**:
  - [ ] Document R2 presigned URL endpoint
  - [ ] Document payment endpoints (WeChat/Alipay)
  - [ ] Document callback endpoints
  - [ ] Add request/response examples
  - [ ] Document error codes
- **Related Files**: `server.ts`, `docs/API.md`

### GFI-7: Update Screenshots for Play Store
- **Labels**: `good-first-issue`, `documentation`
- **Description**: Capture and resize screenshots for Google Play Store listing
- **Location**: `store-assets/screenshots/`
- **Difficulty**: Easy
- **Time**: ~1-2 hours
- **Acceptance Criteria**:
  - [ ] Capture 5 screenshots of key flows
  - [ ] Resize to 1080x1920 (9:16) format
  - [ ] Add to store-assets/screenshots/
  - [ ] Update `docs/GOOGLE_PLAY_STORE_LISTING.md`
- **Related Files**: `docs/GOOGLE_PLAY_STORE.md`, `docs/SCREENSHOT_GUIDE.md`

---

## Testing Issues

### GFI-8: Add Unit Tests for AI Functions
- **Labels**: `good-first-issue`, `testing`, `backend`
- **Description**: Write unit tests for `src/lib/ai.ts` functions
- **Location**: `packages/common/src/ai/`
- **Difficulty**: Medium
- **Time**: ~4-6 hours
- **Acceptance Criteria**:
  - [ ] Test `transcribeAudio()` with mock API
  - [ ] Test `analyzeDream()` with mock API
  - [ ] Test error handling
  - [ ] Achieve >80% code coverage
- **Related Files**: `packages/common/src/ai/analyze.ts`, `packages/common/src/ai/transcribe.ts`

### GFI-9: Add Integration Tests for Firestore
- **Labels**: `good-first-issue`, `testing`, `frontend`
- **Description**: Write integration tests for Firestore operations
- **Location**: `packages/common/src/data/`
- **Difficulty**: Medium
- **Time**: ~4-6 hours
- **Acceptance Criteria**:
  - [ ] Test dream CRUD operations
  - [ ] Test user profile operations
  - [ ] Mock Firebase for tests
  - [ ] Test error handling
- **Related Files**: `packages/common/src/data/dream.ts`, `packages/common/src/data/user.ts`

---

## Performance Issues

### GFI-10: Optimize Bundle Size
- **Labels**: `good-first-issue`, `performance`
- **Description**: Analyze and reduce JavaScript bundle size
- **Location**: Project root
- **Difficulty**: Medium
- **Time**: ~4-6 hours
- **Acceptance Criteria**:
  - [ ] Run bundle analyzer
  - [ ] Identify large dependencies
  - [ ] Implement code splitting where appropriate
  - [ ] Target <500KB initial bundle size
- **Related Files**: `vite.config.ts`, `package.json`

### GFI-11: Lazy Load Global Map
- **Labels**: `good-first-issue`, `performance`, `frontend`
- **Description**: Implement lazy loading for the global map component (heavy D3.js library)
- **Location**: `src/components/GlobalView.tsx`
- **Difficulty**: Medium
- **Time**: ~3-4 hours
- **Acceptance Criteria**:
  - [ ] Load D3 only when GlobalView is accessed
  - [ ] Show loading state while D3 initializes
  - [ ] Measure performance improvement
- **Related Files**: `src/components/GlobalView.tsx`, `package.json`

---

## Accessibility Issues

### GFI-12: Improve Screen Reader Support
- **Labels**: `good-first-issue`, `accessibility`
- **Description**: Add ARIA labels and improve semantic HTML for screen readers
- **Location**: Various components
- **Difficulty**: Easy
- **Time**: ~3-4 hours
- **Acceptance Criteria**:
  - [ ] Add ARIA labels to buttons
  - [ ] Add alt text to images
  - [ ] Ensure keyboard navigation works
  - [ ] Test with screen reader
- **Related Files**: `src/components/*.tsx`

### GFI-13: Add Focus Management for Modals
- **Labels**: `good-first-issue`, `accessibility`, `frontend`
- **Description**: Implement proper focus trap and return for modals
- **Location**: `src/components/DreamDetailModal.tsx`, `src/components/DeleteConfirmModal.tsx`
- **Difficulty**: Easy
- **Time**: ~2-3 hours
- **Acceptance Criteria**:
  - [ ] Focus moves to modal on open
  - [ ] Focus trapped within modal
  - [ ] Focus returns to trigger on close
  - [ ] Escape key closes modal
- **Related Files**: `src/components/*.tsx`

---

## How to Contribute

1. **Pick an Issue**: Choose a Good First Issue that interests you
2. **Comment**: Comment on the issue to let others know you're working on it
3. **Fork & Branch**: Fork the repository and create a feature branch
4. **Code**: Implement the feature following the acceptance criteria
5. **Test**: Add tests if applicable
6. **Document**: Update docs if needed
7. **PR**: Open a Pull Request with a clear description

## Getting Help

- **Documentation**: Check `docs/` folder for project docs
- **Questions**: Open a discussion or ask in PR
- **Code Style**: Follow existing patterns in the codebase
- **Testing**: Run `npm test` before submitting PR

---

*This list is maintained by the maintainers. Issues are tagged with `good-first-issue` on GitHub.*
