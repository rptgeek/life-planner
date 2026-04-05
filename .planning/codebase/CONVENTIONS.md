# Coding Conventions

**Analysis Date:** 2026-04-05

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `TaskCard.tsx`, `OnboardingWizard.tsx`)
- Utility modules: camelCase with `.ts` extension (e.g., `googleCalendar.ts`, `categorize.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useGoogleCalendar.ts`, `useGoogleCalendarToken.ts`)
- Page routes: lowercase directory names matching URL paths (e.g., `/src/app/dashboard/page.tsx`)

**Functions:**
- Exported functions: camelCase (e.g., `fetchCalendarEvents`, `createCalendarEvent`, `autoCategorize`)
- Custom hooks: camelCase with `use` prefix (e.g., `useUser`, `useTasks`, `useReflection`)
- Event handlers: camelCase with `handle`/`on` prefix (e.g., `handleAddTask`, `onDragEnd`, `onSubmit`)
- Internal/helper functions: camelCase, no prefix (e.g., `gcalFetch`, `taskToEventBody`)

**Variables:**
- State: camelCase (e.g., `selectedDate`, `showPlanMyDay`, `goalTasks`)
- Boolean flags: start with `is`, `show`, `has`, `can` (e.g., `isToday`, `showDetails`, `calSyncing`)
- Constants: UPPER_SNAKE_CASE (e.g., `TOTAL_STEPS = 5`, `BASE = 'https://...'`)
- Destructured props: match original casing (e.g., `{ user, loading }`)
- Callback references: camelCase with `on` or `handle` prefix (e.g., `onToggle`, `onDelete`, `onUpdate`)

**Types:**
- Interfaces: PascalCase (e.g., `Task`, `Category`, `Profile`, `TaskCardProps`)
- Type aliases: PascalCase (e.g., `DropResult`, `GoogleTokenExpiredError`)
- Union/literal types: UPPER_CASE for literals (e.g., `priority: 'A' | 'B' | 'C' | 'D'`, `goal_type: 'long_term' | 'short_term'`)

## Code Style

**Formatting:**
- No explicit formatter configured (Next.js default)
- Line length: varies, typically <100 characters for readability
- Indentation: 2 spaces (inferred from code)
- String quotes: single quotes for JS, double quotes for JSX attributes
- Semicolons: always used

**Linting:**
- Tool: ESLint v9 with Next.js 16.2.2 config
- Config file: `eslint.config.mjs`
- Rules: Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignored: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. React and core library imports (`react`, `next/*`)
2. External dependencies (`date-fns`, `lucide-react`, `@supabase/*`)
3. Internal `@/lib` imports (utilities, hooks, types)
4. Internal `@/components` imports
5. Type imports (using `import type`)

**Example from `TaskCard.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { Check, Circle, Trash2, ... } from 'lucide-react'
import { Task, Category, Role } from '@/lib/types'
import { format } from 'date-fns'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { createCalendarEvent, ... } from '@/lib/googleCalendar'
```

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)
- Used consistently throughout codebase for cleaner imports

## Error Handling

**Patterns:**
- Custom error classes extend `Error` (e.g., `GoogleTokenExpiredError`)
- Try/catch blocks wrap async operations, especially API calls
- Generic catch handler logs to `console.error` with context
- User-facing errors caught and displayed in state (e.g., `setCalError`, `calError`)
- Token expiry treated as distinguished error type (`GoogleTokenExpiredError` vs generic fetch failures)

**Example from `TaskCard.tsx`:**
```typescript
try {
  const token = await getGoogleToken()
  if (!token) throw new GoogleTokenExpiredError()
  const eventId = await createCalendarEvent(token, augmented)
  onUpdate(task.id, { google_event_id: eventId })
} catch (e) {
  setCalError(e instanceof GoogleTokenExpiredError ? 'Reconnect Google Calendar' : 'Sync failed')
} finally {
  setCalSyncing(false)
}
```

## Logging

**Framework:** Native `console` object

**Patterns:**
- `console.error()` for exceptions and failures
- Used in error handlers to log unexpected behavior
- Context is always included (e.g., "Calendar connect failed:", "PDF generation failed:", "auth confirm error:")
- No `console.log` found in production code (debug-only statements removed)

## Comments

**When to Comment:**
- Clarify non-obvious algorithmic sections (e.g., drag-drop reordering logic)
- Mark feature transitions (e.g., "── Calendar time scheduling ──")
- Explain future work or commented-out code (e.g., "Future: Claude API categorization")

**JSDoc/TSDoc:**
- Minimal usage
- Function signatures documented via TypeScript types
- No formal JSDoc blocks observed

## Function Design

**Size:** 
- Most functions 20–80 lines
- Larger components like `PlanMyDay.tsx` (596 lines) broken into multiple sections with clear logical boundaries
- Custom hooks (`useUser`, `useTasks`) follow consistent pattern: ~30–50 lines each

**Parameters:**
- Props interfaces used for component parameters (e.g., `TaskCardProps`, `TaskFormProps`)
- Function parameters typed explicitly (no `any`)
- Destructuring preferred for props and object parameters
- Optional parameters marked in types (e.g., `dragHandleProps?: DraggableProvidedDragHandleProps | null`)

**Return Values:**
- Hooks return objects with all state, setters, and refetch methods (e.g., `{ user, loading }`, `{ categories, addCategory, updateCategory, deleteCategory, refetch }`)
- Components return JSX or null
- Async functions return Promise<void> or Promise<DataType>
- null used for missing optional data (e.g., `profile: Profile | null`)

## Module Design

**Exports:**
- Default export for Page and component files
- Named exports for utilities and hooks
- Example from `hooks.ts`: Named exports for each hook (`useUser`, `useProfile`, `useCategories`, etc.)
- Example from `googleCalendar.ts`: Mix of named functions + custom error class

**Barrel Files:**
- No barrel files (index.ts) detected
- Each component/utility imported directly from its file

## TypeScript Patterns

**Strict Mode:** Enabled in `tsconfig.json`

**Type Safety:**
- Interface-based types for data models (`Task`, `Category`, `Profile`, etc.)
- Discriminated unions for API responses (not observed explicitly, but error classes used)
- Type narrowing with `typeof` and custom type guards (`e instanceof GoogleTokenExpiredError`)
- Generic constraints in hooks (e.g., `Task[]`, `Category[]`)

**State Management:**
- React hooks (useState, useContext implicitly, useCallback for memoization)
- Supabase client for data persistence
- Local component state for UI (e.g., form inputs, expanded/collapsed sections)
- Custom hooks encapsulate data fetching logic

## Conditional Rendering

**Patterns:**
- Ternary operators for single-branch conditions
- Logical AND (`&&`) for presence checks
- Early returns in components (e.g., `if (loading) return ...`)
- Template string interpolation for className composition

**Example from `TaskCard.tsx`:**
```typescript
className={`
  border-l-4 rounded-lg border border-slate-200 transition-all duration-200
  ${priorityStyles[task.priority]}
  ${task.completed ? 'opacity-50' : task.in_progress ? 'ring-1 ring-amber-300' : ''}
`}
```

## Async Patterns

**Usage:**
- Async/await preferred over `.then()`
- `useCallback` with dependencies to prevent infinite loops
- `useEffect` properly cleaned up (subscriptions unsubscribed)
- Promise.all for parallel operations (e.g., reordering multiple tasks)

**Example from `hooks.ts`:**
```typescript
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user)
    setLoading(false)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
    setLoading(false)
  })

  return () => subscription.unsubscribe() // cleanup
}, [])
```

---

*Convention analysis: 2026-04-05*
