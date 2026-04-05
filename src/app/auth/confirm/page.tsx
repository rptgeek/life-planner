'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Implicit flow: session is in the URL hash, getSession() picks it up automatically
    createClient()
      .auth.getSession()
      .then(({ data, error }) => {
        if (error || !data.session) {
          const msg = error?.message ?? 'No session returned'
          console.error('auth confirm error:', msg)
          router.replace(`/login?error=${encodeURIComponent(msg)}`)
        } else {
          // Cache the Google provider token for Calendar API use
          if (data.session.provider_token) {
            sessionStorage.setItem('gcal_token', data.session.provider_token)
          }
          router.replace('/dashboard')
        }
      })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="animate-pulse text-indigo-300 text-sm">Signing in…</div>
    </div>
  )
}
