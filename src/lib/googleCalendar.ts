import type { CalendarEvent, Task } from './types'

const BASE = 'https://www.googleapis.com/calendar/v3'

export class GoogleTokenExpiredError extends Error {
  constructor() { super('Google token expired or missing Calendar scope') }
}

async function gcalFetch(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (res.status === 401 || res.status === 403) throw new GoogleTokenExpiredError()
  return res
}

// ── List calendars ───────────────────────────────────────────────────────────

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

// ── Fetch events for a calendar day ─────────────────────────────────────────

export async function fetchCalendarEvents(
  token: string,
  date: string,  // 'yyyy-MM-dd'
  calendarId: string = 'primary'
): Promise<CalendarEvent[]> {
  const calEnc = encodeURIComponent(calendarId)
  const timeMin = encodeURIComponent(new Date(`${date}T00:00:00`).toISOString())
  const timeMax = encodeURIComponent(new Date(`${date}T23:59:59`).toISOString())

  const res = await gcalFetch(
    token,
    `/calendars/${calEnc}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`
  )
  if (!res.ok) return []
  const json = await res.json()

  return (json.items ?? []).map((item: Record<string, unknown>) => {
    const start = item.start as { dateTime?: string; date?: string; timeZone?: string }
    const end   = item.end   as { dateTime?: string; date?: string; timeZone?: string }
    return {
      id: item.id as string,
      summary: (item.summary as string) || '(No title)',
      start,
      end,
      colorId: item.colorId as string | undefined,
      htmlLink: item.htmlLink as string | undefined,
      allDay: !start.dateTime,
    } satisfies CalendarEvent
  })
}

// ── Build event body from a task ─────────────────────────────────────────────

function taskToEventBody(task: Task & { start_time: string; duration_minutes: number }) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = task.scheduled_date!
  const [h, m] = task.start_time.split(':').map(Number)
  const startDt = new Date(`${date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
  const endDt = new Date(startDt.getTime() + task.duration_minutes * 60_000)

  // Format using local time getters — NOT toISOString() which gives UTC
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  return {
    summary: task.title,
    description: task.description ?? undefined,
    start: { dateTime: fmt(startDt), timeZone: tz },
    end:   { dateTime: fmt(endDt),   timeZone: tz },
    source: { title: 'Life Planner', url: 'https://life-planner-five-pi.vercel.app' },
  }
}

// ── Create event ─────────────────────────────────────────────────────────────

export async function createCalendarEvent(
  token: string,
  task: Task & { start_time: string; duration_minutes: number },
  calendarId: string = 'primary'
): Promise<string> {
  const res = await gcalFetch(token, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    body: JSON.stringify(taskToEventBody(task)),
  })
  if (!res.ok) throw new Error(`Failed to create event: ${res.status}`)
  const json = await res.json()
  return json.id as string
}

// ── Update event ─────────────────────────────────────────────────────────────

export async function updateCalendarEvent(
  token: string,
  eventId: string,
  task: Task & { start_time: string; duration_minutes: number },
  calendarId: string = 'primary'
): Promise<void> {
  const res = await gcalFetch(token, `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(taskToEventBody(task)),
  })
  if (!res.ok) throw new Error(`Failed to update event: ${res.status}`)
}

// ── Delete event ─────────────────────────────────────────────────────────────

export async function deleteCalendarEvent(
  token: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const res = await gcalFetch(token, `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: 'DELETE',
  })
  // 204 = success, 410 = already deleted — both are fine
  if (!res.ok && res.status !== 410) throw new Error(`Failed to delete event: ${res.status}`)
}

// ── Get token (GIS sessionStorage only) ─────────────────────────────────────

export function getGoogleToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = sessionStorage.getItem('gcal_token')
  const expiry = Number(sessionStorage.getItem('gcal_token_expiry') ?? 0)
  if (!token || Date.now() > expiry) return null
  return token
}
