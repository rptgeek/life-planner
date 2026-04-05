# Life Planner — Google Calendar Cleanup

## What This Is

A personal productivity web app (Next.js + Supabase) built around the Franklin Planner productivity pyramid: Mission → Values → Goals → Tasks. Users manage daily tasks, goals, and reflections, with Google Calendar integration for scheduling. This milestone focuses on fixing and completing the Google Calendar feature.

## Core Value

Tasks with scheduled times should appear in both the in-app calendar view and the user's Google Calendar, with full bidirectional awareness of which calendars matter.

## Requirements

### Validated

- ✓ Google Calendar OAuth connection (popup flow via GIS) — existing
- ✓ Task creation with scheduled date/time/duration — existing
- ✓ Push new/updated/deleted tasks to Google Calendar (primary calendar) — existing
- ✓ Daily task view, goals, roles, values, reflections — existing
- ✓ Supabase auth with implicit flow — existing

### Active

- [ ] Calendar selector: after OAuth connect, user picks which Google Calendars to display (multi-select); selection also editable in settings
- [ ] Calendar view: fetched GCal events actually render in the in-app calendar (currently not appearing at all)
- [ ] Default calendar for task push: user selects one Google Calendar as the target for new tasks (configurable in settings); tasks pushed there instead of hardcoded `primary`

### Out of Scope

- Syncing GCal → app (importing GCal events as tasks) — not requested
- Per-task calendar override — user chose default-only
- Two-way real-time sync / webhooks — not requested
- Other non-calendar cleanup — explicitly deferred

## Context

- Google Calendar integration uses GIS popup OAuth, token stored in sessionStorage (expires ~58 min)
- Current task sync always targets `/calendars/primary/events` — no calendar selection
- Calendar view exists in the app but GCal events are not fetched/rendered into it
- `tasks.google_event_id` tracks the paired GCal event per task
- Token management: `src/lib/useGoogleCalendarToken.ts`, API wrappers: `src/lib/googleCalendar.ts`, hook: `src/lib/useGoogleCalendar.ts`
- Codebase map: `.planning/codebase/`

## Constraints

- **Tech stack**: Next.js 16 App Router, React, Supabase, TypeScript — no new frameworks
- **Auth**: GIS popup flow must be preserved (redirect flow causes popup blocker issues)
- **Storage**: Calendar preferences (selected calendars, default push calendar) stored in Supabase `profiles` table or a new user_preferences table — persisted across sessions
- **Scope**: Calendar feature only — no unrelated changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Store calendar prefs in Supabase | Persists across devices/sessions; sessionStorage only lasts one tab | — Pending |
| Show calendar picker on connect + in settings | User requested both entry points | — Pending |
| Single default push calendar (no per-task override) | User explicitly chose simpler model | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-05 after initialization*
