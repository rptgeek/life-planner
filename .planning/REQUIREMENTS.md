# Requirements: Life Planner — Google Calendar Cleanup

**Defined:** 2026-04-05
**Core Value:** Tasks with scheduled times should appear in both the in-app calendar view and the user's Google Calendar, with full bidirectional awareness of which calendars matter.

## v1 Requirements

### Calendar Selection

- [ ] **CAL-01**: After connecting Google Calendar (OAuth), user is shown a multi-select list of their Google Calendars and can choose which ones to display in the app
- [ ] **CAL-02**: Calendar display selection is persisted (survives page reload / re-login)
- [ ] **CAL-03**: User can edit calendar display selection from a settings area (not only on first connect)
- [ ] **CAL-04**: User can designate one Google Calendar as the default push target for new tasks

### Calendar View

- [ ] **VIEW-01**: Google Calendar events from selected calendars appear visually in the in-app calendar view
- [ ] **VIEW-02**: Events show with correct date, time, and title

### Task → Google Calendar Sync

- [ ] **SYNC-01**: When a task with a scheduled date/time is created, it is pushed to the user's configured default Google Calendar (not hardcoded `primary`)
- [ ] **SYNC-02**: When a scheduled task is updated, the corresponding GCal event is updated in the correct calendar
- [ ] **SYNC-03**: When a scheduled task is deleted/completed, the corresponding GCal event is removed

## v2 Requirements

### Future Calendar Enhancements

- **CAL-V2-01**: Per-task calendar override (let user pick calendar per task at scheduling time)
- **CAL-V2-02**: Import GCal events as tasks (GCal → app sync)
- **CAL-V2-03**: Real-time calendar sync via webhooks

## Out of Scope

| Feature | Reason |
|---------|--------|
| Per-task calendar override | User explicitly chose default-only model for simplicity |
| GCal → app import | Not requested; reverse sync adds significant complexity |
| Real-time/webhook sync | Not requested; polling or on-load fetch is sufficient |
| Other app areas (goals, tasks UI, auth) | Explicitly out of scope for this milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAL-01 | Phase 1 | Pending |
| CAL-02 | Phase 1 | Pending |
| CAL-03 | Phase 1 | Pending |
| CAL-04 | Phase 1 | Pending |
| VIEW-01 | Phase 2 | Pending |
| VIEW-02 | Phase 2 | Pending |
| SYNC-01 | Phase 2 | Pending |
| SYNC-02 | Phase 2 | Pending |
| SYNC-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-05 after initial definition*
