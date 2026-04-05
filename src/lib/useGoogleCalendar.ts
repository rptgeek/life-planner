'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent } from './types'
import { fetchCalendarEvents, GoogleTokenExpiredError } from './googleCalendar'
import { getCachedCalendarToken } from './useGoogleCalendarToken'
import { useCalendarPreferences } from './useCalendarPreferences'

export function useGoogleCalendar(date: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)
  const { selectedIds } = useCalendarPreferences()

  const refresh = useCallback(async () => {
    const token = getCachedCalendarToken()
    if (!token) {
      setTokenExpired(true)
      return
    }
    // Use selected calendars, fall back to primary if none configured
    const calIds = selectedIds.length > 0 ? selectedIds : ['primary']
    setLoading(true)
    try {
      const results = await Promise.all(
        calIds.map(id => fetchCalendarEvents(token, date, id))
      )
      // Merge, deduplicate by event id, sort by start time
      const seen = new Set<string>()
      const merged = results.flat().filter(e => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      merged.sort((a, b) => {
        const aTime = a.start.dateTime ?? a.start.date ?? ''
        const bTime = b.start.dateTime ?? b.start.date ?? ''
        return aTime.localeCompare(bTime)
      })
      setEvents(merged)
      setTokenExpired(false)
    } catch (e) {
      if (e instanceof GoogleTokenExpiredError) {
        setTokenExpired(true)
      } else {
        console.error('Calendar fetch error:', e)
      }
    } finally {
      setLoading(false)
    }
  }, [date, selectedIds])

  useEffect(() => { refresh() }, [refresh])

  return { events, loading, tokenExpired, refresh, calendarCount: selectedIds.length }
}
