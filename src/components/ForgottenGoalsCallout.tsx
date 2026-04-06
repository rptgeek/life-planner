'use client'

import { Goal } from '@/lib/types'

interface ForgottenGoalsCalloutProps {
  goals: Goal[]
}

export default function ForgottenGoalsCallout({ goals }: ForgottenGoalsCalloutProps) {
  if (goals.length === 0) return null

  return (
    <div className="border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r-lg">
      <p className="text-amber-800 font-semibold text-sm mb-1">
        Goals without tasks ({goals.length})
      </p>
      <p className="text-amber-700 text-sm">
        {goals.map((g) => g.title).join(', ')}
      </p>
    </div>
  )
}
