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
- [x] **Phase 3: Task Sync Routing** - Route task create/update/delete operations to the configured default calendar (completed 2026-04-06)

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
**Plans:** 1/2 plans executed
Plans:
- [x] 01-01-PLAN.md — Data layer: migration SQL, Profile type, listCalendars API, useCalendarPreferences hook
- [x] 01-02-PLAN.md — UI: CalendarPreferencesPanel component, Settings page integration, DailyTimeLog setup prompt
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
**Plans:** 1/1 plans complete
Plans:
- [x] 03-01-PLAN.md — Route GCal create/update/delete through configured default calendar

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Calendar Preferences | 2/2 | In Progress (checkpoint pending) |  |
| 2. Calendar View Rendering | 0/TBD | Not started | - |
| 3. Task Sync Routing | 1/1 | Complete    | 2026-04-06 |
| 4. Goals & Values Reporting | 0/3 | Not started | - |

### Phase 4: Goals and Values task reporting dashboard

**Goal:** A /reports page showing goal-task metrics (open/completed/overdue counts, completion %, forgotten goals) and weekly trend charts, with sidebar navigation
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04, RPT-05, RPT-06, RPT-07, RPT-08
**Depends on:** Phase 3
**Success Criteria** (what must be TRUE):
  1. /reports page shows per-goal cards with open, completed, overdue counts and completion % progress bar
  2. Goals with zero tasks are surfaced in an amber callout
  3. Tasks with no goal appear in a collapsible "Unlinked Tasks" section
  4. Weekly trend chart shows tasks completed per goal over time
  5. Sidebar has a Reports nav entry
**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Data layer: recharts install, report types, useReportData hook
- [ ] 04-02-PLAN.md — UI components: GoalReportCard, ForgottenGoalsCallout, UnlinkedTasksSection, TrendChartsSection
- [ ] 04-03-PLAN.md — Page assembly: /reports route, Sidebar nav entry, wire everything
