'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useUser } from '@/lib/hooks'
import { Task } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function WeeklyPage() {
  const { user } = useUser()
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [weekTasks, setWeekTasks] = useState<Task[]>([])
  const supabase = createClient()

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 6)

  const fetchWeekTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('scheduled_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
      .order('priority')
      .order('sort_order')
    setWeekTasks(data || [])
  }, [user, weekStart])

  useEffect(() => { fetchWeekTasks() }, [fetchWeekTasks])

  const getTasksForDay = (date: Date) =>
    weekTasks.filter(t => t.scheduled_date === format(date, 'yyyy-MM-dd'))

  const isToday = (date: Date) => isSameDay(date, new Date())

  const getCompletionStats = () => {
    const completed = weekTasks.filter(t => t.completed).length
    const total = weekTasks.length
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const stats = getCompletionStats()

  // Category breakdown
  const categoryBreakdown = weekTasks.reduce((acc, t) => {
    const name = t.category?.name || 'Uncategorized'
    const color = t.category?.color || '#94a3b8'
    if (!acc[name]) acc[name] = { count: 0, color, completed: 0 }
    acc[name].count++
    if (t.completed) acc[name].completed++
    return acc
  }, {} as Record<string, { count: number; color: string; completed: number }>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Weekly View</h1>

        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-1.5 shadow-sm">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.total - stats.completed}</p>
          <p className="text-xs text-slate-500">Remaining</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-2xl font-bold text-slate-600">{stats.pct}%</p>
          <p className="text-xs text-slate-500">Completion</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Category Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryBreakdown).map(([name, data]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="text-xs text-slate-600">
                  {name}: {data.completed}/{data.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayTasks = getTasksForDay(day)
          const today = isToday(day)
          return (
            <div
              key={day.toISOString()}
              onClick={() => router.push(`/dashboard`)}
              className={`
                bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md transition-shadow min-h-[120px]
                ${today ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${today ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className={`
                  text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                  ${today ? 'bg-indigo-600 text-white' : 'text-slate-700'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center mt-4">No tasks</p>
                ) : (
                  dayTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-1.5">
                      {task.completed ? (
                        <Check size={10} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.category?.color || '#94a3b8' }}
                        />
                      )}
                      <span className={`text-xs truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
                {dayTasks.length > 5 && (
                  <p className="text-xs text-slate-400">+{dayTasks.length - 5} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Review Prompt (show on Fridays or weekends) */}
      {weekDays.some(d => isToday(d) && [5, 6, 0].includes(d.getDay())) && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Weekly Review</h3>
          </div>
          <div className="text-xs text-amber-700 space-y-1">
            <p>Take a few minutes to reflect on your week:</p>
            <p>&bull; What were your biggest wins this week?</p>
            <p>&bull; Which goals did you make progress on?</p>
            <p>&bull; What will you prioritize next week?</p>
            <p>&bull; Are your daily tasks aligned with your long-term goals?</p>
          </div>
        </div>
      )}
    </div>
  )
}
