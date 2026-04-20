'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { X, ChevronRight, ChevronLeft, Sparkles, Target, ArrowRight, Plus, Check, RotateCcw, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser, useProfile, useGoals, useCategories, useRoles } from '@/lib/hooks'
import { Task, Goal } from '@/lib/types'

interface PlanMyDayProps {
  selectedDate: string
  onClose: () => void
  onTasksAdded: () => void
}

const TOTAL_STEPS = 5

export default function PlanMyDay({ selectedDate, onClose, onTasksAdded }: PlanMyDayProps) {
  const { user } = useUser()
  const { profile } = useProfile()
  const { goals } = useGoals()
  const { categories } = useCategories()
  const { roles } = useRoles()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [intention, setIntention] = useState('')
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([])
  const [selectedCarryForward, setSelectedCarryForward] = useState<Set<string>>(new Set())
  const [goalTasks, setGoalTasks] = useState<Record<string, { title: string; priority: 'A' | 'B' | 'C' }[]>>({})
  const [quickTasks, setQuickTasks] = useState<{ title: string; priority: 'A' | 'B' | 'C'; category_id: string }[]>([])
  const [quickTitle, setQuickTitle] = useState('')
  const [quickPriority, setQuickPriority] = useState<'A' | 'B' | 'C'>('B')
  const [quickCategory, setQuickCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const activeShortTermGoals = goals.filter(g => g.goal_type === 'short_term' && g.status === 'active')

  const fetchYesterdayTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*, category:categories(*), role:roles(*)')
      .eq('user_id', user.id)
      .lt('scheduled_date', selectedDate)
      .order('scheduled_date', { ascending: false })
    // Deduplicate by title — keep only the most recent version of each task.
    // If the most recent version was completed, exclude it entirely so previously
    // checked-off tasks don't reappear here.
    const seen = new Set<string>()
    const deduped = (data || []).filter(task => {
      if (seen.has(task.title)) return false
      seen.add(task.title)
      return !task.completed
    })
    setYesterdayTasks(deduped)
  }, [user, selectedDate])

  useEffect(() => { fetchYesterdayTasks() }, [fetchYesterdayTasks])

  // Initialize goalTasks state
  useEffect(() => {
    const initial: Record<string, { title: string; priority: 'A' | 'B' | 'C' }[]> = {}
    activeShortTermGoals.forEach(g => { initial[g.id] = [] })
    setGoalTasks(initial)
  }, [goals])

  const addGoalTask = (goalId: string) => {
    setGoalTasks(prev => ({
      ...prev,
      [goalId]: [...(prev[goalId] || []), { title: '', priority: 'B' }],
    }))
  }

  const updateGoalTask = (goalId: string, index: number, updates: Partial<{ title: string; priority: 'A' | 'B' | 'C' }>) => {
    setGoalTasks(prev => ({
      ...prev,
      [goalId]: prev[goalId].map((t, i) => i === index ? { ...t, ...updates } : t),
    }))
  }

  const removeGoalTask = (goalId: string, index: number) => {
    setGoalTasks(prev => ({
      ...prev,
      [goalId]: prev[goalId].filter((_, i) => i !== index),
    }))
  }

  const addQuickTask = () => {
    if (!quickTitle.trim()) return
    setQuickTasks(prev => [...prev, { title: quickTitle.trim(), priority: quickPriority, category_id: quickCategory }])
    setQuickTitle('')
    setQuickPriority('B')
    setQuickCategory('')
  }

  const toggleCarryForward = (id: string) => {
    setSelectedCarryForward(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)

    const tasksToInsert: Partial<Task>[] = []

    // Carry-forward tasks
    for (const task of yesterdayTasks) {
      if (selectedCarryForward.has(task.id)) {
        tasksToInsert.push({
          user_id: user.id,
          title: task.title,
          priority: task.priority,
          category_id: task.category_id,
          role_id: task.role_id,
          goal_id: task.goal_id,
          scheduled_date: selectedDate,
          completed: false,
        })
      }
    }

    // Goal-linked tasks
    for (const [goalId, tasks] of Object.entries(goalTasks)) {
      for (const t of tasks) {
        if (!t.title.trim()) continue
        const goal = goals.find(g => g.id === goalId)
        tasksToInsert.push({
          user_id: user.id,
          title: t.title.trim(),
          priority: t.priority,
          category_id: goal?.category_id || null,
          role_id: goal?.role_id || null,
          goal_id: goalId,
          scheduled_date: selectedDate,
          completed: false,
        })
      }
    }

    // Quick tasks
    for (const t of quickTasks) {
      tasksToInsert.push({
        user_id: user.id,
        title: t.title,
        priority: t.priority,
        category_id: t.category_id || null,
        scheduled_date: selectedDate,
        completed: false,
      })
    }

    if (tasksToInsert.length > 0) {
      await supabase.from('tasks').insert(tasksToInsert)
    }

    // Save intention as a reflection note
    if (intention.trim()) {
      await supabase.from('daily_reflections').upsert({
        user_id: user.id,
        reflection_date: selectedDate,
        notes: `Daily intention: ${intention.trim()}`,
      }, { onConflict: 'user_id,reflection_date' })
    }

    onTasksAdded()
    onClose()
  }

  const stepTitles = [
    'Morning Intention',
    'Review Your Goals',
    'Carry Forward',
    'Add More Tasks',
    'Review & Finish',
  ]

  const stepSubtitles = [
    'Start with purpose',
    'What will you move forward today?',
    yesterdayTasks.length > 0 ? `${yesterdayTasks.length} incomplete from previous days` : 'Nothing left over',
    'Anything else on your plate?',
    "You're ready. Let's go.",
  ]

  const canProceed = () => {
    if (step === 4 && quickTitle.trim()) return false // remind to add pending input
    return true
  }

  const allPlannedTasks = [
    ...yesterdayTasks.filter(t => selectedCarryForward.has(t.id)),
    ...Object.entries(goalTasks).flatMap(([goalId, tasks]) =>
      tasks.filter(t => t.title.trim()).map(t => ({
        ...t,
        goal: goals.find(g => g.id === goalId),
      }))
    ),
    ...quickTasks,
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sun size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Plan My Day</h2>
              <p className="text-xs text-slate-400">{format(new Date(selectedDate), 'EEEE, MMMM d')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1.5 mb-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-indigo-500' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">{stepTitles[step - 1]}</p>
            <p className="text-xs text-slate-400">{stepSubtitles[step - 1]}</p>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Step 1: Morning Intention */}
          {step === 1 && (
            <div className="space-y-5">
              {profile?.mission_statement && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-xs text-indigo-400 mb-1 font-medium">Your Mission</p>
                  <p className="text-sm text-indigo-700 italic leading-relaxed">&ldquo;{profile.mission_statement}&rdquo;</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  What is your intention for today?
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  One sentence — what does a successful day look like for you?
                </p>
                <textarea
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="Today I will focus on… / Today is a win if I…"
                  rows={3}
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-300 resize-none leading-relaxed"
                />
              </div>

              {roles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Roles Today</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                      <span
                        key={role.id}
                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ backgroundColor: role.color + '20', color: role.color }}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Goals → Tasks */}
          {step === 2 && (
            <div className="space-y-4">
              {activeShortTermGoals.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl">
                  <Target size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No active short-term goals yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Add goals on the Goals page to use this step.</p>
                </div>
              ) : (
                activeShortTermGoals.map(goal => (
                  <GoalTaskSection
                    key={goal.id}
                    goal={goal}
                    tasks={goalTasks[goal.id] || []}
                    onAdd={() => addGoalTask(goal.id)}
                    onUpdate={(i, u) => updateGoalTask(goal.id, i, u)}
                    onRemove={i => removeGoalTask(goal.id, i)}
                  />
                ))
              )}
            </div>
          )}

          {/* Step 3: Carry Forward */}
          {step === 3 && (
            <div className="space-y-3">
              {yesterdayTasks.length === 0 ? (
                <div className="text-center py-10 bg-green-50 border border-green-100 rounded-xl">
                  <Check size={32} className="mx-auto text-green-400 mb-2" />
                  <p className="text-sm text-green-700 font-medium">Clean slate!</p>
                  <p className="text-xs text-green-600 mt-1">No incomplete tasks from previous days.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Select tasks to carry forward:</p>
                    <button
                      onClick={() => {
                        const allSelected = yesterdayTasks.every(t => selectedCarryForward.has(t.id))
                        setSelectedCarryForward(allSelected ? new Set() : new Set(yesterdayTasks.map(t => t.id)))
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {yesterdayTasks.every(t => selectedCarryForward.has(t.id)) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  {yesterdayTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleCarryForward(task.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        selectedCarryForward.has(task.id)
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedCarryForward.has(task.id)
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-300'
                      }`}>
                        {selectedCarryForward.has(task.id) && <Check size={11} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{task.title}</p>
                        {task.category && (
                          <p className="text-xs mt-0.5" style={{ color: task.category.color }}>{task.category.name}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'A' ? 'bg-red-100 text-red-700' :
                        task.priority === 'B' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                      <RotateCcw size={14} className="text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Step 4: Quick Add */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addQuickTask() }}
                  placeholder="Task title…"
                  autoFocus
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 bg-white"
                />
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {(['A', 'B', 'C'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setQuickPriority(p)}
                        className={`text-xs font-bold w-7 h-7 rounded transition-colors ${
                          quickPriority === p
                            ? p === 'A' ? 'bg-red-500 text-white' : p === 'B' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <select
                    value={quickCategory}
                    onChange={e => setQuickCategory(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none bg-white"
                  >
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button
                    onClick={addQuickTask}
                    disabled={!quickTitle.trim()}
                    className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              </div>

              {quickTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Added this step:</p>
                  {quickTasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'A' ? 'bg-red-100 text-red-700' :
                        t.priority === 'B' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{t.priority}</span>
                      <span className="flex-1 text-sm text-slate-700">{t.title}</span>
                      <button onClick={() => setQuickTasks(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              {allPlannedTasks.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Sparkles size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No tasks planned yet — that&apos;s okay.</p>
                  <p className="text-xs text-slate-400 mt-1">You can add tasks directly on the daily planner.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">{allPlannedTasks.length} task{allPlannedTasks.length !== 1 ? 's' : ''}</strong> will be added to your plan for today.
                  </p>

                  {(['A', 'B', 'C'] as const).map(priority => {
                    const group = allPlannedTasks.filter(t => 'priority' in t && t.priority === priority)
                    if (group.length === 0) return null
                    const colors = { A: 'text-red-600', B: 'text-amber-600', C: 'text-blue-600' }
                    const labels = { A: 'Must Do', B: 'Should Do', C: 'Could Do' }
                    return (
                      <div key={priority}>
                        <p className={`text-xs font-bold ${colors[priority]} uppercase tracking-wider mb-2`}>
                          Priority {priority} — {labels[priority]} ({group.length})
                        </p>
                        <div className="space-y-1.5">
                          {group.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                              <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                              <span className="text-sm text-slate-700 flex-1">{'title' in t ? t.title : ''}</span>
                              {'goal' in t && t.goal && (
                                <span className="text-xs text-slate-400 hidden sm:inline">{(t.goal as Goal).title}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}

              {intention && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-medium text-amber-700 mb-0.5">Today&apos;s Intention</p>
                  <p className="text-sm text-amber-800 italic">&ldquo;{intention}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <span className="text-xs text-slate-400">{step} of {TOTAL_STEPS}</span>

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : (
                <>
                  <Check size={16} />
                  Start My Day
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Sub-component for goal task entry in step 2
function GoalTaskSection({
  goal,
  tasks,
  onAdd,
  onUpdate,
  onRemove,
}: {
  goal: Goal
  tasks: { title: string; priority: 'A' | 'B' | 'C' }[]
  onAdd: () => void
  onUpdate: (i: number, u: Partial<{ title: string; priority: 'A' | 'B' | 'C' }>) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
        <Target size={14} className="text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{goal.title}</p>
          {goal.category && (
            <p className="text-xs mt-0.5" style={{ color: goal.category.color }}>{goal.category.name}</p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Plus size={12} />
          Add task
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {(['A', 'B', 'C'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => onUpdate(i, { priority: p })}
                    className={`text-xs font-bold w-5 h-5 rounded transition-colors ${
                      task.priority === p
                        ? p === 'A' ? 'bg-red-500 text-white' : p === 'B' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={task.title}
                onChange={e => onUpdate(i, { title: e.target.value })}
                placeholder="What specifically will you do?"
                autoFocus={task.title === ''}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-300"
              />
              <button onClick={() => onRemove(i)} className="text-slate-300 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-slate-400">No tasks planned for this goal today</p>
        </div>
      )}
    </div>
  )
}
