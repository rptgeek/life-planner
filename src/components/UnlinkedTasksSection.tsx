'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Task } from '@/lib/types'

interface UnlinkedTasksSectionProps {
  tasks: Task[]
}

export default function UnlinkedTasksSection({ tasks }: UnlinkedTasksSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (tasks.length === 0) return null

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
      <button
        className="flex items-center gap-2 w-full p-4 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? 'Collapse unlinked tasks' : 'Expand unlinked tasks'}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        <span className="font-semibold text-slate-800">
          Unlinked Tasks ({tasks.length})
        </span>
      </button>

      {expanded && (
        <ul className="px-4 pb-4 space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="text-sm text-slate-700">
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
