export interface Profile {
  id: string
  display_name: string | null
  mission_statement: string | null
  created_at: string
  updated_at: string
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
  parent_goal_id: string | null
  title: string
  description: string | null
  goal_type: 'long_term' | 'short_term'
  target_date: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  category?: Category
  children?: Goal[]
  tasks?: Task[]
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  goal_id: string | null
  title: string
  description: string | null
  priority: 'A' | 'B' | 'C'
  due_date: string | null
  scheduled_date: string | null
  completed: boolean
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
  goal?: Goal
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
