import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { format, parseISO } from 'date-fns'
import type { Task, Profile, DailyReflection, CalendarEvent } from '@/lib/types'

export interface FranklinPlannerData {
  selectedDate: string
  profile: Profile | null
  tasks: Task[]
  reflection: DailyReflection | null
  calendarEvents?: CalendarEvent[]
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  ink:      '#1a1a2e',
  slate:    '#334155',
  mid:      '#64748b',
  rule:     '#cbd5e1',
  ruleDark: '#94a3b8',
  ruleHr:   '#475569',
  bg:       '#ffffff',
  bgTint:   '#f8fafc',
  indigo:   '#4f46e5',
  indigoLt: '#e0e7ff',
  red:      '#b91c1c',
  redLt:    '#fef2f2',
  amber:    '#b45309',
  amberLt:  '#fffbeb',
  blue:     '#1d4ed8',
  blueLt:   '#eff6ff',
  green:    '#15803d',
  greenLt:  '#f0fdf4',
  purple:   '#7c3aed',
  purpleLt: '#f5f3ff',
}

const PRIORITY = {
  A: { label: 'A  ·  CRITICAL',   color: C.red,    bg: C.redLt,    max: 8 },
  B: { label: 'B  ·  IMPORTANT',  color: C.amber,  bg: C.amberLt,  max: 7 },
  C: { label: 'C  ·  OPTIONAL',   color: C.blue,   bg: C.blueLt,   max: 5 },
  D: { label: 'D  ·  DELEGATE',   color: C.purple, bg: C.purpleLt, max: 4 },
}

// Landscape LETTER: 792 × 612 pt. Margins 28pt (~0.39in) each side.
// Usable: 736 × 556 pt
const PW = 736  // usable page width
const PH = 556  // usable page height
const COL_L = 290  // left column width  (tasks)
const GAP   = 14   // column gap
const COL_R = PW - COL_L - GAP  // right column width  (432pt)

const HEADER_H   = 44
const MISSION_H  = 28   // collapses when absent
const COL_BODY_H = PH - HEADER_H  // 512pt

// Right column split
const TIMELOG_LABEL = 12
const TIMELOG_ROWS  = 16   // 6 AM – 9 PM
const TIMELOG_ROW_H = 22
const TIMELOG_H     = TIMELOG_LABEL + TIMELOG_ROWS * TIMELOG_ROW_H  // 364pt
const NOTES_H       = COL_BODY_H - TIMELOG_H  // 148pt

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.ink,
    paddingVertical: 28,
    paddingHorizontal: 28,
    backgroundColor: C.bg,
  },

  // ── Full-width header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: C.ink,
    paddingBottom: 5,
    marginBottom: 8,
    height: HEADER_H,
  },
  headerDate: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.ink,
    letterSpacing: 0.4,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  headerName: {
    fontSize: 8,
    color: C.mid,
  },
  headerVersion: {
    fontSize: 6,
    color: C.rule,
    marginTop: 1,
  },

  // ── Two-column body ────────────────────────────────────────────────────────
  body: {
    flexDirection: 'row',
    flex: 1,
  },

  // ── LEFT column — tasks ────────────────────────────────────────────────────
  leftCol: {
    width: COL_L,
    flexDirection: 'column',
  },
  missionBox: {
    borderWidth: 1,
    borderColor: C.indigo,
    borderRadius: 3,
    backgroundColor: C.indigoLt,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 7,
    height: MISSION_H,
    justifyContent: 'center',
  },
  missionText: {
    fontSize: 7,
    fontStyle: 'italic',
    color: C.indigo,
    lineHeight: 1.35,
  },
  priorityGroup: {
    marginBottom: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingBottom: 2,
    marginBottom: 2,
  },
  groupLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    minHeight: 17,
    paddingVertical: 2,
  },
  circle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.25,
    borderColor: C.mid,
    marginRight: 5,
    marginTop: 1.5,
    flexShrink: 0,
  },
  circleDone: {
    backgroundColor: C.mid,
    borderColor: C.mid,
  },
  circleInProgress: {
    borderColor: C.amber,
    borderWidth: 1.75,
  },
  taskNum: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    width: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  taskBody: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 8,
    color: C.ink,
    lineHeight: 1.3,
  },
  taskTitleDone: {
    color: C.ruleDark,
    textDecoration: 'line-through',
  },
  taskTitleInProgress: {
    color: C.amber,
  },
  inProgressLabel: {
    fontSize: 5.5,
    color: C.amber,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 1.5,
  },
  badge: {
    fontSize: 5.5,
    paddingHorizontal: 3,
    paddingVertical: 0.75,
    borderRadius: 6,
    borderWidth: 0.75,
  },
  emptyRow: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    height: 17,
  },

  // ── RIGHT column ───────────────────────────────────────────────────────────
  rightCol: {
    width: COL_R,
    marginLeft: GAP,
    borderLeftWidth: 1,
    borderLeftColor: C.ruleDark,
    paddingLeft: GAP - 2,
    flexDirection: 'column',
  },

  // Time log
  sectionTitle: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.mid,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    height: TIMELOG_ROW_H,
    alignItems: 'flex-start',
  },
  timeRowAlt: {
    backgroundColor: C.bgTint,
  },
  timeLabel: {
    fontSize: 7,
    color: C.mid,
    width: 44,
    flexShrink: 0,
    paddingTop: 3,
  },
  timeContent: {
    flex: 1,
    borderLeftWidth: 0.5,
    borderLeftColor: C.rule,
    paddingLeft: 4,
    justifyContent: 'center',
  },
  timeEventText: {
    fontSize: 7,
    color: C.ink,
    fontFamily: 'Helvetica-Bold',
  },
  timeHalfLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    borderBottomStyle: 'dashed',
    marginTop: TIMELOG_ROW_H / 2 - 1,
    width: '100%',
  },

  // Notes
  notesSection: {
    flex: 1,
    borderTopWidth: 1.5,
    borderTopColor: C.ruleHr,
    paddingTop: 5,
    marginTop: 5,
  },
  notesLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    flex: 1,
    paddingTop: 2,
    paddingLeft: 2,
  },
  notesText: {
    fontSize: 7.5,
    color: C.ink,
  },
  notesLineWrap: {
    flexDirection: 'column',
    flex: 1,
  },
})

