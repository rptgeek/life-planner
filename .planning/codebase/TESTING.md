# Testing Patterns

**Analysis Date:** 2026-04-05

## Test Framework

**Status:** No testing framework currently in use

**Important Note:** This codebase has zero test files. No Jest, Vitest, Playwright, or other testing frameworks are installed or configured. All validation is manual or implicit through development.

**Key Dependencies for Testing (if added):**
```json
// Current devDependencies in package.json do NOT include:
// - jest / vitest
// - @testing-library/react
// - @types/jest
// - playwright / cypress
// - supertest (for API routes)
```

## Current Code Quality Assurance

**What IS in place:**
- TypeScript strict mode (`tsconfig.json`)
- ESLint with Next.js config (`eslint.config.mjs`)
- Type-safe hook architecture
- Supabase query typing

**What IS NOT in place:**
- Unit tests
- Integration tests
- E2E tests
- Test fixtures or factories
- Mocking frameworks

## If Tests Were to Be Added

### Test File Organization

**Recommended Location Pattern:**
- Co-located with source (not in separate `__tests__` directory)
- Naming: `ComponentName.test.tsx` or `utility.test.ts`
- Example paths (if they existed):
  - `src/components/TaskCard.test.tsx`
  - `src/components/TaskForm.test.tsx`
  - `src/lib/categorize.test.ts`
  - `src/lib/googleCalendar.test.ts`
  - `src/app/dashboard/page.test.tsx`

**Recommended Structure:**
```
src/
├── components/
│   ├── TaskCard.tsx
│   ├── TaskCard.test.tsx
│   ├── TaskForm.tsx
│   └── TaskForm.test.tsx
├── lib/
│   ├── categorize.ts
│   ├── categorize.test.ts
│   ├── googleCalendar.ts
│   └── googleCalendar.test.ts
└── app/
    └── dashboard/
        ├── page.tsx
        └── page.test.tsx
```

## High-Priority Testing Areas

### Components That Need Tests

**1. `TaskCard.tsx` (383 lines)**
- Multiple state mutations (title editing, toggling completion states, calendar sync)
- Complex conditional rendering (3-state toggle: empty → in-progress → completed)
- Calendar integration (sync/delete/update events)
- Error handling for token expiry
- Should test:
  - State transitions (completed → in-progress → incomplete)
  - Title editing (double-click, keyboard handlers)
  - Calendar sync (success, token expired, network error)
  - Drag handle props passing

**2. `PlanMyDay.tsx` (596 lines)**
- 5-step wizard with state accumulation
- Task creation across multiple goals
- Carry-forward logic for incomplete tasks
- Should test:
  - Step progression
  - Task accumulation and form validation
  - Goal task creation with proper priorities
  - Final submission and data persistence

**3. `TaskForm.tsx` (219 lines)**
- Auto-categorization on typing
- Form validation and submission
- Clearing form state after submit
- Should test:
  - Auto-categorization suggestions
  - Form submission with required/optional fields
  - Quick-add vs expanded mode
  - Form reset after successful submission

**4. `OnboardingWizard.tsx` (387 lines)**
- Multi-step form creation (mission, values, categories, roles, goals)
- Data persistence to Supabase
- Should test:
  - Step transitions
  - Form data validation
  - Database writes
  - Completion callback

### Hooks That Need Tests

**1. `useUser()` / `useProfile()`** (Location: `src/lib/hooks.ts`)
- Auth state subscription
- Profile fetching and updates
- Should test:
  - Initial auth check
  - Auth state changes
  - Profile fetch and update mutations

**2. `useTasks(dateFilter?)` / `useCategories()` / `useGoals()` / `useRoles()`**
- Data fetching from Supabase
- CRUD operations (add, update, delete)
- Reordering (for tasks)
- Should test:
  - Initial fetch
  - Add operations
  - Update operations
  - Delete operations
  - Filter application (for tasks by date)
  - Optimistic UI updates

**3. `useReflection(date)`**
- Upsert pattern (create or update)
- Should test:
  - Fetch reflection for date
  - Create new reflection
  - Update existing reflection

### Utilities That Need Tests

**1. `categorize.ts`**
- Keyword-based categorization logic
- Should test:
  - Keyword matching (case-insensitive)
  - Keyword length scoring
  - Category fallback behavior
  - Edge cases (empty text, no matches, multiple categories)

**2. `googleCalendar.ts`**
- Google Calendar API integration
- Event creation, update, deletion
- Token handling and expiry detection
- Should test:
  - Event creation with correct datetime format
  - Event updates
  - Event deletion (including 410 already-deleted case)
  - Token expiry error (`GoogleTokenExpiredError`)
  - Network failures

## Recommended Testing Stack (if to be implemented)

**For Unit & Component Tests:**
- Framework: Vitest (Next.js 16 compatible, faster than Jest)
- Component testing: @testing-library/react (standard React testing)
- Setup: `vitest.config.ts` at project root

**For API Route Tests:**
- supertest for testing API endpoints
- Example: `src/app/api/*/route.test.ts`

**For E2E Tests:**
- Playwright or Cypress
- Test user flows: login → onboarding → task creation → calendar sync

**Example Vitest Config (if added):**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## What Would Be Mocked

**Supabase Client:**
```typescript
// Mock pattern in tests
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      onAuthStateChange: vi.fn(),
    },
  })),
}))
```

**Google Calendar API:**
```typescript
// Mock Google Calendar fetch in googleCalendar.test.ts
vi.mock('fetch', () => ({
  default: vi.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ items: mockCalendarEvents }),
  })),
}))
```

**Date Functions:**
```typescript
// Use real date-fns but mock systemTime if needed
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-05'))
})

afterEach(() => {
  vi.useRealTimers()
})
```

## Current Testing Gaps

**No automated validation for:**
- Task completion state machine (3 states: empty → in-progress → completed)
- Drag-drop reordering logic and sort_order persistence
- Calendar sync bidirectional updates
- Token expiry handling (network reconnection)
- Multi-step form completion flows
- Concurrent state mutations (race conditions)
- Permission/authorization (user_id filtering)

**Risk Areas:**
1. Data corruption from concurrent updates (multiple users, multiple tabs)
2. Calendar out-of-sync (partial sync failures not caught)
3. Form state leaks (clearing between submissions)
4. Drag-drop sort order becoming inconsistent

## Manual Testing Checklist (Current Approach)

**Since no automated tests exist, consider these manual test scenarios:**

**Task Management:**
- [ ] Create task, mark in-progress, mark complete, mark incomplete
- [ ] Drag task between A/B/C/D priorities
- [ ] Verify sort_order updates on drag
- [ ] Delete task
- [ ] Edit task title (double-click)
- [ ] Verify task carries forward to next day correctly

**Calendar Sync:**
- [ ] Create task with time slot
- [ ] Sync to Google Calendar (button click)
- [ ] Verify event appears in Google Calendar
- [ ] Update task time/duration
- [ ] Verify Google Calendar event updates
- [ ] Delete synced task
- [ ] Verify event removed from calendar

**Categorization:**
- [ ] Create task with keyword matching category name
- [ ] Verify auto-categorization suggestion
- [ ] Create task without matching keywords
- [ ] Verify defaults to first category or none

**Onboarding:**
- [ ] Clear localStorage, start fresh
- [ ] Step through all 5 steps
- [ ] Verify all created entities in database

---

*Testing analysis: 2026-04-05*
