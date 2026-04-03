'use client'

import { useState, useMemo } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Sun, Sunrise, Moon, Printer, Sparkles } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useTasks, useCategories, useGoals, useRoles, useReflection, useProfile } from '@/lib/hooks'
import { Task } from '@/lib/types'
import TaskForm from '@/components/TaskForm'
import TaskCard from '@/components/TaskCard'
import PlanMyDay from '@/components/PlanMyDay'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showPlanMyDay, setShowPlanMyDay] = useState(false)
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks(selectedDate)
  const { categories } = useCategories()
  const { goals } = useGoals()
  const { roles } = useRoles()
  const { reflection, saveReflection } = useReflection(selectedDate)
  const { profile } = useProfile()

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  // Group tasks by priority, sorted by sort_order
  const grouped = useMemo(() => {
    const a: Task[] = []
    const b: Task[] = []
    const c: Task[] = []
    tasks.forEach(t => {
      if (t.priority === 'A') a.push(t)
      else if (t.priority === 'B') b.push(t)
      else c.push(t)
    })
    return { A: a, B: b, C: c }
  }, [tasks])

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', icon: Sunrise }
    if (hour < 17) return { text: 'Good afternoon', icon: Sun }
    return { text: 'Good evening', icon: Moon }
  }
  const greeting = getGreeting()

  const handleAddTask = async (task: Parameters<typeof addTask>[0]) => {
    await addTask(task as Partial<Task>)
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourcePriority = source.droppableId as 'A' | 'B' | 'C'
    const destPriority = destination.droppableId as 'A' | 'B' | 'C'

    // Clone groups
    const newGrouped = {
      A: [...grouped.A],
      B: [...grouped.B],
      C: [...grouped.C],
    }

    // Remove from source group
    const [movedTask] = newGrouped[sourcePriority].splice(source.index, 1)

    // Insert into destination group with updated priority
    newGrouped[destPriority].splice(destination.index, 0, { ...movedTask, priority: destPriority })

    // Rebuild full task list with updated sort_orders
    const allUpdated: Task[] = [
      ...newGrouped.A.map((t, i) => ({ ...t, sort_order: i })),
      ...newGrouped.B.map((t, i) => ({ ...t, sort_order: i })),
      ...newGrouped.C.map((t, i) => ({ ...t, sort_order: i })),
    ]

    reorderTasks(allUpdated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {isToday && (
            <p className="text-sm text-indigo-600 flex items-center gap-1 mb-1">
              <greeting.icon size={14} />
              {greeting.text}, {profile?.display_name || 'Planner'}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-800">Daily Planner</h1>
        </div>

        <div className="flex items-center gap-2 no-print">
        {/* Plan My Day button */}
        <button
          onClick={() => setShowPlanMyDay(true)}
          className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl shadow-sm transition-all font-medium"
        >
          <Sparkles size={14} />
          Plan My Day
        </button>

        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm hover:shadow transition-all"
          title="Print daily plan"
        >
          <Printer size={14} />
          Print
        </button>

        {/* Date navigator */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-1.5 shadow-sm">
          <button
            onClick={() => setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 px-2">
            <CalIcon size={14} className="text-slate-400" />
            <span className="text-sm font-medium min-w-[140px] text-center">
              {isToday ? 'Today' : ''} {format(new Date(selectedDate), 'EEE, MMM d, yyyy')}
            </span>
          </div>
          <button
            onClick={() => setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        </div> {/* end no-print flex */}
      </div>

      {/* Print header — only visible when printing */}
      <div className="hidden print:block print-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Daily Planner</h1>
          <span className="text-sm">{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        {profile?.mission_statement && (
          <div className="print-mission mt-2">&ldquo;{profile.mission_statement}&rdquo;</div>
        )}
      </div>

      {/* Mission statement reminder */}
      {profile?.mission_statement && isToday && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <p className="text-xs text-indigo-400 mb-0.5">Your Mission</p>
          <p className="text-sm text-indigo-700 italic">&ldquo;{profile.mission_statement}&rdquo;</p>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              {completedCount} of {totalCount} tasks completed
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Form */}
      <TaskForm
        categories={categories}
        goals={goals}
        roles={roles}
        scheduledDate={selectedDate}
        onSubmit={handleAddTask}
      />

      {/* Task Groups with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        {(['A', 'B', 'C'] as const).map(priority => {
          const priorityTasks = grouped[priority]
          const labels = {
            A: { title: 'Priority A — Must Do', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
            B: { title: 'Priority B — Should Do', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            C: { title: 'Priority C — Could Do', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          }
          const label = labels[priority]

          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`text-xs font-bold ${label.color} uppercase tracking-wider`}>
                  {label.title}
                </span>
                <span className="text-xs text-slate-400">({priorityTasks.length})</span>
              </div>
              <Droppable droppableId={priority}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[48px] rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? `${label.bg} border-2 border-dashed ${label.border} p-2` : ''
                    }`}
                  >
                    {priorityTasks.length === 0 && !snapshot.isDraggingOver ? (
                      <div className={`text-center py-4 ${label.bg} border ${label.border} rounded-xl`}>
                        <p className="text-xs text-slate-400">No {priority}-priority tasks</p>
                      </div>
                    ) : (
                      priorityTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.85 : 1,
                              }}
                            >
                              <TaskCard
                                task={task}
                                orderNum={index + 1}
                                categories={categories}
                                roles={roles}
                                dragHandleProps={provided.dragHandleProps}
                                onToggle={(id, completed) => updateTask(id, { completed })}
                                onDelete={deleteTask}
                                onUpdate={updateTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>

      {/* Daily Reflection */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Daily Reflection</h3>
        <div>
          <label className="text-xs text-slate-500 block mb-1">What went well today?</label>
          <textarea
            value={reflection?.wins || ''}
            onChange={e => saveReflection({ wins: e.target.value })}
            placeholder="Celebrate your wins..."
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">What could be improved?</label>
          <textarea
            value={reflection?.improvements || ''}
            onChange={e => saveReflection({ improvements: e.target.value })}
            placeholder="Note areas for growth..."
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Notes</label>
          <textarea
            value={reflection?.notes || ''}
            onChange={e => saveReflection({ notes: e.target.value })}
            placeholder="Any other thoughts..."
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 resize-none"
          />
        </div>
      </div>

      {/* Plan My Day modal */}
      {showPlanMyDay && (
        <PlanMyDay
          selectedDate={selectedDate}
          onClose={() => setShowPlanMyDay(false)}
          onTasksAdded={() => {
            setShowPlanMyDay(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
