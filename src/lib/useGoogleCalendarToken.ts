'use client'

// Google Identity Services token client for Calendar access.
// Separate from Supabase login — shows a popup asking for Calendar permission only.

const SCOPES = 'https://www.googleapis.com/auth/calendar'
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

let tokenClient: google.accounts.oauth2.TokenClient | null = null

declare global {
  interface Window {
    google: typeof google
  }
}

function loadGIS(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export async function requestCalendarToken(): Promise<string> {
  await loadGIS()
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        sessionStorage.setItem('gcal_token', response.access_token)
        // Store expiry (~1hr from now)
        sessionStorage.setItem('gcal_token_expiry', String(Date.now() + 3500 * 1000))
        resolve(response.access_token)
      },
    })
    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export function getCachedCalendarToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = sessionStorage.getItem('gcal_token')
  const expiry = Number(sessionStorage.getItem('gcal_token_expiry') ?? 0)
  if (!token || Date.now() > expiry) return null
  return token
}

export function clearCalendarToken() {
  sessionStorage.removeItem('gcal_token')
  sessionStorage.removeItem('gcal_token_expiry')
}
