'use client'
import { useProfile } from './hooks'

export function useCalendarPreferences() {
  const { profile, updateProfile } = useProfile()

  const selectedIds: string[] = profile?.selected_calendar_ids ?? []
  const defaultPushId: string | null = profile?.default_push_calendar_id ?? null
  const hasConfigured = profile?.selected_calendar_ids !== null

  const savePreferences = async (ids: string[], pushId: string | null) => {
    await updateProfile({
      selected_calendar_ids: ids,
      default_push_calendar_id: pushId,
    })
  }

  return { selectedIds, defaultPushId, hasConfigured, savePreferences }
}
