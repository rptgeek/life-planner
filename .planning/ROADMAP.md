# Roadmap: Life Planner — Google Calendar Cleanup

## Overview

Three phases deliver the complete Google Calendar cleanup: first, calendar preferences are persisted so the user controls which calendars are displayed and which receives pushed tasks. Second, the in-app calendar view is wired to fetch and render events from those selected calendars. Third, task sync is re-routed away from the hardcoded `primary` calendar to the user-configured default.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Calendar Preferences** - Persist user's calendar display selection and default push target in Supabase
- [ ] **Phase 2: Calendar View Rendering** - Fetch and display GCal events from selected calendars in the in-app view
- [ ] **Phase 3: Task Sync Routing** - Route task create/update/delete operations to the configured default calendar

## Phase Details

### Phase 1: Calendar Preferences
**Goal**: Users can choose which Google Calendars to display and which to receive pushed tasks, with that configuration persisting across sessions
**Depends on**: Nothing (existing OAuth connection)
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04
**Success Criteria** (what must be TRUE):
  1. After connecting Google Calendar, user sees a multi-select list of their calendars and can toggle which ones appear in the app
  2. User can designate exactly one calendar as the default push target for tasks
  3. Calendar selections survive a page reload and re-login (stored in Supabase, not sessionStorage)
  4. User can return to settings at any time and change both the display selection and the default push calendar
**Plans:** 2 plans
Plans:
- [ ] 01-01-PLAN.md — Data layer: migration SQL, Profile type, listCalendars API, useCalendarPreferences hook
- [ ] 01-02-PLAN.md — UI: CalendarPreferencesPanel component, Settings page integration, DailyTimeLog setup prompt
**UI hint**: yes

### Phase 2: Calendar View Rendering
**Goal**: Events from the user's selected Google Calendars appear in the in-app calendar view with correct titles and times
**Depends on**: Phase 1
**Requirements**: VIEW-01, VIEW-02
**Success Criteria** (what must be TRUE):
  1. Opening the in-app calendar view shows events fetched from all selected Google Calendars
  2. Each event displays its title, date, and time accurately
  3. Events from unselected calendars do not appear
**Plans**: TBD
**UI hint**: yes

### Phase 3: Task Sync Routing
**Goal**: Task create, update, and delete operations target the user's configured default Google Calendar instead of the hardcoded primary calendar
**Depends on**: Phase 1
**Requirements**: SYNC-01, SYNC-02, SYNC-03
**Success Criteria** (what must be TRUE):
  1. Creating a scheduled task pushes the event to the user's configured default calendar, not always `primary`
  2. Updating a scheduled task updates the event in whichever calendar it was originally pushed to
  3. Deleting or completing a scheduled task removes the event from the correct calendar
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Calendar Preferences | 0/2 | Planning complete | - |
| 2. Calendar View Rendering | 0/TBD | Not started | - |
| 3. Task Sync Routing | 0/TBD | Not started | - |
