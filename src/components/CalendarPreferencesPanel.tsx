'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Save, RefreshCw } from 'lucide-react'
import { listCalendars } from '@/lib/googleCalendar'
import type { CalendarListEntry } from '@/lib/googleCalendar'
import { useCalendarPreferences } from '@/lib/useCalendarPreferences'
import { requestCalendarToken, preloadGIS } from '@/lib/useGoogleCalendarToken'

interface CalendarPreferencesPanelProps {
  token: string | null
  onTokenChange?: (token: string) => void
}

export default function CalendarPreferencesPanel({ token, onTokenChange }: CalendarPreferencesPanelProps) {
  const { selectedIds, defaultPushId, savePreferences } = useCalendarPreferences()

  const [calendars, setCalendars] = useState<CalendarListEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([])
  const [localDefaultPushId, setLocalDefaultPushId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const initializedRef = useRef(false)

  // Preload GIS so the connect button works without a popup blocker
  useEffect(() => { preloadGIS() }, [])

  // Only initialize local state from hook once (avoid resetting on re-renders)
  useEffect(() => {
    if (!initializedRef.current && selectedIds !== undefined) {
      initializedRef.current = true
      setLocalSelectedIds(selectedIds)
      setLocalDefaultPushId(defaultPushId)
    }
  }, [selectedIds, defaultPushId])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    listCalendars(token)
      .then(items => setCalendars(items))
      .finally(() => setLoading(false))
  }, [token])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const newToken = await requestCalendarToken()
      onTokenChange?.(newToken)
    } catch {
      // user dismissed popup
    } finally {
      setConnecting(false)
    }
  }

  const toggleSelected = (id: string) => {
    setLocalSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    await savePreferences(localSelectedIds, localDefaultPushId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!token) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">Connect your Google Calendar to choose which calendars to display.</p>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={connecting ? 'animate-spin' : ''} />
          {connecting ? 'Connecting…' : 'Connect Google Calendar'}
        </button>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading calendars...</p>
  }

  if (calendars.length === 0) {
    return <p className="text-sm text-slate-500">No calendars found.</p>
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {calendars.map(cal => {
          const isSelected = localSelectedIds.includes(cal.id)
          const canPush = cal.accessRole === 'writer' || cal.accessRole === 'owner'
          return (
            <div
              key={cal.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cal.backgroundColor ?? '#94a3b8' }}
              />

              {/* Display checkbox */}
              <input
                type="checkbox"
                id={`cal-check-${cal.id}`}
                checked={isSelected}
                onChange={() => toggleSelected(cal.id)}
                className="w-4 h-4 accent-indigo-600 flex-shrink-0"
              />

              {/* Calendar name */}
              <label
                htmlFor={`cal-check-${cal.id}`}
                className="flex-1 text-sm text-slate-700 cursor-pointer select-none"
              >
                {cal.summary}
              </label>

              {/* Push-target radio — only for writable calendars */}
              {canPush && (
                <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer flex-shrink-0">
                  <input
                    type="radio"
                    name="default-push"
                    value={cal.id}
                    checked={localDefaultPushId === cal.id}
                    onChange={() => setLocalDefaultPushId(cal.id)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  Default
                </label>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Save size={14} />
          Save
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>
    </div>
  )
}

// Re-export section header for Settings page to use
export function CalendarSectionHeader() {
  return (
    <div className="flex items-center gap-2 mb-1">
      <CalendarDays size={16} className="text-indigo-500" />
      <h3 className="text-sm font-semibold text-slate-700">Google Calendar</h3>
    </div>
  )
}
