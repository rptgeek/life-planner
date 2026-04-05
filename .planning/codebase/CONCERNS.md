# Codebase Concerns

**Analysis Date:** 2026-04-05

## Tech Debt

**Monolithic hook file:**
- Issue: `src/lib/hooks.ts` contains 351 lines with 11 separate custom hooks (useUser, useProfile, useCategories, useRoles, useGoals, useTasks, useReflection, useValues) all managing Supabase queries and state
- Files: `src/lib/hooks.ts`
- Impact: Large file is difficult to maintain, test, and refactor. Mixing concerns (auth, CRUD, state management) makes it hard to debug or reuse patterns
- Fix approach: Split into separate hook files organized by domain (useAuth.ts, useCRUD.ts, useTask.ts, etc.) or extract to a query/mutation layer above hooks

**Hardcoded production URLs:**
- Issue: Vercel deployment URL hardcoded in multiple places: `https://life-planner-five-pi.vercel.app` appears in source control
- Files: `src/lib/googleCalendar.ts:75`, `src/app/layout.tsx:16`, `src/app/sitemap.ts:6,12`, `src/app/robots.ts:10`
- Impact: Breaks in local development, testing environments, or future custom domain migrations. Blocker for multi-environment deployment
- Fix approach: Move to environment variable `NEXT_PUBLIC_APP_URL` and use consistently across codebase

**Full-page reload on task completion:**
- Issue: `src/app/dashboard/page.tsx:334` calls `window.location.reload()` after PlanMyDay modal closes
- Files: `src/app/dashboard/page.tsx`
- Impact: Full page reload destroys component state, flashes UI, poor UX. Network requests repeat unnecessarily
- Fix approach: Refetch tasks and related data via hook instead; use state invalidation pattern

**Google Calendar token in sessionStorage:**
- Issue: Google Calendar access token stored in `sessionStorage` with 3500-second expiry check in `src/lib/useGoogleCalendarToken.ts:74,84`
- Files: `src/lib/useGoogleCalendarToken.ts`, `src/lib/googleCalendar.ts:123-129`
- Impact: Token lost on page refresh (sessionStorage is not persisted). User must re-authenticate after browser refresh. No refresh token rotation
- Fix approach: Consider localStorage for non-sensitive metadata; implement refresh token flow if available through Google OAuth

**Large component files:**
- Issue: `src/components/PlanMyDay.tsx` (596 lines), `src/components/TaskCard.tsx` (383 lines), `src/components/pdf/FranklinPlannerPDF.tsx` (499 lines)
- Files: `src/components/PlanMyDay.tsx`, `src/components/TaskCard.tsx`, `src/components/pdf/FranklinPlannerPDF.tsx`
- Impact: Complex components are harder to test, debug, and maintain. Multiple responsibilities per file
- Fix approach: Break into smaller, focused sub-components (e.g., PlanMyDay steps as separate components, TaskCard details as expandable sections)

## Known Bugs

**Google Calendar sync race condition:**
- Symptoms: If user updates task time/duration rapidly, multiple concurrent sync requests to Google Calendar API may execute out of order
- Files: `src/components/TaskCard.tsx:274-300`
- Trigger: Click "Sync to Google Cal" multiple times in quick succession on same task
- Workaround: Wait for sync to complete before changing values again. Add disabled state during sync (partially implemented: line 294)

**Missing error handling in reorderTasks:**
- Symptoms: Task reorder silently fails if network error occurs; UI shows reordered state but database update fails
- Files: `src/lib/hooks.ts:260-267`
- Trigger: Drag/drop tasks while network is slow/offline
- Workaround: Refresh page to sync UI with database
- Fix approach: Add error handling and optimistic update rollback to reorderTasks

**Reflection data loss on date navigation:**
- Symptoms: If user types reflection text and immediately navigates to another date, unsaved changes are lost
- Files: `src/app/dashboard/page.tsx:299-323`
- Trigger: Type in reflection textareas, then click date navigation before blur event fires
- Workaround: Wait for input to blur or manually trigger save
- Fix approach: Add auto-save debounce or dirty-state warning on navigation

## Security Considerations

