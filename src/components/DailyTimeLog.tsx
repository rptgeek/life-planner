'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, RefreshCw, ExternalLink } from 'lucide-react'
import type { CalendarEvent, Task } from '@/lib/types'
import { useCalendarPreferences } from '@/lib/useCalendarPreferences'

interface DailyTimeLogProps {
  events: CalendarEvent[]
  tasks: Task[]
  loading: boolean
  tokenExpired: boolean
  onReconnect: () => void
  onRefresh: () => void
}

const HOUR_START = 6   // 6 AM
const HOUR_END   = 21  // 9 PM
const HOUR_PX    = 56  // pixels per hour

function minutesSince6am(dateTimeStr: string): number {
  const d = new Date(dateTimeStr)
  return (d.getHours() - HOUR_START) * 60 + d.getMinutes()
}

function durationMinutes(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60_000
}

// Google Calendar colorId → tailwind bg colors
const GCAL_COLORS: Record<string, string> = {
  '1': 'bg-blue-200 border-blue-400 text-blue-900',
  '2': 'bg-green-200 border-green-400 text-green-900',
  '3': 'bg-purple-200 border-purple-400 text-purple-900',
  '4': 'bg-pink-200 border-pink-400 text-pink-900',
  '5': 'bg-yellow-200 border-yellow-400 text-yellow-900',
  '6': 'bg-orange-200 border-orange-400 text-orange-900',
  '7': 'bg-teal-200 border-teal-400 text-teal-900',
  '8': 'bg-slate-200 border-slate-400 text-slate-900',
  '9': 'bg-blue-300 border-blue-500 text-blue-900',
  '10': 'bg-green-300 border-green-500 text-green-900',
  '11': 'bg-red-200 border-red-400 text-red-900',
}

const PRIORITY_COLORS: Record<string, string> = {
  A: 'bg-red-100 border-red-400 text-red-900',
  B: 'bg-amber-100 border-amber-400 text-amber-900',
  C: 'bg-blue-100 border-blue-400 text-blue-900',
  D: 'bg-purple-100 border-purple-400 text-purple-900',
}

