'use client'

import { useState } from 'react'
import { Check, Circle, Trash2, ChevronDown, ChevronUp, Link2, Calendar, GripVertical, Pencil, CalendarArrowUp, Clock, CalendarCheck, CalendarX } from 'lucide-react'
import { Task, Category, Role } from '@/lib/types'
import { format } from 'date-fns'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getGoogleToken, GoogleTokenExpiredError } from '@/lib/googleCalendar'
import { useCalendarPreferences } from '@/lib/useCalendarPreferences'

interface TaskCardProps {
  task: Task
  orderNum: number
  categories: Category[]
  roles: Role[]
  dragHandleProps?: DraggableProvidedDragHandleProps | null
  onToggle: (id: string, updates: { in_progress?: boolean; completed?: boolean }) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export default function TaskCard({ task, orderNum, categories, roles, dragHandleProps, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const [showPushDate, setShowPushDate] = useState(false)
  const [pushDate, setPushDate] = useState('')
  const [startTime, setStartTime] = useState(task.start_time?.slice(0, 5) ?? '')
  const [durationMin, setDurationMin] = useState(task.duration_minutes ?? 30)
  const [calSyncing, setCalSyncing] = useState(false)
  const [calError, setCalError] = useState<string | null>(null)
  const { defaultPushId } = useCalendarPreferences()

  const priorityStyles = {
    A: 'border-l-red-500 bg-red-50/50',
    B: 'border-l-amber-500 bg-amber-50/30',
    C: 'border-l-blue-500 bg-blue-50/30',
    D: 'border-l-purple-500 bg-purple-50/30',
  }

  const priorityBadge = {
    A: 'bg-red-100 text-red-700',
    B: 'bg-amber-100 text-amber-700',
    C: 'bg-blue-100 text-blue-700',
    D: 'bg-purple-100 text-purple-700',
  }

  const saveTitle = () => {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed })
    } else {
      setTitleDraft(task.title)
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle()
    if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false) }
  }

  return (
    <div className={`
      border-l-4 rounded-lg border border-slate-200 transition-all duration-200
      ${priorityStyles[task.priority]}
      ${task.completed ? 'opacity-50' : task.in_progress ? 'ring-1 ring-amber-300' : ''}
    `}>
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <div {...dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical size={16} />
        </div>

        {/* Order number */}
        <span className={`text-xs font-bold flex-shrink-0 w-6 text-center ${priorityBadge[task.priority]} rounded px-1`}>
          {task.priority}{orderNum}
        </span>

        {/* Three-state toggle: empty → in-progress (dot) → completed (check) → empty */}
        <button
          onClick={() => {
            if (task.completed) {
              onToggle(task.id, { completed: false, in_progress: false })
            } else if (task.in_progress) {
              onToggle(task.id, { completed: true, in_progress: false })
            } else {
              onToggle(task.id, { in_progress: true, completed: false })
            }
          }}
          title={task.completed ? 'Mark incomplete' : task.in_progress ? 'Mark complete' : 'Mark in progress'}
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : task.in_progress
              ? 'border-amber-400 hover:border-green-400'
              : 'border-slate-300 hover:border-amber-400'}
          `}
        >
          {task.completed
            ? <Check size={12} />
            : task.in_progress
            ? <Circle size={7} className="fill-amber-400 text-amber-400" />
            : null}
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-sm outline-none bg-white border border-indigo-300 rounded px-2 py-0.5"
            />
          ) : (
            <div className="flex items-center gap-1 group/title">
              <p
                className={`text-sm truncate ${task.completed ? 'line-through text-slate-400' : task.in_progress ? 'text-amber-700 font-medium' : 'text-slate-800'}`}
                onDoubleClick={() => { setTitleDraft(task.title); setEditingTitle(true) }}
              >
                {task.title}
              </p>
              <button
                onClick={() => { setTitleDraft(task.title); setEditingTitle(true) }}
                className="opacity-0 group-hover/title:opacity-100 text-slate-300 hover:text-indigo-500 flex-shrink-0 transition-opacity"
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
          {task.goal && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Link2 size={10} />
              {task.goal.title}
            </p>
          )}
        </div>

        {/* Category badge */}
        {task.category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline"
            style={{ backgroundColor: task.category.color + '20', color: task.category.color }}
          >
            {task.category.name}
          </span>
        )}

        {/* Role badge */}
        {task.role && (
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline"
            style={{ backgroundColor: task.role.color + '20', color: task.role.color }}
          >
            {task.role.name}
          </span>
        )}

        {/* Expand/collapse */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-400 hover:text-slate-600 p-0.5"
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2">
          {task.description && (
            <p className="text-xs text-slate-500">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Due: {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {task.category && (
              <span className="sm:hidden" style={{ color: task.category.color }}>
                {task.category.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* Priority change */}
            <div className="flex gap-1">
              {(['A', 'B', 'C', 'D'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => onUpdate(task.id, { priority: p })}
                  className={`text-xs font-bold w-6 h-6 rounded transition-colors ${
                    task.priority === p
                      ? p === 'A' ? 'bg-red-500 text-white'
                      : p === 'B' ? 'bg-amber-500 text-white'
                      : p === 'C' ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Category change */}
            {categories.length > 0 && (
              <select
                value={task.category_id || ''}
                onChange={e => onUpdate(task.id, { category_id: e.target.value || null })}
                className="text-xs border border-slate-200 rounded px-1.5 py-1 outline-none bg-white"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Role change */}
            {roles.length > 0 && (
              <select
                value={task.role_id || ''}
                onChange={e => onUpdate(task.id, { role_id: e.target.value || null })}
                className="text-xs border border-slate-200 rounded px-1.5 py-1 outline-none bg-white"
              >
                <option value="">No role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}

            <div className="flex-1" />

            {/* ── Calendar time scheduling ── */}
          </div>

          {/* Time slot row */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
            <Clock size={12} className="text-slate-400 flex-shrink-0" />
            <input
              type="time"
              value={startTime}
              onChange={e => {
                setStartTime(e.target.value)
                if (e.target.value) onUpdate(task.id, { start_time: e.target.value + ':00' })
                else onUpdate(task.id, { start_time: null })
                setCalError(null)
              }}
              className="text-xs border border-slate-200 rounded px-1.5 py-1 outline-none bg-white"
            />
            <select
              value={durationMin}
              onChange={e => {
                const v = Number(e.target.value)
                setDurationMin(v)
                onUpdate(task.id, { duration_minutes: v })
              }}
              className="text-xs border border-slate-200 rounded px-1.5 py-1 outline-none bg-white"
            >
              {[15, 30, 45, 60, 90, 120].map(m => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>

            {startTime && task.scheduled_date && (
              <button
                onClick={async () => {
                  setCalSyncing(true)
                  setCalError(null)
                  try {
                    const token = await getGoogleToken()
                    if (!token) throw new GoogleTokenExpiredError()
                    const augmented = { ...task, start_time: startTime + ':00', duration_minutes: durationMin }
                    if (task.google_event_id) {
                      await updateCalendarEvent(token, task.google_event_id, augmented, defaultPushId ?? undefined)
                    } else {
                      const eventId = await createCalendarEvent(token, augmented, defaultPushId ?? undefined)
                      onUpdate(task.id, { google_event_id: eventId })
                    }
                  } catch (e) {
                    setCalError(e instanceof GoogleTokenExpiredError ? 'Reconnect Google Calendar' : 'Sync failed')
                  } finally {
                    setCalSyncing(false)
                  }
                }}
                disabled={calSyncing}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 border border-teal-200 bg-teal-50 px-2 py-1 rounded disabled:opacity-50"
              >
                <CalendarCheck size={12} />
                {calSyncing ? 'Syncing…' : task.google_event_id ? 'Update Calendar' : 'Sync to Google Cal'}
              </button>
            )}

            {task.google_event_id && (
              <button
                onClick={async () => {
                  setCalSyncing(true)
                  setCalError(null)
                  try {
                    const token = await getGoogleToken()
                    if (!token) throw new GoogleTokenExpiredError()
                    await deleteCalendarEvent(token, task.google_event_id!, defaultPushId ?? undefined)
                    onUpdate(task.id, { google_event_id: null, start_time: null, duration_minutes: null })
                    setStartTime('')
                  } catch (e) {
                    setCalError(e instanceof GoogleTokenExpiredError ? 'Reconnect Google Calendar' : 'Delete failed')
                  } finally {
                    setCalSyncing(false)
                  }
                }}
                disabled={calSyncing}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-2 py-1 rounded disabled:opacity-50"
              >
                <CalendarX size={12} />
                Remove
              </button>
            )}

            {calError && <span className="text-xs text-red-500">{calError}</span>}
            {task.google_event_id && !calError && (
              <span className="text-xs text-teal-500 flex items-center gap-1">
                <CalendarCheck size={11} /> In Google Calendar
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1" />

            {/* Push to future date */}
            {showPushDate ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={pushDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setPushDate(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-1.5 py-1 outline-none bg-white"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (pushDate) { onUpdate(task.id, { scheduled_date: pushDate }); setShowPushDate(false) }
                  }}
                  disabled={!pushDate}
                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded disabled:opacity-40 hover:bg-indigo-700"
                >
                  Move
                </button>
                <button onClick={() => setShowPushDate(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPushDate(true)}
                className="text-slate-400 hover:text-indigo-500 p-1"
                title="Push to future date"
              >
                <CalendarArrowUp size={14} />
              </button>
            )}

            <button
              onClick={() => onDelete(task.id)}
              className="text-red-400 hover:text-red-600 p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
