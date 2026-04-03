'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from './supabase'
import { Category, Goal, Task, Profile, DailyReflection, Value } from './types'
import { User } from '@supabase/supabase-js'

const supabase = createClient()

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export function useProfile() {
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
    return data
  }

  return { profile, updateProfile, refetch: fetchProfile }
}

export function useCategories() {
  const { user } = useUser()
  const [categories, setCategories] = useState<Category[]>([])

  const fetchCategories = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')
    setCategories(data || [])
  }, [user])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const addCategory = async (name: string, color: string, icon: string) => {
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color, icon, sort_order: categories.length })
      .select()
      .single()
    if (data) setCategories(prev => [...prev, data])
    return data
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { data } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setCategories(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return { categories, addCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}

export function useGoals() {
  const { user } = useUser()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const addGoal = async (goal: Partial<Goal>) => {
    if (!user) return
    const { data } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.id })
      .select('*, category:categories(*)')
      .single()
    if (data) setGoals(prev => [data, ...prev])
    return data
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()
    if (data) setGoals(prev => prev.map(g => g.id === id ? data : g))
    return data
  }

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}

export function useTasks(dateFilter?: string) {
  const { user } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let query = supabase
      .from('tasks')
      .select('*, category:categories(*), goal:goals(*)')
      .eq('user_id', user.id)

    if (dateFilter) {
      query = query.eq('scheduled_date', dateFilter)
    }

    query = query.order('priority').order('sort_order')

    const { data } = await query
    setTasks(data || [])
    setLoading(false)
  }, [user, dateFilter])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async (task: Partial<Task>) => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select('*, category:categories(*), goal:goals(*)')
      .single()
    if (data) setTasks(prev => [...prev, data])
    return data
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updateData = { ...updates } as Record<string, unknown>
    if (updates.completed) {
      updateData.completed_at = new Date().toISOString()
    }
    const { data } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*, category:categories(*), goal:goals(*)')
      .single()
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, addTask, updateTask, deleteTask, refetch: fetchTasks }
}

export function useReflection(date: string) {
  const { user } = useUser()
  const [reflection, setReflection] = useState<DailyReflection | null>(null)

  const fetchReflection = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('reflection_date', date)
      .single()
    setReflection(data)
  }, [user, date])

  useEffect(() => { fetchReflection() }, [fetchReflection])

  const saveReflection = async (updates: Partial<DailyReflection>) => {
    if (!user) return
    const { data } = await supabase
      .from('daily_reflections')
      .upsert({
        ...updates,
        user_id: user.id,
        reflection_date: date
      }, { onConflict: 'user_id,reflection_date' })
      .select()
      .single()
    if (data) setReflection(data)
    return data
  }

  return { reflection, saveReflection }
}

export function useValues() {
  const { user } = useUser()
  const [values, setValues] = useState<Value[]>([])

  const fetchValues = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('values')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')
    setValues(data || [])
  }, [user])

  useEffect(() => { fetchValues() }, [fetchValues])

  const addValue = async (title: string, description: string) => {
    if (!user) return
    const { data } = await supabase
      .from('values')
      .insert({ user_id: user.id, title, description, sort_order: values.length })
      .select()
      .single()
    if (data) setValues(prev => [...prev, data])
    return data
  }

  const updateValue = async (id: string, updates: Partial<Value>) => {
    const { data } = await supabase
      .from('values')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setValues(prev => prev.map(v => v.id === id ? data : v))
    return data
  }

  const deleteValue = async (id: string) => {
    await supabase.from('values').delete().eq('id', id)
    setValues(prev => prev.filter(v => v.id !== id))
  }

  return { values, addValue, updateValue, deleteValue, refetch: fetchValues }
}