function formatTime(dateTimeStr: string): string {
  const d = new Date(dateTimeStr)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function DailyTimeLog({
  events, tasks, loading, tokenExpired, onReconnect, onRefresh,
}: DailyTimeLogProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { hasConfigured } = useCalendarPreferences()

  const totalHeight = (HOUR_END - HOUR_START) * HOUR_PX

  // Separate all-day events
  const allDayEvents = useMemo(() => events.filter(e => e.allDay), [events])
  const timedEvents  = useMemo(() => events.filter(e => !e.allDay && e.start.dateTime), [events])

  // Timed tasks (have start_time and scheduled_date)
  const timedTasks = useMemo(
    () => tasks.filter(t => t.start_time && !t.completed),
    [tasks]
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <CalendarDays size={16} className="text-teal-500" />
          Schedule
          <span className="text-xs font-normal text-slate-400 ml-1">
            {collapsed ? '▶' : '▼'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          {!tokenExpired && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors disabled:opacity-40"
              title="Refresh calendar"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          {tokenExpired && (
            <button
              onClick={onReconnect}
              className="text-xs text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors"
            >
              Reconnect Google Calendar
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="p-3">
          {/* All-day events banner */}
          {allDayEvents.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-slate-100">
              {allDayEvents.map(e => (
                <span
                  key={e.id}
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${GCAL_COLORS[e.colorId ?? ''] ?? 'bg-teal-100 border-teal-300 text-teal-900'}`}
                >
                  {e.summary}
                </span>
              ))}
            </div>
          )}

          {/* Disconnected state */}
          {tokenExpired && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
              Google Calendar is disconnected.{' '}
              <button onClick={onReconnect} className="text-teal-600 underline">
                Reconnect
              </button>{' '}
              to see your schedule.
            </div>
          )}

          {/* Post-connect preferences setup prompt */}
          {!tokenExpired && !hasConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3 flex items-start gap-3">
              <CalendarDays size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800">
                  Set up your calendar preferences to choose which calendars to display and where to push tasks.
                </p>
              </div>
              <a
                href="/settings"
                className="flex-shrink-0 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Configure in Settings
              </a>
            </div>
          )}

          {/* Grid */}
          {!tokenExpired && (
            <div className="relative flex" style={{ height: totalHeight }}>
              {/* Hour labels + rules */}
              <div className="flex-shrink-0 w-14">
                {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                  <div
                    key={i}
                    style={{ height: HOUR_PX }}
                    className="border-t border-slate-100 relative"
                  >
                    <span className="absolute -top-2 left-0 text-xs text-slate-400 leading-none">
                      {formatHourLabel(HOUR_START + i)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Event area */}
              <div className="flex-1 relative border-l border-slate-100 ml-1">
                {/* Hour lines */}
                {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-slate-100"
                    style={{ top: i * HOUR_PX }}
                  />
                ))}
                {/* Half-hour lines */}
                {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                  <div
                    key={`half-${i}`}
                    className="absolute w-full border-t border-dashed border-slate-50"
                    style={{ top: i * HOUR_PX + HOUR_PX / 2 }}
                  />
                ))}

                {/* Google Calendar events */}
                {timedEvents.map(event => {
                  const startMins = minutesSince6am(event.start.dateTime!)
                  const durMins = durationMinutes(event.start.dateTime!, event.end.dateTime!)
                  if (startMins < 0 || startMins >= (HOUR_END - HOUR_START) * 60) return null
                  const top = (startMins / 60) * HOUR_PX
                  const height = Math.max((durMins / 60) * HOUR_PX, 20)
                  const colorClass = GCAL_COLORS[event.colorId ?? ''] ?? 'bg-teal-100 border-teal-300 text-teal-900'
                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 rounded border px-1.5 py-0.5 overflow-hidden text-xs font-medium ${colorClass}`}
                      style={{ top, height }}
                      title={event.summary}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">{event.summary}</span>
                        {event.htmlLink && (
                          <a href={event.htmlLink} target="_blank" rel="noreferrer" className="flex-shrink-0 opacity-60 hover:opacity-100">
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {durMins >= 30 && (
                        <div className="opacity-70 text-[10px]">{formatTime(event.start.dateTime!)}</div>
                      )}
                    </div>
                  )
                })}

                {/* Timed tasks */}
                {timedTasks.map(task => {
                  const [h, m] = task.start_time!.split(':').map(Number)
                  const startMins = (h - HOUR_START) * 60 + m
                  if (startMins < 0 || startMins >= (HOUR_END - HOUR_START) * 60) return null
                  const durMins = task.duration_minutes ?? 30
                  const top = (startMins / 60) * HOUR_PX
                  const height = Math.max((durMins / 60) * HOUR_PX, 20)
                  const colorClass = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.C
                  return (
                    <div
                      key={task.id}
                      className={`absolute left-1 right-1 rounded border px-1.5 py-0.5 overflow-hidden text-xs font-medium ${colorClass}`}
                      style={{ top: top + 2, height: height - 2, marginLeft: '45%' }}
                      title={task.title}
                    >
                      <span className="truncate block">{task.priority} · {task.title}</span>
                      {durMins >= 30 && (
                        <div className="opacity-70 text-[10px]">
                          {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Current time indicator */}
                <CurrentTimeIndicator hourStart={HOUR_START} hourEnd={HOUR_END} hourPx={HOUR_PX} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function CurrentTimeIndicator({ hourStart, hourEnd, hourPx }: { hourStart: number; hourEnd: number; hourPx: number }) {
  const now = new Date()
  const mins = (now.getHours() - hourStart) * 60 + now.getMinutes()
  if (mins < 0 || mins > (hourEnd - hourStart) * 60) return null
  const top = (mins / 60) * hourPx
  return (
    <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
        <div className="flex-1 border-t border-red-400" />
      </div>
    </div>
  )
}
