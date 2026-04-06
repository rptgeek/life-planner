export interface Profile {
  id: string
  display_name: string | null
  mission_statement: string | null
  created_at: string
  updated_at: string
  selected_calendar_ids: string[] | null
  default_push_calendar_id: string | null
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Role {
  id: string
  user_id: string
  category_id: string | null
  name: string
  color: string
  sort_order: number
  created_at: string
  category?: Category
}

export interface Value {
  id: string
  user_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  category_id: string | null
  role_id: string | null
  parent_goal_id: string | null
  title: string
  description: string | null
  goal_type: 'long_term' | 'short_term'
  target_date: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  category?: Category
  role?: Role
  children?: Goal[]
  tasks?: Task[]
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  goal_id: string | null
  role_id: string | null
  title: string
  description: string | null
  priority: 'A' | 'B' | 'C' | 'D'
  due_date: string | null
  scheduled_date: string | null
  start_time: string | null        // 'HH:MM:SS' — time of day when scheduled
  duration_minutes: number | null  // default 30 when set
  google_event_id: string | null   // synced Google Calendar event id
  in_progress: boolean
  completed: boolean
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
  goal?: Goal
  role?: Role
}

export interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  colorId?: string
  htmlLink?: string
  allDay?: boolean
}

export interface GoalReport {
  goal: Goal
  openCount: number
  completedCount: number
  overdueCount: number
  totalCount: number
  completionRate: number // 0-100
}

export interface TrendDataPoint {
  weekLabel: string    // e.g. "Mar 31"
  weekStart: string    // ISO date string for the Monday
  [goalTitle: string]: number | string // dynamic keys per goal title = completed count
}

export interface ReportData {
  goalReports: GoalReport[]
  forgottenGoals: Goal[]        // active goals with zero tasks
  unlinkedTasks: Task[]         // tasks with goal_id === null
  trendData: TrendDataPoint[]   // weekly completed-task counts per goal
  loading: boolean
}

export interface DailyReflection {
  id: string
  user_id: string
  reflection_date: string
  notes: string | null
  wins: string | null
  improvements: string | null
  created_at: string
  updated_at: string
}
