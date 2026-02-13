"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flame,
  TrendingUp,
  Clock,
} from "lucide-react"
import { Button } from "@/components/atoms/button"
import { useTaskContext } from "@/lib/task-context"
import { LABEL_CONFIG, PRIORITY_CONFIG, formatDateKey } from "@/lib/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function CalendarViewPage() {
  const { tasks } = useTaskContext()
  const [viewDate, setViewDate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  useEffect(() => {
    setViewDate(new Date())
    setMounted(true)
  }, [])

  // Build a map of dateKey -> tasks (always runs, no conditional)
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {}
    for (const t of tasks) {
      if (!map[t.createdDate]) map[t.createdDate] = []
      map[t.createdDate].push(t)
    }
    return map
  }, [tasks])

  // Derived calendar values (safe to compute even before mount)
  const year = viewDate?.getFullYear() ?? 0
  const month = viewDate?.getMonth() ?? 0
  const daysInMonth = viewDate ? getDaysInMonth(year, month) : 0
  const firstDay = viewDate ? getFirstDayOfMonth(year, month) : 0
  const todayStr = mounted ? formatDateKey(new Date()) : ""

  const monthTasks = useMemo(() => {
    if (!mounted) return []
    return tasks.filter((t) => {
      const [y, m] = t.createdDate.split("-").map(Number)
      return y === year && m === month + 1
    })
  }, [tasks, year, month, mounted])

  const monthCompleted = monthTasks.filter((t) => t.status === "completed").length
  const monthCycles = monthTasks.reduce((s, t) => s + t.completedPomodoros, 0)

  const streak = useMemo(() => {
    if (!mounted) return 0
    let count = 0
    const d = new Date()
    for (let i = 0; i < 365; i++) {
      const key = formatDateKey(d)
      const dayTasks = tasksByDate[key] || []
      if (dayTasks.some((t) => t.status === "completed")) {
        count++
      } else if (i > 0) {
        break
      }
      d.setDate(d.getDate() - 1)
    }
    return count
  }, [tasksByDate, mounted])

  const selectedTasks = selectedDateKey ? tasksByDate[selectedDateKey] || [] : []
  const selectedCompleted = selectedTasks.filter((t) => t.status === "completed").length
  const selectedPct = selectedTasks.length > 0 ? (selectedCompleted / selectedTasks.length) * 100 : 0

  // Loading state (after all hooks)
  if (!mounted || !viewDate) {
    return (
      <main className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">Calendar</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </main>
    )
  }

  function shiftMonth(offset: number) {
    const d = new Date(viewDate!)
    d.setMonth(d.getMonth() + offset)
    setViewDate(d)
    setSelectedDateKey(null)
  }

  function getIntensity(dateKey: string): number {
    const dayTasks = tasksByDate[dateKey] || []
    if (dayTasks.length === 0) return 0
    const completed = dayTasks.filter((t) => t.status === "completed").length
    if (completed >= 5) return 3
    if (completed >= 3) return 2
    return 1
  }

  function getLabelDots(dateKey: string) {
    const dayTasks = tasksByDate[dateKey] || []
    const uniqueLabels = [...new Set(dayTasks.map((t) => t.label))]
    return uniqueLabels.slice(0, 3)
  }

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
        Calendar
      </h1>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => shiftMonth(-1)}
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {viewDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => shiftMonth(1)}
          className="w-9 h-9 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold font-mono text-foreground">{monthCompleted}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Flame className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-lg font-bold font-mono text-foreground">{monthCycles}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cycles</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <p className="text-lg font-bold font-mono text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const isToday = dateKey === todayStr
            const isSelected = dateKey === selectedDateKey
            const intensity = getIntensity(dateKey)
            const dots = getLabelDots(dateKey)
            const intensityClasses = ["", "bg-primary/15", "bg-primary/30", "bg-primary/50"]

            return (
              <button
                key={day}
                onClick={() => setSelectedDateKey(isSelected ? null : dateKey)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs transition-all relative ${
                  isSelected
                    ? "ring-1 ring-primary bg-primary/10"
                    : isToday
                      ? "ring-1 ring-primary/40"
                      : ""
                } ${intensity > 0 ? intensityClasses[intensity] : "hover:bg-secondary"}`}
              >
                <span className={`font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                  {day}
                </span>
                {dots.length > 0 && (
                  <div className="flex items-center gap-px">
                    {dots.map((label) => (
                      <span key={label} className={`w-1 h-1 rounded-full ${LABEL_CONFIG[label].dot}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/15" />
            <span className="text-[10px] text-muted-foreground">1-2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <span className="text-[10px] text-muted-foreground">3-4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <span className="text-[10px] text-muted-foreground">5+</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">completed</span>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDateKey && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {selectedCompleted}/{selectedTasks.length}
            </span>
          </div>

          {selectedTasks.length > 0 && (
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${selectedPct}%` }}
              />
            </div>
          )}

          {selectedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks on this day.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedTasks.map((task) => {
                const p = PRIORITY_CONFIG[task.priority]
                const l = LABEL_CONFIG[task.label]
                const done = task.status === "completed"
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${done ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        done ? "border-primary bg-primary/20" : "border-muted-foreground/30"
                      }`}
                    >
                      {done && <CheckCircle2 className="w-2.5 h-2.5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          done ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${p.color}`}>{p.label}</span>
                        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${l.color}`}>
                          <span className={`w-1 h-1 rounded-full ${l.dot}`} />
                          {l.label}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          {task.completedPomodoros}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
