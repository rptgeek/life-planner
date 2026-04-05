import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { format, parseISO } from 'date-fns'
import type { Task, Profile, DailyReflection } from '@/lib/types'

export interface FranklinPlannerData {
  selectedDate: string
  profile: Profile | null
  tasks: Task[]
  reflection: DailyReflection | null
}

const C = {
  indigo: '#6366f1',
  indigoDark: '#4338ca',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  red: '#dc2626',
  redLight: '#fef2f2',
  amber: '#d97706',
  amberLight: '#fffbeb',
  blue: '#2563eb',
  blueLight: '#eff6ff',
  green: '#16a34a',
  white: '#ffffff',
}

const PRIORITY_COLORS: Record<string, string> = {
  A: C.red,
  B: C.amber,
  C: C.blue,
}

const PRIORITY_BG: Record<string, string> = {
  A: C.redLight,
  B: C.amberLight,
  C: C.blueLight,
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.slate800,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
    backgroundColor: C.white,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    borderBottomWidth: 2,
    borderBottomColor: C.slate800,
    paddingBottom: 6,
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.slate900,
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 9,
    color: C.slate500,
    marginTop: 2,
  },

  // ── Mission ──────────────────────────────────────────
  missionBox: {
    borderWidth: 1,
    borderColor: C.indigo,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  missionLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    letterSpacing: 1,
    marginBottom: 3,
  },
  missionText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: C.indigoDark,
    lineHeight: 1.4,
  },

  // ── Tasks ────────────────────────────────────────────
  taskSection: {
    marginBottom: 8,
  },
  priorityGroup: {
    marginBottom: 6,
  },
  priorityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    marginBottom: 2,
  },
  priorityLabelText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.slate200,
    minHeight: 18,
  },
  taskCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.25,
    borderColor: C.slate500,
    marginRight: 5,
    marginTop: 1,
    flexShrink: 0,
  },
  taskNum: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    width: 18,
    flexShrink: 0,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 9,
    color: C.slate800,
    lineHeight: 1.3,
  },
  taskBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 2,
  },
  badge: {
    fontSize: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 0.75,
  },
  emptyTaskRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.slate200,
    height: 18,
  },

  // ── Time Log ─────────────────────────────────────────
  sectionLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.slate400,
    letterSpacing: 1,
    marginBottom: 3,
  },
  timeLogSection: {
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.slate200,
    height: 14,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 7,
    color: C.slate400,
    width: 42,
    flexShrink: 0,
  },
  timeLine: {
    flex: 1,
  },

  // ── Notes ────────────────────────────────────────────
  notesSection: {
    marginBottom: 8,
  },
  notesLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.slate200,
    height: 18,
    paddingTop: 3,
    paddingLeft: 2,
  },
  notesText: {
    fontSize: 8,
    color: C.slate800,
  },

  // ── Reflection ───────────────────────────────────────
  reflectionSection: {
    flexDirection: 'row',
    gap: 8,
  },
  reflectionBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 3,
    padding: 7,
  },
  reflectionLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  reflectionLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.slate200,
    height: 18,
    paddingTop: 3,
    paddingLeft: 2,
  },
  reflectionText: {
    fontSize: 8,
    color: C.slate800,
  },
})

const HOURS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
]

