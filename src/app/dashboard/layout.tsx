'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useProfile, useValues } from '@/lib/hooks'
import Sidebar from '@/components/Sidebar'
import OnboardingWizard from '@/components/OnboardingWizard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const { profile } = useProfile()
  const { values } = useValues()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Determine whether to show onboarding once profile + values have loaded
  useEffect(() => {
    if (!user || loading) return
    if (profile === null) return // still loading
    if (onboardingChecked) return

    const alreadyDone = localStorage.getItem('onboarding_complete') === '1'
    if (!alreadyDone && !profile.mission_statement && values.length === 0) {
      setShowOnboarding(true)
    }
    setOnboardingChecked(true)
  }, [user, loading, profile, values, onboardingChecked])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
