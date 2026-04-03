'use client'

import { useState } from 'react'
import { Check, Trash2, ChevronDown, ChevronUp, Link2, Calendar } from 'lucide-react'
import { Task } from '@/lib/types'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const priorityStyles = {
    A: 'border-l-red-500 bg-red-50/50',
    B: 'border-l-amber-500 bg-amber-50/30',
    C: 'border-l-blue-500 bg-blue-50/30',
  }

  const priorityBadge = {
    A: 'bg-red-100 text-red-700',
    B: 'bg-amber-100 text-amber-700',
    C: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className={`
      border-l-4 rounded-lg border border-slate-200 transition-all duration-200
      ${priorityStyles[task.priority]}
      ${task.completed ? 'opacity-50' : ''}
    `}>
      <div className="flex items-center gap-3 p-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-300 hover:border-indigo-400'}
          `}
        >
          {task.completed && <Check size={12} />}
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </p>
          {task.goal && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Link2 size={10} />
              {task.goal.title}
            </p>
          )}
        </div>

        {/* Priority badge */}
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>

        {/* Category badge */}
        {task.category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline"
            style={{ backgroundColor: task.category.color + '20', color: task.category.color }}
          >
            {task.category.name}
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

          <div className="flex items-center gap-2 pt-1">
            {/* Priority change */}
            <div className="flex gap-1">
              {(['A', 'B', 'C'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => onUpdate(task.id, { priority: p })}
                  className={`text-xs font-bold w-6 h-6 rounded transition-colors ${
                    task.priority === p
                      ? p === 'A' ? 'bg-red-500 text-white' : p === 'B' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex-1" />

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
