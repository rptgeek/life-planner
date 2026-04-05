# External Integrations

**Analysis Date:** 2026-04-05

## APIs & External Services

**Google APIs:**
- Google Calendar API (REST v3) - Read/write access to calendar events
  - SDK/Client: Google Identity Services (GIS) JavaScript library (`https://accounts.google.com/gsi/client`)
  - Auth: OAuth 2.0 implicit flow with user consent popup
  - Scope: `https://www.googleapis.com/auth/calendar`
  - Token storage: Session storage (in-memory, cleared on page reload)
  - Client ID: `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`

- Google Fonts (Inter font) - Font delivery via `next/font/google`

## Data Storage

**Databases:**
- PostgreSQL (hosted by Supabase)
  - Connection: Supabase project URL (`NEXT_PUBLIC_SUPABASE_URL`)
  - Client: @supabase/supabase-js 2.101.1
  - Tables: `profiles`, `categories`, `roles`, `goals`, `tasks`, `daily_reflections`, `values`
  - Authentication: User-based row-level security (RLS) enforced at database level

**File Storage:**
- Local filesystem only
- No cloud file storage integration (PDFs generated in-memory, downloaded by user)

**Caching:**
- Session storage for Google Calendar token
  - Key: `gcal_token` (access token)
  - Key: `gcal_token_expiry` (expiration timestamp)
- No server-side caching layer (HTTP caching via Next.js)
- No Redis or Memcached

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Implicit OAuth flow (non-standard but required for browser-only auth)
  - Configured in `src/lib/supabase.ts` with `flowType: 'implicit'`
  - User session stored in Supabase browser client
  - Auth state subscribed in `src/lib/hooks.ts::useUser()`

**Separate Service:**
- Google Identity Services (GIS) for Calendar access
  - Independent from Supabase login
  - User must explicitly consent to Calendar permission
  - No redirect flow used (popup flow prevents redirect loop)
  - Pre-loaded on mount to avoid popup blocker interference

## Monitoring & Observability

**Error Tracking:**
- None detected
- No Sentry, Rollbar, or similar integration

**Logs:**
- Browser console only (`console.error` for debugging)
- No server-side structured logging
- No log aggregation service

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended by Next.js and mentioned in README)
- Deployment URL visible in source: `https://life-planner-five-pi.vercel.app` (used in Google Calendar event source attribution)

**CI Pipeline:**
- None detected (likely configured in Vercel dashboard if using git integration)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - PostgreSQL database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous JWT key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth 2.0 client ID

**Secrets location:**
- `.env.local` file (not committed to git)
- Only public keys stored here; private keys must be managed separately in Supabase and Google Cloud Console

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` - Legacy OAuth redirect endpoint (deprecated, redirects to `/auth/confirm?code=...`)
- `/auth/confirm` - Auth confirmation page (handles Supabase OAuth callback with implicit flow)

**Outgoing:**
- None detected

## Data Models

**Supabase Tables:**

**profiles**
- Stores user profile data (display name, mission statement)
- Linked to auth.users by id

**categories**
- Organizational containers for goals and tasks
- Fields: id, user_id, name, color, icon, sort_order, created_at
- User-scoped (RLS enforced)

**roles**
- Life roles (e.g., "Parent", "Engineer", "Friend")
- Optional category association
- Fields: id, user_id, category_id, name, color, sort_order, created_at

**values**
- Core personal values
- Fields: id, user_id, title, description, sort_order, created_at

**goals**
- Long-term and short-term goals
- Hierarchical (parent_goal_id for sub-goals)
- Optional role and category association
- Fields: id, user_id, category_id, role_id, parent_goal_id, title, description, goal_type, target_date, status, created_at, updated_at

**tasks**
- Action items linked to goals
- Scheduled with date/time and duration
- Synced to Google Calendar via google_event_id
- Fields: id, user_id, category_id, goal_id, role_id, title, description, priority (A-D), due_date, scheduled_date, start_time, duration_minutes, google_event_id, in_progress, completed, completed_at, sort_order, created_at, updated_at

**daily_reflections**
- Daily journal entries
- Fields: id, user_id, reflection_date, notes, wins, improvements, created_at, updated_at
- Upserted (insert or update on conflict)

## Google Calendar Sync

**Event Creation:**
- Task scheduling triggers calendar event creation via `createCalendarEvent()`
- Event body includes task title, description, start time (with timezone), duration
- Source attribution: `{ title: 'Life Planner', url: 'https://life-planner-five-pi.vercel.app' }`

**Event Updates:**
- Task changes sync to Calendar via `updateCalendarEvent()`
- Uses PUT request to `/calendars/primary/events/{eventId}`

**Event Deletion:**
- Completed/archived tasks delete associated calendar events via `deleteCalendarEvent()`
- Gracefully handles 410 (Already deleted) responses

**Token Management:**
- Token expires in ~3500 seconds (58 minutes)
- Invalid token (401/403) raises `GoogleTokenExpiredError`
- User prompted to re-authenticate when token expires

---

*Integration audit: 2026-04-05*
