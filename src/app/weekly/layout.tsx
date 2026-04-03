'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks'
import Sidebar from '@/components/Sidebar'

export default function WeeklyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>
  if (!user) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
