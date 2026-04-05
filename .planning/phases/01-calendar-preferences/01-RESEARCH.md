# Phase 1: Calendar Preferences - Research

**Researched:** 2026-04-05
**Domain:** Google Calendar API / Supabase persistence / React settings UI
**Confidence:** HIGH

## Summary

Phase 1 requires three coordinated pieces: (1) fetch the user's full calendar list from Google after they connect, (2) render a picker UI where they toggle display and choose a push target, and (3) persist those choices in Supabase so they survive reload and re-login.

The Google Calendar calendarList API (`GET /users/me/calendarList`) is the right endpoint and is already covered by the existing `https://www.googleapis.com/auth/calendar` scope — no scope change is needed. The token flow (GIS popup, sessionStorage) is already working and does not need to change for this phase. Calendar preferences should be stored as two new columns on the existing `profiles` table (`selected_calendar_ids text[]`, `default_push_calendar_id text`) — this matches the project's established pattern of augmenting `profiles` with user-preference columns rather than creating new tables, and avoids a join at read time.

The Settings page (`src/app/settings/page.tsx`) is the correct home for the persistent "manage calendar display" section (CAL-03). A post-connect picker (CAL-01) needs to be wired into the existing `handleReconnectCalendar` function in `src/app/dashboard/page.tsx`, which is the only place in the app that calls `requestCalendarToken()`. The picker can be rendered as an inline section in `DailyTimeLog` (shown once after successful token acquisition) or as a modal — the Settings page section plus a "first-time" prompt are the two surfaces needed.

**Primary recommendation:** Add `selected_calendar_ids` and `default_push_calendar_id` columns to `profiles`, add `listCalendars()` to `googleCalendar.ts`, create a `useCalendarPreferences` hook, add a CalendarSettings panel to `src/app/settings/page.tsx`, and show a setup prompt in `DailyTimeLog` when connected but no preferences are saved.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAL-01 | After connecting Google Calendar (OAuth), user is shown a multi-select list of their Google Calendars and can choose which ones to display | `listCalendars()` wraps `GET /users/me/calendarList`; `items[].id` and `items[].summary` are the relevant fields; render after `requestCalendarToken()` resolves |
| CAL-02 | Calendar display selection is persisted (survives page reload / re-login) | Store `selected_calendar_ids text[]` on `profiles` row; `useCalendarPreferences` hook reads/writes via `useProfile` pattern |
| CAL-03 | User can edit calendar display selection from a settings area | Add a "Google Calendar" section to `src/app/settings/page.tsx` using the same card pattern already used for Categories and Roles |
| CAL-04 | User can designate one Google Calendar as the default push target for new tasks | Store `default_push_calendar_id text` on `profiles` row; render as radio buttons alongside the display multi-select |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Google Calendar REST API v3 | — | calendarList.list, events | Already in use; no new library needed |
| @supabase/supabase-js | 2.101.1 | Persist preferences to profiles | Already installed |
| React (useState, useCallback, useEffect) | 19.2.4 | Hook and component state | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS 4.x | Already installed | Style picker UI | All new UI |
| Lucide React | 1.7.0 | Icons (CalendarDays, Check, Star) | Already used in Sidebar and DailyTimeLog |

**No new npm packages required for this phase.**

---

## Architecture Patterns

### Recommended Project Structure
No new directories needed. New files slot into existing locations:

```
src/
├── lib/
│   ├── googleCalendar.ts          # ADD: listCalendars() function
│   └── useCalendarPreferences.ts  # NEW hook (mirrors useProfile pattern)
├── components/
│   └── CalendarPreferencesPanel.tsx  # NEW component (reusable in Settings + post-connect)
└── app/settings/
    └── page.tsx                   # EDIT: add Google Calendar section
```

### Pattern 1: listCalendars() API Wrapper
**What:** Thin wrapper around `GET /users/me/calendarList` that returns a typed array, following the existing `gcalFetch` pattern in `googleCalendar.ts`.
**When to use:** Called once after token acquisition to populate the picker.
**Example:**
```typescript
// Add to src/lib/googleCalendar.ts
export interface CalendarListEntry {
  id: string
  summary: string
  backgroundColor?: string
  foregroundColor?: string
  primary?: boolean
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner'
}

export async function listCalendars(token: string): Promise<CalendarListEntry[]> {
  const res = await gcalFetch(token, '/users/me/calendarList?maxResults=250')
  if (!res.ok) return []
  const json = await res.json()
  return (json.items ?? []) as CalendarListEntry[]
}
```

