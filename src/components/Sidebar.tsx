'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, Compass, CalendarDays,
  Settings, LogOut, Menu, X, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/lib/hooks'
import { APP_VERSION } from '@/lib/version'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Daily Planner', icon: LayoutDashboard },
  { href: '/weekly', label: 'Weekly View', icon: CalendarDays },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/mission', label: 'Mission & Values', icon: Compass },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
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
        <button onClick={() => setMobileOpen(true)} className="text-white p-1">
          <Menu size={24} />
        </button>
        <span className="ml-3 text-white font-semibold text-lg">Life Planner</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-slate-900 text-white z-50
        transform transition-all duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${collapsed ? 'w-14' : 'w-64'}
        no-print
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-3 border-b border-slate-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">Life Planner</h1>
                <p className="text-slate-400 text-sm mt-0.5 truncate">
                  {profile?.display_name || 'Welcome'}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1">
              {/* Desktop collapse toggle */}
              <button
                onClick={() => setCollapsed(c => !c)}
                className="hidden lg:flex text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
              {/* Mobile close */}
              <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1.5">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mission statement preview — hidden when collapsed */}
          {!collapsed && profile?.mission_statement && (
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
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 py-3 text-sm transition-colors
                    ${collapsed ? 'justify-center px-0' : 'px-5'}
                    ${active
                      ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon size={18} />
                  {!collapsed && (
                    <>
                      {item.label}
                      {active && <ChevronRight size={14} className="ml-auto" />}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout + version */}
          <div className={`p-4 border-t border-slate-700 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              className={`flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2 ${collapsed ? '' : 'w-full px-1'}`}
            >
              <LogOut size={16} />
              {!collapsed && 'Sign Out'}
            </button>
            {!collapsed && <p className="text-xs text-slate-600 px-1 mt-1">v{APP_VERSION}</p>}
          </div>
        </div>
      </aside>
    </>
  )
}
