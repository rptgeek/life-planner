# Phase 4: Goals and Values Task Reporting Dashboard - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

A new `/reports` page that shows how tasks are distributed and completed across goals, surfacing which goals have open/completed/overdue tasks and which goals have no tasks at all. Also shows trend charts (tasks completed over time per goal). Values are shown as context where goals connect to them, but the primary axis is Goal → Tasks (not Value → Tasks), since the current schema has tasks linked to goals, not directly to values.

</domain>

<decisions>
## Implementation Decisions

### Location and Navigation
- **D-01:** New dedicated `/reports` page (new route + sidebar nav entry)
- **D-02:** Page is separate from the existing `/goals` CRUD page — different purpose (analytics vs. management)

### Pyramid Traversal
- **D-03:** Goal → Tasks grouping (tasks grouped under the goal they're assigned to)
- **D-04:** No forced Value → Task chain; values don't directly link to tasks in the current schema and adding that link is out of scope
- **D-05:** Goals show their associated role/category as context (already available via `goal.category_id`, `goal.role_id`)
- **D-06:** Include a separate "Unlinked Tasks" section for tasks with no `goal_id` — surfaces orphan tasks that need alignment

### Metrics per Goal
- **D-07:** Open task count (tasks where `completed = false`)
- **D-08:** Completed task count (tasks where `completed = true`)
- **D-09:** Completion rate % (completed / total tasks)
- **D-10:** Overdue task count (tasks with `due_date` < today and `completed = false`)
- **D-11:** "Goals with zero tasks" — highlight goals that have no tasks attached (the forgotten-goals metric, shown as a distinct callout or section)

### Time Dimension
- **D-12:** Current-state snapshot (default view) — open/done/overdue right now
- **D-13:** Trend charts showing tasks completed per goal per week/month — both current state and trends are included

### Visual Style
- **D-14:** Cards with Tailwind CSS progress bars for the per-goal section — each goal gets a card showing counts, progress bar (completion %), overdue badge
- **D-15:** Trend charts in a dedicated section below the goal cards using Recharts

### Chart Library
- **D-16:** Add Recharts (`recharts`) — composable, good TypeScript support, compatible with Tailwind color tokens

### Claude's Discretion
- Exact card layout, spacing, typography
- How to handle goals with `status = 'archived'` or `status = 'completed'` — filter out or show collapsed
- Trend chart granularity (weekly vs monthly toggle or just one)
- Color palette for goal cards (use existing Tailwind slate/indigo palette)
- Loading and empty state design

</decisions>

<specifics>
## Specific Ideas

- "Think of yourself as a master UI" — the reporting should feel like a real productivity insights dashboard, not an afterthought
- "Metrics about which values/goals have tasks too" — the forgotten-goals metric (D-11) directly addresses this
- "Maybe over time too" — confirmed: both current-state snapshot + trend charts (D-12, D-13)
- The Franklin Planner pyramid context: Mission → Values → Goals → Tasks — the report should feel like it's surfacing the health of the pyramid from the bottom up

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data models and hooks
- `src/lib/types.ts` — Goal, Task, Value, Role, Category interfaces (all field names and types)
- `src/lib/hooks.ts` — useGoals(), useTasks(), useValues() — existing query patterns to reuse/extend

### Existing pages for pattern reference
- `src/app/goals/page.tsx` — How goals are currently rendered and filtered (long_term/short_term/completed)
- `src/app/mission/page.tsx` — How values are currently displayed

### Project constraints
- `.planning/PROJECT.md` — Stack constraints (Next.js 16 App Router, Tailwind, Supabase, TypeScript — no new frameworks beyond Recharts)
- `AGENTS.md` — Next.js version note: read `node_modules/next/dist/docs/` before writing App Router code

No external specs or ADRs — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useGoals()` in `src/lib/hooks.ts` — fetches all goals with nested category/role; may need extension to join tasks counts
- `useTasks()` in `src/lib/hooks.ts` — fetches tasks with goal join; can be used to derive per-goal metrics client-side or via a new Supabase query
- `useValues()` in `src/lib/hooks.ts` — available if values need to appear as section headers

### Established Patterns
- Tailwind CSS throughout — use slate/indigo color tokens consistent with existing pages
- All pages are `'use client'` components under `src/app/dashboard/layout.tsx` (auth guard)
- Data fetching via Supabase client-side hooks (no server components for data)
- `src/app/weekly/page.tsx` already shows stats — check for any reusable pattern

### Integration Points
- New route: `src/app/reports/page.tsx` + `src/app/reports/layout.tsx`
- Sidebar navigation (`src/components/Sidebar.tsx`) needs a new nav entry for Reports
- Tasks query needs a "all tasks" variant (not date-filtered) — `useTasks()` currently accepts a `dateFilter` param; need all tasks grouped by goal

</code_context>

<deferred>
## Deferred Ideas

- Direct Value → Task linking (requires new `goal.value_id` foreign key or a `task.value_id` field) — future schema change
- Per-role breakdown (tasks per role) — could be a follow-on reports tab
- Export/PDF of the report — not requested for this phase

</deferred>

---

*Phase: 04-goals-and-values-task-reporting-dashboard*
*Context gathered: 2026-04-05*
