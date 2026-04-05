'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent } from './types'
import { fetchCalendarEvents, getGoogleToken, GoogleTokenExpiredError } from './googleCalendar'

export function useGoogleCalendar(date: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  const refresh = useCallback(async () => {
    const token = await getGoogleToken()
    if (!token) {
      setTokenExpired(true)
      return
    }
    setLoading(true)
    try {
      const ev = await fetchCalendarEvents(token, date)
      setEvents(ev)
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
  }, [date])

  useEffect(() => { refresh() }, [refresh])

  return { events, loading, tokenExpired, refresh }
}
