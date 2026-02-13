"use client"

import React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskContext } from "@/lib/task-context"
import { PRIORITY_CONFIG, LABEL_CONFIG, todayKey } from "@/lib/types"
import type { Priority, Label } from "@/lib/types"

const priorities: Priority[] = ["high", "medium", "low"]
const labels: Label[] = ["work", "private", "hobby", "study", "health", "other"]

interface AddTaskDialogProps {
  dateKey?: string
  onClose: () => void
}

export function AddTaskDialog({ dateKey, onClose }: AddTaskDialogProps) {
  const { addTask } = useTaskContext()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [label, setLabel] = useState<Label>("work")
  const [estimated, setEstimated] = useState(4)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addTask({
      name: name.trim(),
      description: description.trim(),
      priority,
      label,
      estimatedPomodoros: estimated,
      createdDate: dateKey ?? todayKey(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">New Task</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Task Name
            </label>
            <input
              id="task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What do you want to work on?"
              className="bg-secondary text-foreground placeholder:text-muted-foreground/60 rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-desc" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description <span className="text-muted-foreground/40">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="bg-secondary text-foreground placeholder:text-muted-foreground/60 rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
            <div className="flex gap-2">
              {priorities.map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const active = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium border transition-all ${
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

          {/* Label */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</span>
            <div className="grid grid-cols-3 gap-2">
              {labels.map((l) => {
                const cfg = LABEL_CONFIG[l]
                const active = label === l
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLabel(l)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium border transition-all ${
                      active
                        ? `${cfg.bg} border-transparent ${cfg.color}`
                        : "border-border text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Estimated Pomodoros */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estimated Cycles
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEstimated(Math.max(1, estimated - 1))}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                -
              </button>
              <span className="text-lg font-mono font-bold text-foreground w-8 text-center">
                {estimated}
              </span>
              <button
                type="button"
                onClick={() => setEstimated(Math.min(12, estimated + 1))}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-muted-foreground ml-1">
                = {estimated} hr{estimated !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </form>
      </div>
    </div>
  )
}
