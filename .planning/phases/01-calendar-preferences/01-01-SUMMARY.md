---
phase: 01-calendar-preferences
plan: 01
subsystem: database
tags: [supabase, google-calendar, typescript, react-hook]

requires: []
provides:
  - Supabase migration SQL adding selected_calendar_ids and default_push_calendar_id to profiles
  - Profile TypeScript interface extended with both calendar preference fields
  - CalendarListEntry type and listCalendars() function in googleCalendar.ts
  - useCalendarPreferences hook for reading and writing calendar preferences via useProfile
affects:
  - 01-02 (UI layer uses useCalendarPreferences and listCalendars)
  - Phase 2 (calendar view rendering reads selectedIds)
  - Phase 3 (task sync routing reads defaultPushId)

tech-stack:
  added: []
  patterns:
    - "Hook composition: useCalendarPreferences wraps useProfile, no direct Supabase calls"
    - "gcalFetch wrapper pattern extended for new endpoint (calendarList)"

key-files:
  created:
    - supabase/add_calendar_preferences.sql
    - src/lib/useCalendarPreferences.ts
  modified:
    - src/lib/types.ts
    - src/lib/googleCalendar.ts

key-decisions:
  - "useCalendarPreferences delegates persistence to useProfile (Partial<Profile> update) to avoid duplicate Supabase logic"
  - "listCalendars returns empty array on non-OK response rather than throwing, consistent with fetchCalendarEvents pattern"

patterns-established:
  - "Calendar preferences stored as Profile columns, not a separate table"
  - "hasConfigured = selected_calendar_ids !== null (null means never configured, [] means configured but empty)"

requirements-completed:
  - CAL-02

duration: 8min
completed: 2026-04-05
---

# Phase 1 Plan 01: Calendar Preferences Data Layer Summary

**Supabase migration, Profile type extension, listCalendars() Google API wrapper, and useCalendarPreferences hook — full data layer for calendar preference persistence**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-05T21:45:00Z
- **Completed:** 2026-04-05T21:53:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Migration SQL ready to run: adds `selected_calendar_ids text[]` and `default_push_calendar_id text` to `public.profiles`
- Profile interface in types.ts updated so TypeScript enforces correct field usage throughout the app
- `listCalendars(token)` fetches up to 250 calendars from Google API with typed `CalendarListEntry` return
- `useCalendarPreferences` hook exposes `selectedIds`, `defaultPushId`, `hasConfigured`, and `savePreferences` — wired to `useProfile` with no duplicate Supabase logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration SQL + Profile type update** - `d0d5da7` (feat)
2. **Task 2: listCalendars API wrapper + useCalendarPreferences hook** - `831cb6a` (feat)

## Files Created/Modified
- `supabase/add_calendar_preferences.sql` - ALTER TABLE migration adding two columns to profiles
- `src/lib/types.ts` - Profile interface extended with selected_calendar_ids and default_push_calendar_id
- `src/lib/googleCalendar.ts` - CalendarListEntry interface and listCalendars() function added before fetchCalendarEvents
- `src/lib/useCalendarPreferences.ts` - New hook wrapping useProfile for calendar preference reads and writes

## Decisions Made
- useCalendarPreferences delegates to useProfile.updateProfile (Partial<Profile>) rather than calling Supabase directly — keeps single source of truth for profile state
- `null` vs `[]` distinction for `selected_calendar_ids`: null means the user has never configured preferences, empty array means they explicitly cleared them. `hasConfigured` exposes this to callers.

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
**Manual SQL execution required.** Run `supabase/add_calendar_preferences.sql` against your Supabase project to add the two columns before the UI layer (plan 01-02) can persist preferences.

## Next Phase Readiness
- All data contracts established; plan 01-02 (UI layer) can import `useCalendarPreferences` and `listCalendars` immediately
- SQL migration must be applied before end-to-end testing

---
*Phase: 01-calendar-preferences*
*Completed: 2026-04-05*

## Self-Check: PASSED
