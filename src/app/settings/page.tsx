'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Palette, Settings as SettingsIcon, CalendarDays } from 'lucide-react'
import { useCategories, useRoles, useProfile } from '@/lib/hooks'
import CalendarPreferencesPanel from '@/components/CalendarPreferencesPanel'
import { getCachedCalendarToken } from '@/lib/useGoogleCalendarToken'

const COLOR_OPTIONS = [
  '#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b', '#10b981',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16',
  '#06b6d4', '#a855f7', '#e11d48', '#0ea5e9', '#d946ef',
]

export default function SettingsPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { roles, addRole, updateRole, deleteRole } = useRoles()
  const { profile, updateProfile } = useProfile()

  // Category form state
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  // Role form state
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleColor, setNewRoleColor] = useState('#6366f1')
  const [newRoleCategoryId, setNewRoleCategoryId] = useState('')
  const [showAddRole, setShowAddRole] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editRoleName, setEditRoleName] = useState('')
  const [editRoleColor, setEditRoleColor] = useState('')

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)

  // Calendar token state
  const [calToken, setCalToken] = useState<string | null>(null)

  useEffect(() => {
    setCalToken(getCachedCalendarToken())
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await addCategory(newName.trim(), newColor, 'folder')
    setNewName('')
    setNewColor('#6366f1')
    setShowAdd(false)
  }

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id)
    setEditName(name)
    setEditColor(color)
  }

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    await updateCategory(editingId, { name: editName.trim(), color: editColor })
    setEditingId(null)
  }

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName.trim() || null })
    setEditingProfile(false)
  }

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    await addRole(newRoleName.trim(), newRoleColor, newRoleCategoryId || null)
    setNewRoleName('')
    setNewRoleColor('#6366f1')
    setNewRoleCategoryId('')
    setShowAddRole(false)
  }

  const startEditRole = (id: string, name: string, color: string) => {
    setEditingRoleId(id)
    setEditRoleName(name)
    setEditRoleColor(color)
  }

  const saveEditRole = async () => {
    if (!editingRoleId || !editRoleName.trim()) return
    await updateRole(editingRoleId, { name: editRoleName.trim(), color: editRoleColor })
    setEditingRoleId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize your Life Planner</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Profile</h3>
        </div>
        {editingProfile ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
              autoFocus
            />
            <button onClick={handleSaveProfile} className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg">
              <Save size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">{profile?.display_name || 'No name set'}</p>
              <p className="text-xs text-slate-400">Display name</p>
            </div>
            <button
              onClick={() => {
                setDisplayName(profile?.display_name || '')
                setEditingProfile(true)
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Google Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-indigo-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Google Calendar</h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose which calendars to display and set a default push target</p>
          </div>
        </div>
        <CalendarPreferencesPanel token={calToken} onTokenChange={setCalToken} />
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Life Categories</h3>
            <p className="text-xs text-slate-400 mt-0.5">Organize your tasks and goals by area of life</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={12} />
            Add Category
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddCategory} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
              autoFocus
            />
            <div>
              <label className="text-xs text-slate-500 block mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newColor === color ? 'ring-2 ring-offset-1 ring-indigo-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-500 px-3 py-1.5">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
              {editingId === cat.id ? (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: editColor }} />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-300"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.slice(0, 8).map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditColor(color)}
                        className={`w-4 h-4 rounded-full ${editColor === color ? 'ring-1 ring-offset-1 ring-indigo-400' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button onClick={saveEdit} className="text-green-600 hover:text-green-800 p-1">
                    <Save size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm text-slate-700">{cat.name}</span>
                  <button
                    onClick={() => startEdit(cat.id, cat.name, cat.color)}
                    className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 text-xs transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}" category? Tasks in this category will become uncategorized.`)) {
                        deleteCategory(cat.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Roles</h3>
            <p className="text-xs text-slate-400 mt-0.5">Define your life roles (e.g. Father, Husband, Leader)</p>
          </div>
          <button
            onClick={() => setShowAddRole(!showAddRole)}
            className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={12} />
            Add Role
          </button>
        </div>

        {showAddRole && (
          <form onSubmit={handleAddRole} className="mb-4 p-3 bg-slate-50 rounded-lg space-y-2">
            <input
              type="text"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              placeholder="Role name (e.g. Father, Leader)"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
              autoFocus
            />
            <div>
              <label className="text-xs text-slate-500 block mb-1">Category (optional)</label>
              <select
                value={newRoleCategoryId}
                onChange={e => setNewRoleCategoryId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">None</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewRoleColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newRoleColor === color ? 'ring-2 ring-offset-1 ring-indigo-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg">Add</button>
              <button type="button" onClick={() => setShowAddRole(false)} className="text-xs text-slate-500 px-3 py-1.5">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {roles.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">No roles yet. Add one to get started.</p>
          )}
          {roles.map(role => (
            <div key={role.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
              {editingRoleId === role.id ? (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: editRoleColor }} />
                  <input
                    type="text"
                    value={editRoleName}
                    onChange={e => setEditRoleName(e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-300"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.slice(0, 8).map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditRoleColor(color)}
                        className={`w-4 h-4 rounded-full ${editRoleColor === color ? 'ring-1 ring-offset-1 ring-indigo-400' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button onClick={saveEditRole} className="text-green-600 hover:text-green-800 p-1">
                    <Save size={14} />
                  </button>
                  <button onClick={() => setEditingRoleId(null)} className="text-slate-400 text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-700">{role.name}</span>
                    {role.category && (
                      <span className="ml-2 text-xs text-slate-400">({role.category.name})</span>
                    )}
                  </div>
                  <button
                    onClick={() => startEditRole(role.id, role.name, role.color)}
                    className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 text-xs transition-opacity"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${role.name}" role? Goals and tasks in this role will become unassigned.`)) {
                        deleteRole(role.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">About Life Planner</h3>
        </div>
        <p className="text-xs text-slate-500">
          Built with Next.js, Supabase, and Tailwind CSS.
          Your data is stored securely in the cloud and synced across all your devices.
        </p>
        <div className="flex gap-4 mt-3">
          <a href="/privacy" className="text-xs text-indigo-500 hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-xs text-indigo-500 hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}
