'use client'

// Google Identity Services token client for Calendar access.
// Separate from Supabase login — shows a popup asking for Calendar permission only.

const SCOPES = 'https://www.googleapis.com/auth/calendar'
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let gisLoaded = false
let gisLoading: Promise<void> | null = null

declare global {
  interface Window {
    google: typeof google
  }
}

// Call this on page load to pre-load the GIS script so it's ready by the time
// the user clicks "Connect Google Calendar". Without pre-loading, the async
// script fetch happens inside the click handler and browsers block the popup.
export function preloadGIS(): void {
  if (typeof window === 'undefined') return
  if (gisLoaded || gisLoading) return
  gisLoading = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { gisLoaded = true; resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      gisLoaded = true
      // Pre-initialize the token client so requestAccessToken is instant
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}, // placeholder — replaced on each request
      })
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Call directly from a click handler (synchronous user gesture path).
// GIS must already be loaded via preloadGIS().
export function requestCalendarToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!gisLoaded || !tokenClient) {
      // Fallback: try loading now (may be blocked by popup blocker)
      preloadGIS()
      gisLoading?.then(() => doRequest(resolve, reject)).catch(reject)
      return
    }
    doRequest(resolve, reject)
  })
}

function doRequest(
  resolve: (token: string) => void,
  reject: (err: Error) => void
) {
  // Re-initialize with the real callback so response is captured
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: google.accounts.oauth2.TokenResponse) => {
      if ((response as unknown as { error?: string }).error) {
        reject(new Error((response as unknown as { error: string }).error))
        return
      }
      sessionStorage.setItem('gcal_token', response.access_token)
      sessionStorage.setItem('gcal_token_expiry', String(Date.now() + 3500 * 1000))
      resolve(response.access_token)
    },
  })
  tokenClient.requestAccessToken({ prompt: 'consent' })
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
