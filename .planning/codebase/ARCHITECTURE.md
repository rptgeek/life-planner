# Architecture

**Analysis Date:** 2026-04-05

## Pattern Overview

**Overall:** Client-side Next.js app with server-side API layer, using Supabase for authentication and data persistence.

**Key Characteristics:**
- Next.js 16 with App Router (file-based routing)
- Implicit OAuth flow for authentication (Google via Supabase)
- React hooks-based data fetching with client-side caching via component state
- Real-time synchronization with Supabase for multi-device consistency
- Productivity pyramid conceptual architecture: Mission → Values → Long-term Goals → Short-term Goals → Daily Tasks

## Layers

**Presentation Layer:**
- Purpose: UI components rendered to browser, interactive user interactions
- Location: `src/components/` and `src/app/`
- Contains: Page components (`page.tsx`), layout wrappers, UI components (Sidebar, TaskCard, DailyTimeLog, etc.)
- Depends on: Hooks, types, Supabase client
- Used by: Browser/user interaction

**State & Data Fetching Layer:**
- Purpose: Manage application state and synchronize data with backend
- Location: `src/lib/hooks.ts`
- Contains: Custom hooks (useUser, useProfile, useCategories, useRoles, useGoals, useTasks, useReflection, useValues)
- Depends on: Supabase client, types
- Used by: All presentation components requiring data

**Integration Layer:**
- Purpose: External API communication (Google Calendar, Supabase)
- Location: `src/lib/supabase.ts`, `src/lib/googleCalendar.ts`, `src/lib/useGoogleCalendar.ts`, `src/lib/useGoogleCalendarToken.ts`
- Contains: Client initialization, API wrappers, token management
- Depends on: External SDKs (@supabase/ssr, @supabase/supabase-js, Google Identity Services)
- Used by: Hooks and components requiring external data

**Type Layer:**
- Purpose: Shared TypeScript interfaces defining data models
- Location: `src/lib/types.ts`
- Contains: Profile, Category, Role, Value, Goal, Task, CalendarEvent, DailyReflection
- Depends on: Nothing
- Used by: All layers for type safety

**Routing & Server:**
- Purpose: Next.js routes and server-side handlers
- Location: `src/app/` with special routes in `src/app/auth/callback/route.ts`
- Contains: Page routes, layouts, API routes, metadata
- Depends on: Components, hooks, types
- Used by: Browser navigation and OAuth callbacks

## Data Flow

**Authentication Flow:**

1. User visits `/login` → `LoginPage` component renders Google sign-in button
2. Click triggers `supabase.auth.signInWithOAuth()` with `provider: 'google'` and redirect to `/auth/confirm`
3. OAuth callback redirected to `/auth/callback` → legacy route handler redirects to `/auth/confirm?code=...`
4. Supabase handles token exchange internally (implicit flow: no verifier needed)
5. `useUser()` hook detects session change via `supabase.auth.onAuthStateChange()`
6. User redirected to `/dashboard` by layout guard in `src/app/dashboard/layout.tsx`
7. Dashboard layout fetches user profile and checks onboarding status

**Task Management Data Flow:**

1. Dashboard page (`src/app/dashboard/page.tsx`) renders with `useTasks(selectedDate)` hook
2. Hook fetches tasks filtered by `scheduled_date` from `tasks` table (joined with categories, goals, roles)
3. Tasks grouped by priority (A/B/C/D) in memory using `useMemo`
4. User drags task between priority groups → `onDragEnd` handler reorders and updates sort_order
5. `reorderTasks()` batches all updates to Supabase
6. Component re-renders with new task list from hook state

**Goal Hierarchy Data Flow:**

1. Goals page (`src/app/goals/page.tsx`) uses `useGoals()` hook
2. Hook queries `goals` table and joins with categories and roles
3. Goals filtered by `goal_type` ('long_term' or 'short_term') and `status` ('active', 'completed', 'archived')
4. Children found by querying goals with matching `parent_goal_id`
5. User creates/edits/deletes goals → hook updates local state and persists to Supabase

**Google Calendar Integration:**

