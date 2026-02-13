"use client"

import { Play, Trash2, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/atoms/button"
import { useTaskContext } from "@/lib/task-context"
import type { Task } from "@/lib/types"
import { PRIORITY_CONFIG, LABEL_CONFIG } from "@/lib/types"
import { useRouter } from "next/navigation"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { completeTask, deleteTask, startTask } = useTaskContext()
  const router = useRouter()
  const priority = PRIORITY_CONFIG[task.priority]
  const label = LABEL_CONFIG[task.label]
  const isCompleted = task.status === "completed"

  function handleStart() {
    startTask(task.id)
    router.push("/timer")
  }

  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-all ${
        isCompleted
          ? "border-border/30 bg-secondary/30 opacity-60"
          : "border-border bg-card hover:border-border/80 hover:bg-card/80"
      }`}
    >
      {/* Top row: badges + actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${priority.color} ${priority.bg} ${priority.border}`}
          >
            {priority.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${label.color} ${label.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${label.dot}`} />
            {label.label}
          </span>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => completeTask(task.id)}
              className="w-7 h-7 text-muted-foreground hover:text-primary"
              aria-label="Complete task"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="w-7 h-7 text-muted-foreground hover:text-destructive"
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Task name */}
      <p
        className={`text-sm font-semibold leading-snug ${
          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {task.name}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom row: pomodoro count + start */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.completedPomodoros}/{task.estimatedPomodoros}
          </span>
          <span>{task.createdDate}</span>
        </div>

        {!isCompleted && (
          <Button
            size="sm"
            onClick={handleStart}
            className="h-7 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
          >
            <Play className="w-3 h-3" />
            Start
          </Button>
        )}

        {isCompleted && (
          <span className="flex items-center gap-1 text-xs text-primary/60">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </span>
        )}
      </div>
    </div>
  )
}
