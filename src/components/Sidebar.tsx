'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, Compass, CalendarDays,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/lib/hooks'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Daily Planner', icon: LayoutDashboard },
  { href: '/weekly', label: 'Weekly View', icon: CalendarDays },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/mission', label: 'Mission & Values', icon: Compass },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { profile } = useProfile()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 z-50">
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu size={24} />
        </button>
        <span className="ml-3 text-white font-semibold text-lg">Life Planner</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Life Planner</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {profile?.display_name || 'Welcome'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Mission statement preview */}
          {profile?.mission_statement && (
            <div className="px-5 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-400 italic line-clamp-2">
                &ldquo;{profile.mission_statement}&rdquo;
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 px-5 py-3 text-sm transition-colors
                    ${active
                      ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon size={18} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-1 py-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
