"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Clock,
  ListChecks,
  Flame,
} from "lucide-react"
import { Button } from "@/components/atoms/button"
import { useTaskContext } from "@/lib/task-context"
import { AddTaskDialog } from "@/components/organisms/add-task-dialog"
import { PRIORITY_CONFIG, LABEL_CONFIG, formatDateKey } from "@/lib/types"
import type { Label } from "@/lib/types"
import { useRouter } from "next/navigation"

const labels: Label[] = ["work", "private", "hobby", "study", "health", "other"]

function getDateDisplay(date: Date): string {
  const today = new Date()
  const todayStr = formatDateKey(today)
  const dateStr = formatDateKey(date)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateStr === todayStr) return "Today"
  if (dateStr === formatDateKey(yesterday)) return "Yesterday"
  if (dateStr === formatDateKey(tomorrow)) return "Tomorrow"

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export default function DailyTodoPage() {
  const { getTasksByDate, completeTask, deleteTask, startTask } = useTaskContext()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [filterLabel, setFilterLabel] = useState<Label | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
    setMounted(true)
  }, [])

  const dateKey = currentDate ? formatDateKey(currentDate) : ""
  const dayTasks = useMemo(() => {
    if (!dateKey) return []
    let list = getTasksByDate(dateKey)
    if (filterLabel) list = list.filter((t) => t.label === filterLabel)
    // Sort: pending first, then completed
    const statusOrder = { "in-progress": 0, pending: 1, completed: 2 }
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    list.sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        priorityOrder[a.priority] - priorityOrder[b.priority]
    )
    return list
  }, [dateKey, getTasksByDate, filterLabel])

  const total = dayTasks.length
  const completed = dayTasks.filter((t) => t.status === "completed").length
  const totalCycles = dayTasks.reduce((sum, t) => sum + t.completedPomodoros, 0)
  const progressPct = total > 0 ? (completed / total) * 100 : 0

  function shiftDate(days: number) {
    const d = new Date(currentDate ?? new Date())
    d.setDate(d.getDate() + days)
    setCurrentDate(d)
  }

  // Show loading skeleton until mounted to avoid hydration mismatch
  if (!mounted || !currentDate) {
    return (
      <main className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
          Daily ToDo
        </h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </main>
    )
  }

  function handleStart(taskId: string) {
    startTask(taskId)
    router.push("/timer")
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
        Daily ToDo
      </h1>

      {/* Date nav */}
      <div className="flex items-center justify-between mb-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => shiftDate(-1)}
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {getDateDisplay(currentDate)}
          <span className="block text-[11px] font-normal text-muted-foreground">
            {currentDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => shiftDate(1)}
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <ListChecks className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold font-mono text-foreground">{total}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold font-mono text-foreground">{completed}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Flame className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold font-mono text-foreground">{totalCycles}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cycles</p>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {completed}/{total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Label filter chips */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterLabel(null)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
            filterLabel === null
              ? "bg-secondary border-primary/20 text-foreground"
              : "border-border text-muted-foreground hover:border-border/80"
          }`}
        >
          All
        </button>
        {labels.map((l) => {
          const cfg = LABEL_CONFIG[l]
          const active = filterLabel === l
          return (
            <button
              key={l}
              onClick={() => setFilterLabel(active ? null : l)}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                active
                  ? `${cfg.bg} border-transparent ${cfg.color}`
                  : "border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {dayTasks.length === 0 && (
          <div className="text-center py-14">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No tasks for this day.
            </p>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </Button>
          </div>
        )}

        {dayTasks.map((task) => {
          const priority = PRIORITY_CONFIG[task.priority]
          const label = LABEL_CONFIG[task.label]
          const isCompleted = task.status === "completed"

          return (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isCompleted
                  ? "border-border/30 bg-secondary/30 opacity-60"
                  : "border-border bg-card"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => !isCompleted && completeTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isCompleted
                    ? "border-primary bg-primary/20"
                    : "border-muted-foreground/30 hover:border-primary"
                }`}
                disabled={isCompleted}
                aria-label={`Mark ${task.name} as complete`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-primary" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCompleted
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0 text-[10px] font-medium ${priority.color} ${priority.bg}`}
                  >
                    {priority.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0 text-[10px] font-medium ${label.color} ${label.bg}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${label.dot}`} />
                    {label.label}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    {task.completedPomodoros}/{task.estimatedPomodoros}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!isCompleted && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStart(task.id)}
                    className="w-8 h-8 text-primary hover:bg-primary/10"
                    aria-label="Start timer for this task"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors z-40"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && (
        <AddTaskDialog dateKey={dateKey} onClose={() => setShowAdd(false)} />
      )}
    </main>
  )
}
