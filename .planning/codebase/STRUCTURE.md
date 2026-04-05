# Codebase Structure

**Analysis Date:** 2026-04-05

## Directory Layout

```
life-planner/
├── src/
│   ├── app/                           # Next.js App Router pages and routes
│   │   ├── page.tsx                   # Landing page (/)
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   ├── globals.css                # Global Tailwind styles
│   │   ├── login/page.tsx             # Sign in page
│   │   ├── auth/callback/route.ts     # OAuth redirect handler (legacy)
│   │   ├── auth/confirm/page.tsx      # OAuth confirmation (if exists)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Protected layout with Sidebar, auth guard, onboarding check
│   │   │   └── page.tsx               # Daily planner main view
│   │   ├── goals/
│   │   │   ├── layout.tsx             # Goals page layout
│   │   │   └── page.tsx               # Goals management UI
│   │   ├── weekly/
│   │   │   ├── layout.tsx             # Weekly view layout
│   │   │   └── page.tsx               # Weekly calendar + stats
│   │   ├── mission/
│   │   │   ├── layout.tsx             # Mission page layout
│   │   │   └── page.tsx               # Mission & values editor
│   │   ├── settings/
│   │   │   ├── layout.tsx             # Settings page layout
│   │   │   └── page.tsx               # User settings (stub)
│   │   ├── sitemap.ts                 # SEO sitemap
│   │   └── robots.ts                  # SEO robots.txt
│   ├── components/                    # Reusable React components
│   │   ├── Sidebar.tsx                # Left navigation, auth state, version display
│   │   ├── TaskCard.tsx               # Individual task item with drag handle
│   │   ├── TaskForm.tsx               # Form to create/edit tasks
│   │   ├── DailyTimeLog.tsx           # Schedule view with calendar events + tasks
│   │   ├── PlanMyDay.tsx              # Multi-step morning planner wizard
│   │   ├── OnboardingWizard.tsx       # First-time setup (mission + values)
│   │   └── pdf/
│   │       ├── PDFDownloadButton.tsx  # Button to generate PDF
│   │       └── FranklinPlannerPDF.tsx # PDF document structure (@react-pdf/renderer)
│   └── lib/                           # Utilities, hooks, types, integrations
│       ├── hooks.ts                   # React hooks for data fetching (useUser, useTasks, etc.)
│       ├── types.ts                   # TypeScript interfaces for all data models
│       ├── supabase.ts                # Supabase client initialization
│       ├── googleCalendar.ts          # Google Calendar API wrapper
│       ├── useGoogleCalendar.ts       # React hook for calendar event fetching
│       ├── useGoogleCalendarToken.ts  # Token management for Google auth
│       ├── categorize.ts              # Utility for categorizing/organizing data (?)
│       └── version.ts                 # Version number for display in sidebar
├── public/                            # Static assets
│   ├── manifest.json                  # PWA manifest
│   └── icon-*.png                     # App icons
├── next.config.ts                     # Next.js configuration (currently empty)
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── postcss.config.js                  # PostCSS/Tailwind configuration
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router pages, layouts, and server routes
- Contains: Page components (.tsx), layout wrappers, route handlers (.ts), SEO files
- Key files: `page.tsx` (route entry), `layout.tsx` (wrapper), `route.ts` (API endpoints)

**src/components/**
- Purpose: Reusable React components, not tied to a specific route
- Contains: Page-level components (Sidebar, modals), form components, presentational components
- Key files: `Sidebar.tsx` (persistent), `TaskForm.tsx` (reused in dashboard, wizard), `PlanMyDay.tsx` (modal workflow)

**src/lib/**
- Purpose: Shared utilities, hooks, types, and third-party integrations
- Contains: Custom React hooks, TypeScript interfaces, client initialization, API wrappers
- Key files: `hooks.ts` (all CRUD operations), `types.ts` (data models), `supabase.ts` (auth client)

**public/**
- Purpose: Static assets served directly by Next.js
- Contains: Icons, manifests, images
- Key files: `manifest.json` (PWA), `icon-*.png` (app icons for different sizes)

## Key File Locations

**Entry Points:**

- `src/app/layout.tsx`: Root layout, sets up HTML structure and global styles
- `src/app/page.tsx`: Landing page for unauthenticated users
- `src/app/login/page.tsx`: OAuth sign-in page
- `src/app/dashboard/layout.tsx`: Main app shell with Sidebar and auth guard
- `src/app/dashboard/page.tsx`: Primary user interface (daily planner)

**Authentication & Authorization:**

- `src/lib/supabase.ts`: Supabase client with implicit OAuth flow
- `src/app/auth/callback/route.ts`: OAuth redirect handler
- `src/app/dashboard/layout.tsx`: Auth guard redirects unauthenticated users to `/login`

**Core Data Models & Hooks:**

- `src/lib/types.ts`: Profile, Category, Role, Value, Goal, Task, CalendarEvent, DailyReflection
- `src/lib/hooks.ts`: useUser, useProfile, useCategories, useRoles, useGoals, useTasks, useReflection, useValues

**Features:**

- Daily Planner: `src/app/dashboard/page.tsx`, `src/components/TaskForm.tsx`, `src/components/TaskCard.tsx`, `src/components/DailyTimeLog.tsx`
- Goals: `src/app/goals/page.tsx`
- Mission & Values: `src/app/mission/page.tsx`
- Weekly View: `src/app/weekly/page.tsx`
- PDF Export: `src/components/pdf/FranklinPlannerPDF.tsx`, `src/components/pdf/PDFDownloadButton.tsx`
- Google Calendar: `src/lib/googleCalendar.ts`, `src/lib/useGoogleCalendar.ts`, `src/lib/useGoogleCalendarToken.ts`

**Navigation & Layout:**

- `src/components/Sidebar.tsx`: Left sidebar with nav links, user info, sign-out button

**Utilities:**

- `src/lib/version.ts`: Version string displayed in sidebar
- `src/lib/categorize.ts`: (Purpose unclear; used by ?)

## Naming Conventions

**Files:**

- Pages: `page.tsx` (lowercase, follows Next.js convention)
- Components: `PascalCase.tsx` (e.g., TaskCard, PlanMyDay, Sidebar)
- Utilities: `camelCase.ts` (e.g., hooks.ts, supabase.ts, googleCalendar.ts)
- Types: Exported from `types.ts`
- Routes: Follow directory structure (e.g., `/dashboard` → `src/app/dashboard/page.tsx`)

**Directories:**

- Feature directories: lowercase (e.g., `dashboard`, `goals`, `mission`)
- Component directory: `components`
- Library directory: `lib`
- Public assets: `public`

**React Components:**

- Hooks: `use*` prefix (e.g., useTasks, useGoogleCalendar)
- Components: PascalCase (e.g., TaskForm, DailyTimeLog)

**Database Tables (Supabase):**

- Lowercase with underscores: `profiles`, `categories`, `roles`, `values`, `goals`, `tasks`, `daily_reflections`
- Foreign keys: `{entity}_id` (e.g., `user_id`, `goal_id`, `category_id`)

## Where to Add New Code

**New Feature (e.g., Analytics Dashboard):**

- Primary code: `src/app/analytics/page.tsx` (new route/page)
- Layout wrapper: `src/app/analytics/layout.tsx`
- Components: `src/components/AnalyticsChart.tsx`, `src/components/AnalyticsCard.tsx`
- Hooks: Add to `src/lib/hooks.ts` if needs data fetching (e.g., `useAnalyticsData()`)
- Types: Add to `src/lib/types.ts` if new data models needed
- Tests: Create `src/app/analytics/page.test.tsx` (if testing framework added)

**New Component/Module (e.g., Notification System):**

- Implementation: `src/components/NotificationProvider.tsx` (provider) + `src/components/Notification.tsx` (UI)
- Hooks: `src/lib/hooks.ts` for `useNotification()` if manages state
- Types: `src/lib/types.ts` for Notification interface if complex

**New Data Fetching Logic (e.g., Reports):**

- Hook: `src/lib/hooks.ts` → add `useReports()` function
- Type: `src/lib/types.ts` → add Report interface
- Usage: Call hook from page component (e.g., `src/app/reports/page.tsx`)

**Utilities & Helpers (e.g., Date formatting):**

- Shared helpers: `src/lib/utils.ts` (create if doesn't exist)
- Domain-specific: `src/lib/{domain}.ts` (e.g., `src/lib/goalHelpers.ts`)

**Integration with External API (e.g., Slack):**

- Client/wrapper: `src/lib/slack.ts`
- Hook (if needed): `src/lib/hooks.ts` → add `useSlackSync()` or similar
- Types: `src/lib/types.ts`

## Special Directories

**src/app/[dynamic-routes]/**
- Purpose: Not used in current codebase (all routes are static)
- Generated: No
- Committed: N/A

**public/**
- Purpose: Static files served at root (manifest.json becomes /manifest.json)
- Generated: No
- Committed: Yes

**src/components/pdf/**
- Purpose: PDF-specific components using @react-pdf/renderer
- Generated: No
- Committed: Yes
- Note: Separate subdirectory for PDF rendering logic (different from React DOM)

**src/app/auth/**
- Purpose: Authentication-related routes
- Generated: No
- Committed: Yes
- Note: Contains OAuth callback handler and confirmation page

---

*Structure analysis: 2026-04-05*
