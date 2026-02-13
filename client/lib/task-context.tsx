"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Task, Priority, Label } from "./types"
import { todayKey } from "./types"

interface TaskContextValue {
  tasks: Task[]
  mounted: boolean
  addTask: (task: Omit<Task, "id" | "completedPomodoros" | "completedDate" | "status">) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  startTask: (id: string) => void
  incrementPomodoro: (id: string) => void
  getTasksByDate: (dateKey: string) => Task[]
  getTaskById: (id: string) => Task | undefined
  activeTimerTaskId: string | null
  setActiveTimerTaskId: (id: string | null) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

const STORAGE_KEY = "cycle-timer-tasks"
const ACTIVE_TASK_KEY = "cycle-timer-active-task"

function loadTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Task[]
  } catch { /* ignore */ }
  return []
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function loadActiveTaskId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(ACTIVE_TASK_KEY)
  } catch { /* ignore */ }
  return null
}

function saveActiveTaskId(id: string | null) {
  if (typeof window === "undefined") return
  if (id) {
    localStorage.setItem(ACTIVE_TASK_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_TASK_KEY)
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTimerTaskId, _setActiveTimerTaskId] = useState<string | null>(null)

  const setActiveTimerTaskId = useCallback((id: string | null) => {
    _setActiveTimerTaskId(id)
    saveActiveTaskId(id)
  }, [])

  useEffect(() => {
    setTasks(loadTasks())
    _setActiveTimerTaskId(loadActiveTaskId())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveTasks(tasks)
  }, [tasks, mounted])

  const addTask = useCallback(
    (input: Omit<Task, "id" | "completedPomodoros" | "completedDate" | "status">): Task => {
      const task: Task = {
        ...input,
        id: crypto.randomUUID(),
        completedPomodoros: 0,
        completedDate: null,
        status: "pending",
      }
      setTasks((prev) => [...prev, task])
      return task
    },
    []
  )

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      if (activeTimerTaskId === id) setActiveTimerTaskId(null)
    },
    [activeTimerTaskId, setActiveTimerTaskId]
  )

  const completeTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "completed" as const, completedDate: todayKey() }
            : t
        )
      )
      if (activeTimerTaskId === id) setActiveTimerTaskId(null)
    },
    [activeTimerTaskId, setActiveTimerTaskId]
  )

  const startTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "in-progress" as const } : t))
    )
    setActiveTimerTaskId(id)
  }, [setActiveTimerTaskId])

  const incrementPomodoro = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
      )
    )
  }, [])

  const getTasksByDate = useCallback(
    (dateKey: string) => tasks.filter((t) => t.createdDate === dateKey),
    [tasks]
  )

  const getTaskById = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks]
  )

  return (
    <TaskContext.Provider
      value={{
        tasks,
        mounted,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        startTask,
        incrementPomodoro,
        getTasksByDate,
        getTaskById,
        activeTimerTaskId,
        setActiveTimerTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider")
  return ctx
}