### Pattern 2: useCalendarPreferences Hook
**What:** Reads and writes `selected_calendar_ids` and `default_push_calendar_id` from the `profiles` row. Follows the exact pattern of `useProfile` in `hooks.ts` — fetch on mount, expose `updateProfile` for mutations.
**When to use:** Consumed by `CalendarPreferencesPanel` and by the post-connect flow in dashboard.
**Example:**
```typescript
// src/lib/useCalendarPreferences.ts
'use client'
import { useProfile } from './hooks'

export function useCalendarPreferences() {
  const { profile, updateProfile } = useProfile()

  const selectedIds: string[] = profile?.selected_calendar_ids ?? []
  const defaultPushId: string | null = profile?.default_push_calendar_id ?? null

  const savePreferences = async (ids: string[], pushId: string | null) => {
    await updateProfile({
      selected_calendar_ids: ids,
      default_push_calendar_id: pushId,
    })
  }

  return { selectedIds, defaultPushId, savePreferences }
}
```

### Pattern 3: Supabase Migration (ALTER TABLE)
**What:** Two new nullable columns on `profiles`, no data migration needed (nulls are safe defaults).
**When to use:** This project uses standalone `.sql` files in `supabase/` (see `add_roles.sql`). Follow the same convention — do NOT modify `schema.sql` (it's a reference snapshot). Create a new migration file.
**Example:**
```sql
-- supabase/add_calendar_preferences.sql
alter table public.profiles
  add column if not exists selected_calendar_ids text[] default null,
  add column if not exists default_push_calendar_id text default null;
```
Apply manually in Supabase SQL editor (no CLI migration tooling is configured in this project).

### Pattern 4: CalendarPreferencesPanel Component
**What:** Client component that lists calendars fetched from Google, renders checkboxes for display selection, and radio buttons for the default push target. Calls `savePreferences` on submit.
**When to use:** Embedded in Settings page as a card section. Also referenced from a post-connect prompt in DailyTimeLog.
**Structure:**
- Accepts `token: string`, reads `useCalendarPreferences()` internally
- Fetches `listCalendars(token)` on mount
- Shows loading spinner while fetching
- Checkbox per calendar for `selected_calendar_ids`
- Radio per calendar for `default_push_calendar_id` (only writable calendars: `accessRole` = `writer` or `owner`)
- Save button calls `savePreferences`

### Pattern 5: Post-Connect Picker Prompt
**What:** After `handleReconnectCalendar()` resolves in `dashboard/page.tsx`, check if `selectedIds.length === 0`. If so, show an inline banner in `DailyTimeLog` directing the user to Settings to configure calendars. This satisfies CAL-01 without adding a modal to dashboard.

**Alternative considered:** Open an inline picker inside DailyTimeLog itself on first connect. This is also valid — it avoids a navigation step. Decision is at planner's discretion. The Settings-redirect approach is simpler to implement.

### Anti-Patterns to Avoid
- **Storing preferences in sessionStorage:** The whole point of this phase is Supabase persistence. sessionStorage is for the Google token only.
- **Adding calendar_preferences as a separate table:** One user = one preferences row. `profiles` already has this relationship. A new table adds a join with no benefit at this scale.
- **Fetching calendarList on every DailyTimeLog render:** Fetch once after connect; cache in component state or hook state. The list rarely changes.
- **Modifying schema.sql:** This file is a reference snapshot of the original schema. Incremental changes use separate `.sql` migration files (`add_roles.sql` is the pattern to follow).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supabase CRUD for preferences | Custom fetch/update logic | Extend `useProfile` via `useCalendarPreferences` | `useProfile.updateProfile` already handles optimistic local state and Supabase PATCH |
| Google token for settings page | Duplicate GIS initialization | `getCachedCalendarToken()` from `useGoogleCalendarToken.ts` | Token already in sessionStorage if user is connected; if expired, direct to dashboard to reconnect |
| Calendar color rendering | Parse backgroundColor hex manually | Use `backgroundColor` field from calendarList response directly | API returns ready-to-use hex strings |

---

## Common Pitfalls

### Pitfall 1: Token Not Available in Settings Page
**What goes wrong:** Settings page (`/settings`) calls `listCalendars()` but `getCachedCalendarToken()` returns null because the GIS token lives only in sessionStorage from the dashboard page.
**Why it happens:** GIS token is acquired in `dashboard/page.tsx` only. User navigates to Settings — token is present in sessionStorage if still valid, but if session expired or user navigated directly to settings after a reload, it will be null.
**How to avoid:** In `CalendarPreferencesPanel`, check `getCachedCalendarToken()` first. If null, show "Connect Google Calendar first" state with a link to dashboard, OR add `preloadGIS()` to the settings page and a connect button. The simplest approach: show current saved preferences from Supabase regardless; only offer "Refresh calendar list" if token is available.
**Warning signs:** Empty calendar list in Settings even when user is connected.

### Pitfall 2: Profile TypeScript Interface Not Updated
**What goes wrong:** After adding columns to Supabase, `updateProfile` calls with the new fields get TypeScript errors because `Profile` in `src/lib/types.ts` doesn't include them.
**Why it happens:** `Profile` interface is manually maintained — there's no auto-generated types from Supabase schema.
**How to avoid:** Update `Profile` in `types.ts` before writing any hook code:
```typescript
export interface Profile {
  // ... existing fields ...
  selected_calendar_ids: string[] | null
  default_push_calendar_id: string | null
}
```

### Pitfall 3: Primary Calendar Not in the List by Default
**What goes wrong:** User connects, selects no calendars, navigates away. The app shows no events because `selected_calendar_ids` is an empty array.
**Why it happens:** Empty array is falsy-adjacent but valid — a user could legitimately select zero.
**How to avoid:** On first save, if no calendars are selected, default-select the primary calendar (where `items[].primary === true`). Alternatively, treat `null` (never configured) and `[]` (explicitly none) differently — show a warning if `[]` but `null` triggers the setup prompt.

### Pitfall 4: accessRole Filter for Push Target
**What goes wrong:** User selects a read-only calendar (e.g., a shared holidays calendar with `accessRole: 'reader'`) as the default push target. Push attempts in Phase 3 will fail with 403.
**Why it happens:** calendarList returns all calendars including read-only ones.
**How to avoid:** In `CalendarPreferencesPanel`, only render the radio button for push target on calendars where `accessRole` is `writer` or `owner`. Show read-only calendars for display selection only.

### Pitfall 5: Migration Applied But Supabase Client Has Stale Schema
**What goes wrong:** ALTER TABLE succeeds, but queries return columns as undefined, or `updateProfile` silently drops the new fields.
**Why it happens:** Supabase JS client uses runtime field names from query results — it doesn't cache schema. No issue there. The problem would be if the `select('*')` in `fetchProfile` doesn't return the new columns after the migration.
**How to avoid:** After running the SQL migration, test that `select('*')` on `profiles` includes the new columns. In practice, Supabase's `select('*')` always reflects live schema.

---

## Code Examples

### Fetch Calendar List
```typescript
// Source: Google Calendar API v3 reference + gcalFetch pattern from googleCalendar.ts
export async function listCalendars(token: string): Promise<CalendarListEntry[]> {
  const res = await gcalFetch(token, '/users/me/calendarList?maxResults=250')
  if (!res.ok) return []
  const json = await res.json()
  return (json.items ?? []) as CalendarListEntry[]
}
```

### Persist Preferences via updateProfile
```typescript
// Follows useProfile pattern in hooks.ts
await updateProfile({
  selected_calendar_ids: selectedIds,   // string[]
  default_push_calendar_id: pushId,     // string | null
})
```

### Check if Preferences Are Configured
```typescript
// In useCalendarPreferences or consuming component
const hasConfigured = profile?.selected_calendar_ids !== null
const hasSelection = (profile?.selected_calendar_ids ?? []).length > 0
```

---

## Environment Availability

Step 2.6: SKIPPED — this phase adds columns to an existing Supabase database (already connected and verified working) and calls Google Calendar API endpoints already in use. No new external dependencies are introduced.

---

## Validation Architecture

No test framework is configured in this project (confirmed: no test files, no jest/vitest config). Per project state, this phase will not add an automated test suite. Validation is manual.

**Manual verification checklist (per requirement):**

| Req ID | Behavior | Verification Method |
|--------|----------|---------------------|
| CAL-01 | After connect, user sees multi-select calendar list | Open dashboard, click connect, verify list appears with real calendar names |
| CAL-02 | Selections persist across page reload | Save selection, reload page, verify selections are restored |
| CAL-03 | Can edit selections from Settings | Navigate to /settings, verify Google Calendar section present with current selections editable |
| CAL-04 | Can designate one default push calendar | In Settings or picker, select push target, save, reload, verify saved |

---

## Sources

### Primary (HIGH confidence)
- Google Calendar API v3 reference (`developers.google.com/calendar/api/v3/reference/calendarList`) — calendarList.list endpoint, resource fields, pagination, scope requirements
- Direct source code reads — `src/lib/googleCalendar.ts`, `src/lib/useGoogleCalendarToken.ts`, `src/lib/hooks.ts`, `src/lib/types.ts`, `src/app/settings/page.tsx`, `src/app/dashboard/page.tsx`, `src/components/DailyTimeLog.tsx`, `supabase/schema.sql`, `supabase/add_roles.sql`

### Secondary (MEDIUM confidence)
- Google Calendar API calendarList resource reference — `accessRole` values and `primary` field behavior confirmed via official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in the project; no new dependencies needed
- Architecture: HIGH — patterns derived from direct codebase reading; hook pattern, settings page pattern, and migration pattern are all established
- Pitfalls: HIGH — token/sessionStorage pitfall and accessRole pitfall are structurally certain given the current implementation; TypeScript interface pitfall is a known process issue

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (Google Calendar API is stable; Supabase JS API is stable at 2.x)
