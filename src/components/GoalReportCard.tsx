'use client'

import { GoalReport } from '@/lib/types'

interface GoalReportCardProps {
  report: GoalReport
}

export default function GoalReportCard({ report }: GoalReportCardProps) {
  const { goal, openCount, completedCount, overdueCount, completionRate } = report

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h3 className="text-xl font-semibold text-slate-800">{goal.title}</h3>
        {goal.role && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: goal.role.color + '20', color: goal.role.color }}
          >
            {goal.role.name}
          </span>
        )}
        {goal.category && (
          <span className="text-xs text-slate-500">{goal.category.name}</span>
        )}
      </div>

      <div className="flex gap-4 text-sm mt-2">
        <span className="text-slate-600">Open: {openCount}</span>
        <span className="text-slate-600">Completed: {completedCount}</span>
        <span className={overdueCount > 0 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
          Overdue: {overdueCount}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded-full mt-3">
        <div
          className="h-2 bg-indigo-500 rounded-full"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <p className="text-indigo-600 text-sm font-semibold mt-1">{completionRate}% complete</p>
    </div>
  )
}
