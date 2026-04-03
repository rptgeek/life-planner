'use client'

import { useState } from 'react'
import { Target, Plus, ChevronDown, ChevronRight, Trash2, Check, ArrowRight } from 'lucide-react'
import { useGoals, useCategories, useRoles } from '@/lib/hooks'
import { Goal } from '@/lib/types'

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals()
  const { categories } = useCategories()
  const { roles } = useRoles()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'long_term' | 'short_term'>('all')
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalType, setGoalType] = useState<'long_term' | 'short_term'>('long_term')
  const [categoryId, setCategoryId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [parentGoalId, setParentGoalId] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const longTermGoals = goals.filter(g => g.goal_type === 'long_term' && g.status === 'active')
  const shortTermGoals = goals.filter(g => g.goal_type === 'short_term' && g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  const filteredGoals = filter === 'all'
    ? goals.filter(g => g.status === 'active')
    : goals.filter(g => g.goal_type === filter && g.status === 'active')

  const toggleExpand = (id: string) => {
    const next = new Set(expandedGoals)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpandedGoals(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await addGoal({
      title: title.trim(),
      description: description.trim() || null,
      goal_type: goalType,
      category_id: categoryId || null,
      role_id: roleId || null,
      parent_goal_id: parentGoalId || null,
      target_date: targetDate || null,
    })
    setTitle('')
    setDescription('')
    setTargetDate('')
    setRoleId('')
    setParentGoalId('')
    setShowForm(false)
  }

  const getChildGoals = (parentId: string) =>
    goals.filter(g => g.parent_goal_id === parentId && g.status === 'active')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Goals</h1>
          <p className="text-sm text-slate-500 mt-1">
            {longTermGoals.length} long-term &middot; {shortTermGoals.length} short-term &middot; {completedGoals.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      {/* Productivity Pyramid */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Productivity Pyramid</h3>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="bg-red-100 text-red-700 text-xs font-medium px-6 py-2 rounded-t-lg w-32">
            Daily Tasks
          </div>
          <div className="bg-amber-100 text-amber-700 text-xs font-medium px-6 py-2 w-44">
            Short-term ({shortTermGoals.length})
          </div>
          <div className="bg-blue-100 text-blue-700 text-xs font-medium px-6 py-2 w-56">
            Long-term ({longTermGoals.length})
          </div>
          <div className="bg-indigo-100 text-indigo-700 text-xs font-medium px-6 py-2 rounded-b-lg w-68">
            Mission & Values
          </div>
        </div>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Create New Goal</h3>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
            autoFocus
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe this goal in detail..."
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Type</label>
              <select
                value={goalType}
                onChange={e => setGoalType(e.target.value as 'long_term' | 'short_term')}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="long_term">Long-term (1-3 yrs)</option>
                <option value="short_term">Short-term (30-90 days)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Role</label>
              <select
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">None</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Parent Goal</label>
              <select
                value={parentGoalId}
                onChange={e => setParentGoalId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">None</option>
                {longTermGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
              Create Goal
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Active' },
          { key: 'long_term', label: 'Long-term' },
          { key: 'short_term', label: 'Short-term' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`flex-1 text-xs py-2 rounded-md transition-colors ${
              filter === tab.key ? 'bg-white shadow text-slate-800 font-medium' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Target size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No goals yet. Start by defining what matters most.</p>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const children = getChildGoals(goal.id)
            const expanded = expandedGoals.has(goal.id)
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  {children.length > 0 && (
                    <button onClick={() => toggleExpand(goal.id)} className="text-slate-400 hover:text-slate-600">
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-slate-800 truncate">{goal.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.goal_type === 'long_term' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {goal.goal_type === 'long_term' ? 'Long-term' : 'Short-term'}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {goal.category && (
                        <span className="text-xs" style={{ color: goal.category.color }}>
                          {goal.category.name}
                        </span>
                      )}
                      {goal.role && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: goal.role.color + '20', color: goal.role.color }}>
                          {goal.role.name}
                        </span>
                      )}
                      {goal.target_date && (
                        <span className="text-xs text-slate-400">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                      {children.length > 0 && (
                        <span className="text-xs text-slate-400">
                          {children.length} sub-goal{children.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => updateGoal(goal.id, { status: 'completed' })}
                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Mark completed"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Child goals */}
                {expanded && children.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 space-y-2">
                    {children.map(child => (
                      <div key={child.id} className="flex items-center gap-2 py-1.5 px-2">
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="text-xs text-slate-600 flex-1">{child.title}</span>
                        {child.category && (
                          <span className="text-xs" style={{ color: child.category.color }}>{child.category.name}</span>
                        )}
                        <button
                          onClick={() => updateGoal(child.id, { status: 'completed' })}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Completed ({completedGoals.length})
          </h3>
          <div className="space-y-2">
            {completedGoals.slice(0, 5).map(goal => (
              <div key={goal.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-3 opacity-60">
                <Check size={14} className="text-green-500" />
                <span className="text-sm text-slate-500 line-through">{goal.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
