"use client"

import { useState, useMemo } from "react"
import { Plus, Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/atoms/button"
import { useTaskContext } from "@/lib/task-context"
import { TaskCard } from "@/components/molecules/task-card"
import { AddTaskDialog } from "@/components/organisms/add-task-dialog"
import type { Priority, Label } from "@/lib/types"
import { PRIORITY_CONFIG, LABEL_CONFIG } from "@/lib/types"

const priorities: Priority[] = ["high", "medium", "low"]
const labels: Label[] = ["work", "private", "hobby", "study", "health", "other"]

export function TaskListPage() {
  const { tasks } = useTaskContext()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null)
  const [filterLabel, setFilterLabel] = useState<Label | null>(null)

  const filtered = useMemo(() => {
    let list = [...tasks]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    if (filterPriority) list = list.filter((t) => t.priority === filterPriority)
    if (filterLabel) list = list.filter((t) => t.label === filterLabel)

    // Sort: in-progress first, then pending, then completed. Within groups, high priority first.
    const statusOrder = { "in-progress": 0, pending: 1, completed: 2 }
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    list.sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    return list
  }, [tasks, search, filterPriority, filterLabel])

  const pendingCount = tasks.filter((t) => t.status !== "completed").length
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const hasActiveFilters = filterPriority !== null || filterLabel !== null

  return (
    <main className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingCount} pending, {completedCount} completed
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground/60 rounded-xl pl-9 pr-3 py-2.5 text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-xl w-10 h-10 border-border bg-transparent shrink-0 ${
            hasActiveFilters ? "text-primary border-primary/30" : "text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-5 flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
          {/* Priority filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
            <div className="flex gap-2">
              {priorities.map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const active = filterPriority === p
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(active ? null : p)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Label filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Label</span>
            <div className="grid grid-cols-3 gap-2">
              {labels.map((l) => {
                const cfg = LABEL_CONFIG[l]
                const active = filterLabel === l
                return (
                  <button
                    key={l}
                    onClick={() => setFilterLabel(active ? null : l)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium border transition-all ${
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
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterPriority(null)
                setFilterLabel(null)
              }}
              className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0 ? "No tasks yet. Add one to get started." : "No tasks match your filters."}
            </p>
          </div>
        )}
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors z-40"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && <AddTaskDialog onClose={() => setShowAdd(false)} />}
    </main>
  )
}
