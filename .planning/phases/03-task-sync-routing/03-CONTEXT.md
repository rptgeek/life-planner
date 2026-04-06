# Phase 3: Task Sync Routing - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous)

<domain>
## Phase Boundary

Task create, update, and delete operations target the user's configured default Google Calendar (`default_push_calendar_id` from profile) instead of the hardcoded `primary` calendar. The sync trigger remains manual (existing "Sync to Google Cal" button in TaskCard).

</domain>

<decisions>
## Implementation Decisions

### Routing Logic
- **D-01:** Add optional `calendarId` parameter (default `'primary'`) to `createCalendarEvent`, `updateCalendarEvent`, and `deleteCalendarEvent` in `src/lib/googleCalendar.ts`
- **D-02:** When `default_push_calendar_id` is null (not configured), fall back to `'primary'` — backward-compatible behavior
- **D-03:** Read `defaultPushId` via `useCalendarPreferences()` directly inside `TaskCard` — do not prop-drill from parent
- **D-04:** When updating an existing event (`google_event_id` is set), update it in whichever calendar already has it — do NOT move events when user changes their default push calendar

### Sync Trigger
- **D-05:** Keep the existing manual "Sync to Google Cal" button in `TaskCard` — no auto-sync behavior
- **D-06:** Fix calendarId routing for all three operations: create, update (`SYNC-02`), and delete (`SYNC-03`)

### Claude's Discretion
- Exact TypeScript signature for calendarId parameter
- Whether to store the `calendarId` used at sync time (for future routing of updates) — this is a nice-to-have
- Error message wording if sync fails

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/useCalendarPreferences.ts` — `useCalendarPreferences()` already returns `defaultPushId: string | null`
- `src/lib/googleCalendar.ts` — `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` (all 3 need calendarId param)
- `src/components/TaskCard.tsx` — already calls all 3 functions; needs to import `useCalendarPreferences` and pass calendarId

### Established Patterns
- `getGoogleToken()` called in TaskCard sync handlers — calendarId follows the same pattern (local read, passed to function)
- All 3 API functions use `gcalFetch` with `/calendars/${calEnc}/events` pattern — just parameterize the `primary` literal

### Integration Points
- `src/components/TaskCard.tsx` lines ~266-315 — the sync button handlers
- `src/lib/googleCalendar.ts` lines 99-137 — the 3 functions to update
- No schema changes needed — `default_push_calendar_id` already in `Profile` type and DB

</code_context>

<specifics>
## Specific Ideas

- The fix is surgical: 3 function signatures + 1 hook call in TaskCard
- Update function path: `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}` — same pattern as fetchCalendarEvents already uses

</specifics>

<deferred>
## Deferred Ideas

- Storing which calendarId was used at sync time (for accurate routing of future updates when default changes) — not in scope
- Auto-sync on task save — user explicitly chose manual sync

</deferred>

---

*Phase: 03-task-sync-routing*
*Context gathered: 2026-04-06*