function PriorityGroup({ priority, tasks }: { priority: 'A' | 'B' | 'C'; tasks: Task[] }) {
  const color = PRIORITY_COLORS[priority]
  const labels = { A: 'A — MUST DO', B: 'B — SHOULD DO', C: 'C — COULD DO' }
  const capped = tasks.slice(0, 6)
  const emptyRows = Math.max(0, 2 - capped.length)

  return (
    <View style={s.priorityGroup}>
      <View style={[s.priorityLabelRow, { borderBottomColor: color }]}>
        <Text style={[s.priorityLabelText, { color }]}>{labels[priority]}</Text>
        {tasks.length > 6 && (
          <Text style={{ fontSize: 6, color: C.slate400, marginLeft: 6 }}>
            +{tasks.length - 6} more
          </Text>
        )}
      </View>
      {capped.map((task, i) => (
        <View key={task.id} style={s.taskRow}>
          <View style={s.taskCircle} />
          <Text style={[s.taskNum, { color }]}>{priority}{i + 1}</Text>
          <View style={s.taskContent}>
            <Text style={[s.taskTitle, task.completed ? { color: C.slate400 } : {}]}>
              {task.title}
            </Text>
            {(task.category || task.role) && (
              <View style={s.taskBadges}>
                {task.category && (
                  <Text style={[s.badge, { borderColor: task.category.color || color, color: task.category.color || color }]}>
                    {task.category.name}
                  </Text>
                )}
                {task.role && (
                  <Text style={[s.badge, { borderColor: task.role.color || C.slate400, color: task.role.color || C.slate400 }]}>
                    {task.role.name}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}
      {Array.from({ length: emptyRows }).map((_, i) => (
        <View key={`empty-${i}`} style={s.emptyTaskRow} />
      ))}
    </View>
  )
}

function ReflectionBox({
  label,
  color,
  text,
  lines = 4,
}: {
  label: string
  color: string
  text: string | null
  lines?: number
}) {
  const filled = text ? text.split('\n').filter(Boolean) : []
  const emptyLines = Math.max(0, lines - filled.length)

  return (
    <View style={s.reflectionBox}>
      <Text style={[s.reflectionLabel, { color }]}>{label}</Text>
      {filled.map((line, i) => (
        <View key={i} style={s.reflectionLine}>
          <Text style={s.reflectionText}>{line}</Text>
        </View>
      ))}
      {Array.from({ length: emptyLines }).map((_, i) => (
        <View key={i} style={s.reflectionLine} />
      ))}
    </View>
  )
}

export function FranklinPlannerPDF({ data }: { data: FranklinPlannerData }) {
  const { selectedDate, profile, tasks, reflection } = data
  const dateStr = format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy').toUpperCase()

  const grouped = {
    A: tasks.filter(t => t.priority === 'A').sort((a, b) => a.sort_order - b.sort_order),
    B: tasks.filter(t => t.priority === 'B').sort((a, b) => a.sort_order - b.sort_order),
    C: tasks.filter(t => t.priority === 'C').sort((a, b) => a.sort_order - b.sort_order),
  }

  const notesLines = reflection?.notes?.split('\n').filter(Boolean) ?? []
  const emptyNoteLines = Math.max(0, 6 - notesLines.length)

  return (
    <Document title={`Daily Plan — ${dateStr}`} author={profile?.display_name ?? 'Life Planner'}>
      <Page size="LETTER" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerDate}>{dateStr}</Text>
          {profile?.display_name && (
            <Text style={s.headerName}>{profile.display_name}</Text>
          )}
        </View>

        {/* ── Mission ── */}
        {profile?.mission_statement && (
          <View style={s.missionBox}>
            <Text style={s.missionLabel}>MISSION</Text>
            <Text style={s.missionText}>&ldquo;{profile.mission_statement}&rdquo;</Text>
          </View>
        )}

        {/* ── Tasks ── */}
        <View style={s.taskSection}>
          <PriorityGroup priority="A" tasks={grouped.A} />
          <PriorityGroup priority="B" tasks={grouped.B} />
          <PriorityGroup priority="C" tasks={grouped.C} />
        </View>

        {/* ── Time Log ── */}
        <View style={s.timeLogSection}>
          <Text style={s.sectionLabel}>TIME LOG</Text>
          {HOURS.map(hour => (
            <View key={hour} style={s.timeRow}>
              <Text style={s.timeLabel}>{hour}</Text>
              <View style={s.timeLine} />
            </View>
          ))}
        </View>

        {/* ── Notes ── */}
        <View style={s.notesSection}>
          <Text style={s.sectionLabel}>NOTES</Text>
          {notesLines.map((line, i) => (
            <View key={i} style={s.notesLine}>
              <Text style={s.notesText}>{line}</Text>
            </View>
          ))}
          {Array.from({ length: emptyNoteLines }).map((_, i) => (
            <View key={i} style={s.notesLine} />
          ))}
        </View>

        {/* ── Reflection ── */}
        <View style={s.reflectionSection}>
          <ReflectionBox label="WINS" color={C.green} text={reflection?.wins ?? null} />
          <ReflectionBox label="IMPROVE" color={C.amber} text={reflection?.improvements ?? null} />
        </View>

      </Page>
    </Document>
  )
}
