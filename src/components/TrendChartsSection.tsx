'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendDataPoint } from '@/lib/types'

interface TrendChartsSectionProps {
  data: TrendDataPoint[]
  goalTitles: string[]
}

const OPACITY_CYCLE = [1.0, 0.7, 0.5, 0.3]

function strokeForIndex(index: number): string {
  const opacity = OPACITY_CYCLE[index % OPACITY_CYCLE.length]
  // Convert opacity to hex alpha on #6366f1
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `#6366f1${alpha}`
}

export default function TrendChartsSection({ data, goalTitles }: TrendChartsSectionProps) {
  if (data.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Completion Trends</h2>
        <p className="text-sm text-slate-500">
          Not enough data to show trends yet. Completed tasks will appear here as you work.
        </p>
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Completion Trends</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          {goalTitles.map((title, i) => (
            <Line
              key={title}
              type="monotone"
              dataKey={title}
              stroke={strokeForIndex(i)}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