const HOURS = [
  { label: '6:00 AM',  half: '6:30' },
  { label: '7:00 AM',  half: '7:30' },
  { label: '8:00 AM',  half: '8:30' },
  { label: '9:00 AM',  half: '9:30' },
  { label: '10:00 AM', half: '10:30' },
  { label: '11:00 AM', half: '11:30' },
  { label: '12:00 PM', half: '12:30' },
  { label: '1:00 PM',  half: '1:30' },
  { label: '2:00 PM',  half: '2:30' },
  { label: '3:00 PM',  half: '3:30' },
  { label: '4:00 PM',  half: '4:30' },
  { label: '5:00 PM',  half: '5:30' },
  { label: '6:00 PM',  half: '6:30' },
  { label: '7:00 PM',  half: '7:30' },
  { label: '8:00 PM',  half: '8:30' },
  { label: '9:00 PM',  half: '—' },
]

function PrioritySection({
  pkey, tasks,
}: {
  pkey: 'A' | 'B' | 'C' | 'D'
  tasks: Task[]
}) {
  const p = PRIORITY[pkey]
  const capped = tasks.slice(0, p.max)
  // Ensure at least 2 blank rows when section is thin
  const minBlank = Math.max(0, 2 - capped.length)

  return (
    <View style={s.priorityGroup}>
      <View style={[s.groupHeader, { borderBottomColor: p.color }]}>
        <Text style={[s.groupLabel, { color: p.color }]}>{p.label}</Text>
        {tasks.length > p.max && (
          <Text style={{ fontSize: 5.5, color: C.mid, marginLeft: 6 }}>
            +{tasks.length - p.max} more
          </Text>
        )}
      </View>

      {capped.map((task, i) => (
        <View key={task.id} style={s.taskRow}>
          <View style={[
            s.circle,
            task.completed ? s.circleDone : {},
            task.in_progress && !task.completed ? s.circleInProgress : {},
          ]} />
          <Text style={[s.taskNum, { color: p.color }]}>{pkey}{i + 1}</Text>
          <View style={s.taskBody}>
            <Text style={[
              s.taskTitle,
              task.completed ? s.taskTitleDone : {},
              task.in_progress && !task.completed ? s.taskTitleInProgress : {},
            ]}>
              {task.title}
              {task.in_progress && !task.completed ? ' ▶' : ''}
            </Text>
            {(task.category || task.role) && (
              <View style={s.badgeRow}>
                {task.category && (
                  <Text style={[s.badge, {
                    borderColor: task.category.color || p.color,
                    color: task.category.color || p.color,
                  }]}>
                    {task.category.name}
                  </Text>
                )}
                {task.role && (
                  <Text style={[s.badge, {
                    borderColor: task.role.color || C.mid,
                    color: task.role.color || C.mid,
                  }]}>
                    {task.role.name}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* D section is always blank (no app data) */}
      {pkey === 'D' && Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={s.emptyRow} />
      ))}

      {pkey !== 'D' && Array.from({ length: minBlank }).map((_, i) => (
        <View key={i} style={s.emptyRow} />
      ))}
    </View>
  )
}

export function FranklinPlannerPDF({ data }: { data: FranklinPlannerData }) {
  const { selectedDate, profile, tasks, reflection, calendarEvents = [] } = data

  // Build a map: hour (0-23) → event label for that hour (spans multiple rows for multi-hour events)
  const hourLabels = new Map<number, string>()
  calendarEvents.forEach(e => {
    if (!e.start.dateTime) return
    const startH = new Date(e.start.dateTime).getHours()
    const endDate = e.end?.dateTime ? new Date(e.end.dateTime) : null
    const endH = endDate ? endDate.getHours() : startH
    const endM = endDate ? endDate.getMinutes() : 0
    // If end is exactly on the hour (e.g. 11:00), that hour is not occupied
    const lastH = Math.min(endM === 0 ? endH - 1 : endH, 21)
    for (let h = startH; h <= lastH; h++) {
      if (!hourLabels.has(h)) {
        hourLabels.set(h, h === startH ? e.summary.slice(0, 55) : `↳ ${e.summary.slice(0, 52)}`)
      }
    }
  })
  tasks.filter(t => t.start_time).forEach(t => {
    const h = parseInt(t.start_time!.split(':')[0])
    const label = `${t.priority}: ${t.title}`.slice(0, 55)
    if (!hourLabels.has(h)) hourLabels.set(h, label)
  })
  const dateStr = format(parseISO(selectedDate), 'EEEE · MMMM d, yyyy').toUpperCase()

  const byPriority = (p: 'A' | 'B' | 'C') =>
    tasks.filter(t => t.priority === p).sort((a, b) => a.sort_order - b.sort_order)

  const notesLines = (reflection?.notes ?? '').split('\n').filter(Boolean)
  const approxNoteLineCount = Math.floor(NOTES_H / 18) - 1  // ~7 lines

  return (
    <Document
      title={`Daily Plan · ${dateStr}`}
      author={profile?.display_name ?? 'Life Planner'}
    >
      <Page size="LETTER" orientation="landscape" style={s.page}>

        {/* ── Full-width header ── */}
        <View style={s.header}>
          <Text style={s.headerDate}>{dateStr}</Text>
          <View style={s.headerRight}>
            {profile?.display_name && (
              <Text style={s.headerName}>{profile.display_name}</Text>
            )}
            <Text style={s.headerVersion}>Life Planner</Text>
          </View>
        </View>

        {/* ── Two-column body ── */}
        <View style={s.body}>

          {/* ── LEFT: Tasks ── */}
          <View style={s.leftCol}>
            {profile?.mission_statement && (
              <View style={s.missionBox}>
                <Text style={s.missionText}>
                  &ldquo;{profile.mission_statement}&rdquo;
                </Text>
              </View>
            )}

            <PrioritySection pkey="A" tasks={byPriority('A')} />
            <PrioritySection pkey="B" tasks={byPriority('B')} />
            <PrioritySection pkey="C" tasks={byPriority('C')} />
            <PrioritySection pkey="D" tasks={[]} />
          </View>

          {/* ── RIGHT: Time log + Notes ── */}
          <View style={s.rightCol}>
            {/* Time log */}
            <Text style={s.sectionTitle}>APPOINTMENTS  ·  SCHEDULE</Text>
            {HOURS.map((h, i) => {
              const hour = 6 + i
              const eventLabel = hourLabels.get(hour)
              return (
                <View key={h.label} style={[s.timeRow, i % 2 === 1 ? s.timeRowAlt : {}]}>
                  <Text style={s.timeLabel}>{h.label}</Text>
                  <View style={s.timeContent}>
                    {eventLabel
                      ? <Text style={s.timeEventText}>{eventLabel}</Text>
                      : <View style={s.timeHalfLine} />
                    }
                  </View>
                </View>
              )
            })}

            {/* Notes */}
            <View style={s.notesSection}>
              <Text style={[s.sectionTitle, { marginBottom: 4 }]}>NOTES</Text>
              <View style={s.notesLineWrap}>
                {notesLines.slice(0, approxNoteLineCount).map((line, i) => (
                  <View key={i} style={s.notesLine}>
                    <Text style={s.notesText}>{line}</Text>
                  </View>
                ))}
                {Array.from({
                  length: Math.max(0, approxNoteLineCount - notesLines.length),
                }).map((_, i) => (
                  <View key={i} style={s.notesLine} />
                ))}
              </View>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  )
}
