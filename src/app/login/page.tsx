'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Target, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Target size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Life Planner</h1>
          <p className="text-indigo-300 mt-2 text-sm">
            Plan your day. Achieve your goals. Live your mission.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800">Welcome</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to start planning</p>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            {loading ? 'Connecting...' : 'Continue with GitHub'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Your data is private and synced securely across all your devices.
          </p>
        </div>

        {/* Franklin Planner tagline */}
        <p className="text-center text-indigo-400/50 text-xs mt-8">
          Inspired by the Franklin Planner system
        </p>
      </div>
    </div>
  )
}
