---
phase: 04-goals-and-values-task-reporting-dashboard
plan: "01"
subsystem: data-layer
tags: [recharts, hooks, typescript, report-data]
dependency_graph:
  requires: []
  provides: [GoalReport, TrendDataPoint, ReportData, useReportData]
  affects: [src/lib/types.ts, src/lib/hooks.ts]
tech_stack:
  added: [recharts@^3.8.1]
  patterns: [useMemo memoization, client-side metric computation from existing hooks]
key_files:
  created: []
  modified:
    - src/lib/types.ts
    - src/lib/hooks.ts
    - package.json
decisions:
  - Client-side metric computation reuses useGoals + useTasks; no extra Supabase queries
  - 8-week trend window starting from the Monday of the current week
  - Goals with zero completions are omitted from trend data keys
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_modified: 3
---

# Phase 04 Plan 01: Report Data Layer Summary

**One-liner:** Installed recharts, added GoalReport/TrendDataPoint/ReportData types, and created useReportData hook computing per-goal task metrics and 8-week trend data client-side.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install recharts and add report types | 0556e36 | package.json, src/lib/types.ts |
| 2 | Create useReportData hook | b4c6bc8 | src/lib/hooks.ts |

## What Was Built

### Types (src/lib/types.ts)

Three new interfaces added:
- `GoalReport` — per-goal metrics: `openCount`, `completedCount`, `overdueCount`, `totalCount`, `completionRate`
- `TrendDataPoint` — weekly series: `weekLabel`, `weekStart`, plus dynamic keys per goal title
- `ReportData` — combined shape returned by `useReportData`: `goalReports`, `forgottenGoals`, `unlinkedTasks`, `trendData`, `loading`

### Hook (src/lib/hooks.ts)

`useReportData()` hook:
- Calls `useGoals()` and `useTasks()` (no dateFilter — all tasks)
- Filters to active goals only
- Computes all metrics client-side with `useMemo`
- Builds 8-week trend window (Monday-start, current week inclusive)
- Returns `ReportData` typed result

### Dependency

`recharts@^3.8.1` installed and listed in package.json.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- src/lib/types.ts contains GoalReport, TrendDataPoint, ReportData interfaces
- src/lib/hooks.ts exports useReportData, uses useMemo, references GoalReport
- package.json contains recharts dependency
- npx tsc --noEmit passes with no errors
- Commits 0556e36 and b4c6bc8 verified present