**Public anon key exposure (by design, acceptable):**
- Risk: `NEXT_PUBLIC_SUPABASE_ANON_KEY` visible in browser (this is Supabase's intended pattern with RLS)
- Files: `src/lib/supabase.ts:5-6`
- Current mitigation: Supabase Row-Level Security policies should restrict access. Not verified in this audit
- Recommendations: Ensure RLS policies exist on all tables (profiles, tasks, goals, etc.) to prevent cross-user access

**Google Client ID in environment:**
- Risk: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` visible in source (this is acceptable for OAuth public clients)
- Files: `src/lib/useGoogleCalendarToken.ts:7`
- Current mitigation: OAuth client ID is not a secret; Google scopes limit to calendar only
- Recommendations: Document that only `calendar` scope is requested; validate no broader scopes are added later

**OAuth redirect URL hardcoded:**
- Risk: `window.location.origin` in `src/app/login/page.tsx:19` is dynamic but redirectTo is hardcoded to `/auth/confirm`
- Files: `src/app/login/page.tsx:19`, `src/app/auth/callback/route.ts`
- Current mitigation: Callback route exists at `/auth/confirm`
- Recommendations: Verify Supabase OAuth app is configured with correct redirect URL

**Calendar event sync creates permanent record:**
- Risk: When task is synced to Google Calendar, `google_event_id` stored in tasks table. User cannot "unsync" without losing the ID relationship
- Files: `src/components/TaskCard.tsx:282-286`, `src/lib/googleCalendar.ts:81-92`
- Current mitigation: Delete button removes event AND clears ID (line 311)
- Recommendations: Add confirmation dialog before deleting Google Calendar events

## Performance Bottlenecks

**Inefficient re-render on date change:**
- Problem: Changing selected date triggers full refetch of all dependencies (tasks, reflection, goals, categories, roles, Google events)
- Files: `src/app/dashboard/page.tsx:18,20-26`
- Cause: Multiple useEffect hooks re-run due to `selectedDate` dependency
- Improvement path: Memoize hook results, consider SWR/React Query for caching across date navigation

**Google Calendar fetch on every modal open:**
- Problem: `useGoogleCalendar` hook refetches events every time component renders
- Files: `src/lib/useGoogleCalendar.ts:8-38`
- Cause: `refresh()` callback in dependency array triggers on every render
- Improvement path: Implement stale-while-revalidate pattern or add time-based cache

**No pagination on tasks list:**
- Problem: All tasks for a date loaded into memory and rendered at once (UI lists all 4 priority groups)
- Files: `src/app/dashboard/page.tsx:223-290`
- Cause: No limit on query results in `src/lib/hooks.ts:220`
- Improvement path: Add pagination, virtual scrolling, or lazy loading for large task lists

**Redundant API calls on PlanMyDay save:**
- Problem: `handleFinish()` in PlanMyDay inserts all tasks, then calls `window.location.reload()` which fetches everything again
- Files: `src/components/PlanMyDay.tsx:97-164`
- Cause: Uses reload instead of state update
- Improvement path: Use hook mutation and let React Query/state handle refresh

**Missing debounce on reflection saves:**
- Problem: Each keystroke in reflection textareas triggers an upsert to Supabase
- Files: `src/app/dashboard/page.tsx:299,308,318`
- Cause: `onChange` directly calls `saveReflection()`
- Improvement path: Add debounce (500ms) before saving reflection changes

## Fragile Areas

**TaskCard calendar sync logic:**
- Files: `src/components/TaskCard.tsx:242-333`
- Why fragile: Tightly coupled to Google Calendar state, error handling only shows toast message (line 327), multiple async operations without queue
- Safe modification: When adding new time/duration fields, test sync in isolation; consider extracting calendar sync to custom hook
- Test coverage: Calendar sync not covered by test files (no test files found in repo)

**PlanMyDay step validation:**
- Files: `src/components/PlanMyDay.tsx:182-185`
- Why fragile: `canProceed()` only checks step 4 and warns about pending quick task input, but doesn't validate intention, selected goals, or carry-forward selections. Allows advancing without meaningful content
- Safe modification: Add comprehensive step validation; consider adding required field indicators
- Test coverage: None (no test files found)

**Drag-drop priority change logic:**
- Files: `src/app/dashboard/page.tsx:71-102`
- Why fragile: Manual task array manipulation without atomic transaction. If reorder fails mid-flight, UI and database are out of sync
- Safe modification: Use optimistic updates with rollback; ensure all updates succeed before confirming UI state
- Test coverage: No drag-drop tests found

**Google Calendar token expiry calculation:**
- Files: `src/lib/useGoogleCalendarToken.ts:74,84`
- Why fragile: Hard-coded 3500-second expiry (58 min 20 sec). If Google OAuth response includes actual expiry, it's ignored. Time-based cache with no server validation
- Safe modification: Store and respect OAuth response's `expires_in` field; validate token with API before use
- Test coverage: Token handling has no tests

## Missing Critical Features

**No offline support:**
- Problem: All operations require network. No service worker caching or offline queue
- Blocks: Using app on flights, subway, areas without connectivity
- Improvement: Implement service worker with offline-first sync queue

**No data export/import:**
- Problem: User data locked in Supabase. Cannot backup or migrate to other tool
- Blocks: Data portability, disaster recovery, tool switching
- Improvement: Add JSON export and import endpoints

**No task templates or recurring tasks:**
- Problem: Must manually create similar tasks each day/week
- Blocks: Efficient planning for repetitive work
- Improvement: Add template system or simple recurrence rules

**No task time estimates or tracking:**
- Problem: Can set start time and duration but no tracking of actual time spent
- Blocks: Time analysis, productivity metrics
- Improvement: Add elapsed time tracking, actual vs. estimated comparison

## Test Coverage Gaps

**No automated tests found:**
- What's not tested: All business logic, hooks, components, integrations
- Files: Entire src/ directory (no `.test.ts`, `.spec.ts`, `__tests__/` found)
- Risk: Bug regressions undetected, refactoring breaks unknown
- Priority: High — at minimum, add tests for Supabase hooks (useTask, useTasks) and Google Calendar integration

**Calendar integration untested:**
- What's not tested: Token handling, API failures, event sync race conditions
- Files: `src/lib/googleCalendar.ts`, `src/lib/useGoogleCalendar.ts`, `src/lib/useGoogleCalendarToken.ts`
- Risk: Silent failures in calendar sync; token expiry handling may be broken
- Priority: High — add integration tests for Google APIs

**PDF generation untested:**
- What's not tested: PDF layout, multi-page rendering, task list truncation
- Files: `src/components/pdf/FranklinPlannerPDF.tsx`, `src/components/pdf/PDFDownloadButton.tsx`
- Risk: PDF corrupted or unreadable in production
- Priority: Medium — add snapshot tests for PDF generation

## Scaling Limits

**Supabase row counts:**
- Current capacity: No limits identified, but RLS policies not audited
- Limit: Database may not be optimized for large task counts (100k+ tasks per user)
- Scaling path: Add indexes on (user_id, scheduled_date), (user_id, status); partition old data

**Google Calendar API quota:**
- Current capacity: No quota management implemented
- Limit: Google Calendar API has quotas (1M requests/day per project); no caching of calendar events
- Scaling path: Implement server-side calendar sync and caching; use webhook subscriptions instead of polling

**Component render performance:**
- Current capacity: ~50 tasks per day renders smoothly
- Limit: Drag-drop library and nested renders will struggle with 200+ tasks
- Scaling path: Implement virtual scrolling, pagination, or task filtering

## Dependencies at Risk

**@react-pdf/renderer pinned at ^4.3.3:**
- Risk: No major version updates in package.json. PDF library may have security issues
- Impact: Security patches may be missed
- Migration plan: Monitor releases; update major version when stable

**@hello-pangea/dnd at ^18.0.1:**
- Risk: Drag-drop library is community-maintained fork of react-beautiful-dnd. May lag upstream or be abandoned
- Impact: Accessibility improvements, bug fixes delayed
- Migration plan: Monitor health; consider migrating to dnd-kit if fork stalls

**Next.js 16.2.2 (latest):**
- Risk: Very recent version; potential undiscovered bugs in new framework
- Impact: Edge case bugs may appear in production
- Migration plan: Monitor bug reports; stay on LTS when available; test thoroughly before upgrading

**React 19.2.4:**
- Risk: React 19 is very new; third-party libraries may not be fully compatible
- Impact: Subtle bugs in library interactions
- Migration plan: Verify all dependencies support React 19; test drag-drop and PDF rendering extensively

---

*Concerns audit: 2026-04-05*
