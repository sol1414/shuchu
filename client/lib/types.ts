export type Priority = "high" | "medium" | "low"
export type Label = "work" | "private" | "hobby" | "study" | "health" | "other"
export type TaskStatus = "pending" | "in-progress" | "completed"

export interface Task {
  id: string
  name: string
  description: string
  priority: Priority
  label: Label
  estimatedPomodoros: number
  completedPomodoros: number
  createdDate: string // ISO date string YYYY-MM-DD
  completedDate: string | null
  status: TaskStatus
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  high: {
    label: "High",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  low: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
}

export const LABEL_CONFIG: Record<Label, { label: string; color: string; bg: string; dot: string }> = {
  work: {
    label: "Work",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
  },
  private: {
    label: "Private",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    dot: "bg-pink-400",
  },
  hobby: {
    label: "Hobby",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dot: "bg-amber-400",
  },
  study: {
    label: "Study",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    dot: "bg-cyan-400",
  },
  health: {
    label: "Health",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    dot: "bg-emerald-400",
  },
  other: {
    label: "Other",
    color: "text-muted-foreground",
    bg: "bg-muted",
    dot: "bg-muted-foreground",
  },
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function todayKey(): string {
  return formatDateKey(new Date())
}
