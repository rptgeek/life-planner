'use client'

import { useState, useEffect } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Category, Goal } from '@/lib/types'
import { autoCategorize } from '@/lib/categorize'

interface TaskFormProps {
  categories: Category[]
  goals: Goal[]
  scheduledDate?: string
  onSubmit: (task: {
    title: string
    description: string
    priority: 'A' | 'B' | 'C'
    category_id: string | null
    goal_id: string | null
    scheduled_date: string | null
    due_date: string | null
  }) => Promise<void>
}

export default function TaskForm({ categories, goals, scheduledDate, onSubmit }: TaskFormProps) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'A' | 'B' | 'C'>('B')
  const [categoryId, setCategoryId] = useState<string>('')
  const [goalId, setGoalId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [autoSuggested, setAutoSuggested] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Auto-categorize as user types
  useEffect(() => {
    if (title.length < 3 || categoryId) return
    const timer = setTimeout(() => {
      const suggested = autoCategorize(title, description, categories)
      if (suggested && !categoryId) {
        setCategoryId(suggested.id)
        setAutoSuggested(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [title, description, categories, categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      category_id: categoryId || null,
      goal_id: goalId || null,
      scheduled_date: scheduledDate || null,
      due_date: dueDate || null,
    })
    setTitle('')
    setDescription('')
    setPriority('B')
    setCategoryId('')
    setGoalId('')
    setDueDate('')
    setAutoSuggested(false)
    setExpanded(false)
    setSubmitting(false)
  }

  // Quick-add mode (just title + enter)
  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !expanded) {
      e.preventDefault()
      if (title.trim()) {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const selectedCategory = categories.find(c => c.id === categoryId)

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 p-3">
        <Plus size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setAutoSuggested(false); setCategoryId('') }}
          onKeyDown={handleQuickAdd}
          placeholder="Add a task... (press Enter for quick add)"
          className="flex-1 text-sm outline-none placeholder:text-slate-400"
        />
        {autoSuggested && selectedCategory && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}>
            <Sparkles size={12} />
            {selectedCategory.name}
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-3">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Priority */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Priority</label>
              <div className="flex gap-1">
                {(['A', 'B', 'C'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-xs font-bold py-1.5 rounded transition-colors ${
                      priority === p
                        ? p === 'A' ? 'bg-red-500 text-white'
                        : p === 'B' ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setAutoSuggested(false) }}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">Auto</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Linked Goal</label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">None</option>
                {goals.filter(g => g.status === 'active').map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      )}
    </form>
  )
}