1. Dashboard calls `useGoogleCalendar(selectedDate)` hook
2. Hook checks for stored calendar token in localStorage
3. If missing/expired, displays reconnect button → `requestCalendarToken()` launches Google Identity Services popup
4. User authorizes → token stored and calendar events fetched via `fetchCalendarEvents()`
5. Events displayed in `DailyTimeLog` component, merged with scheduled tasks
6. Tasks with `start_time` and `duration_minutes` can be synced to calendar as `google_event_id`

**State Management:**

- Component state (useState) for UI-only state: form inputs, modal visibility, expanded sections, selected date
- Hook state for data: caches fetched entities and updates via Supabase mutations
- No global state manager; each hook manages its own entity (Profile, Tasks, Goals, etc.)
- Real-time listening via `supabase.auth.onAuthStateChange()` for auth state only

## Key Abstractions

**Hook Pattern:**

- Purpose: Encapsulate Supabase CRUD operations and provide React component interface
- Examples: `useUser()`, `useTasks()`, `useGoals()`, `useProfile()`
- Pattern: Each hook manages fetch, add, update, delete for one entity. Returns { data, loading/refetch, mutations }

**DragDropContext (Priority System):**

- Purpose: Allow users to reorder tasks by dragging between priority buckets (A/B/C/D)
- Examples: `src/app/dashboard/page.tsx` line 224-290
- Pattern: Wraps four Droppable zones (one per priority), tasks are Draggable items. onDragEnd updates sort_order and priority

**Page Layouts:**

- Purpose: Provide consistent shell with Sidebar, auth guard, onboarding check
- Examples: `src/app/dashboard/layout.tsx`, `src/app/layout.tsx`
- Pattern: Layout component wraps children, checks `useUser()` and `useProfile()`, renders Sidebar if authenticated

**Modal/Wizard Pattern:**

- Purpose: Multi-step guided workflows
- Examples: `PlanMyDay` component, `OnboardingWizard`
- Pattern: Parent component manages step state, renders different UI per step, validates before advancing

## Entry Points

**Root Entry Point:**

- Location: `src/app/layout.tsx`
- Triggers: Browser navigation to any route
- Responsibilities: Set metadata, global styles (globals.css), font loading, viewport config

**Authentication Entry Point:**

- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated users navigate to protected routes (redirected by layout)
- Responsibilities: Render Google sign-in UI, handle OAuth redirect

**Dashboard Entry Point:**

- Location: `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx`
- Triggers: Authenticated users navigate to `/dashboard`
- Responsibilities: Check onboarding, render Sidebar + main content, guard against unauthenticated access

**Landing Page Entry Point:**

- Location: `src/app/page.tsx`
- Triggers: Users navigate to `/` (unauthenticated)
- Responsibilities: Market the app with features, CTA buttons to sign up

**Page Routes (all protected by dashboard layout):**

- `/goals` - Goal management
- `/weekly` - Weekly calendar view
- `/mission` - Mission statement and values management
- `/settings` - User account settings (if implemented)

## Error Handling

**Strategy:** Try-catch in hooks and async handlers, with fallback UI states

**Patterns:**

- Supabase errors in hooks catch and log to console, component continues with null/empty state
- `GoogleTokenExpiredError` caught in `useGoogleCalendar` hook, sets `tokenExpired` flag for UI
- Network errors result in missing data rather than hard crashes (graceful degradation)
- Async mutations (add/update/delete) in hooks don't validate; assume Supabase validation succeeds

## Cross-Cutting Concerns

**Logging:** Console.log only; no centralized logger

**Validation:**
- Client-side: Basic form validation (empty checks) in submission handlers
- Server-side: Supabase database constraints and Row-Level Security (RLS) policies

**Authentication:**
- Implicit OAuth flow via Supabase (no refresh tokens)
- Session stored in browser by Supabase SDK
- Guard at layout level (`useUser()` hook checks `supabase.auth.getUser()`)

**Date Handling:**
- All dates stored as 'yyyy-MM-dd' strings in database
- date-fns library used for formatting and arithmetic
- Times stored as 'HH:MM:SS' strings for task scheduling

---

*Architecture analysis: 2026-04-05*
