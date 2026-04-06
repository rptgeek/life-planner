'use client'

import { useReportData } from '@/lib/hooks'
import GoalReportCard from '@/components/GoalReportCard'
import ForgottenGoalsCallout from '@/components/ForgottenGoalsCallout'
import UnlinkedTasksSection from '@/components/UnlinkedTasksSection'
import TrendChartsSection from '@/components/TrendChartsSection'

export default function ReportsPage() {
  const { goalReports, forgottenGoals, unlinkedTasks, trendData, loading } = useReportData()

  const goalTitles = goalReports.map(r => r.goal.title)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">How your goals are progressing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="animate-pulse rounded-lg bg-slate-200 h-24 w-full" />
          <div className="animate-pulse rounded-lg bg-slate-200 h-24 w-full" />
          <div className="animate-pulse rounded-lg bg-slate-200 h-24 w-full" />
        </div>
      </div>
    )
  }

  const hasNoData = goalReports.length === 0 && unlinkedTasks.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">How your goals are progressing</p>
      </div>

      {hasNoData ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">
            No active goals yet. Add goals on the Goals page to see your progress here.
          </p>
        </div>
      ) : (
        <>
          <ForgottenGoalsCallout goals={forgottenGoals} />

          <div>
            <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-4">Goal Breakdown</h2>
            {goalReports.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tasks found. Schedule tasks from the Daily Planner to see them tracked here.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goalReports.map(r => (
                  <GoalReportCard key={r.goal.id} report={r} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <UnlinkedTasksSection tasks={unlinkedTasks} />
          </div>

          <div className="mt-8">
            <TrendChartsSection data={trendData} goalTitles={goalTitles} />
          </div>
        </>
      )}
    </div>
  )
}
