"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const WORK_DURATION = 45 * 60 // 45 minutes in seconds
const BREAK_DURATION = 15 * 60 // 15 minutes in seconds

export type TimerPhase = "work" | "break"
export type TimerStatus = "idle" | "running" | "paused"

interface CycleTimerState {
  phase: TimerPhase
  status: TimerStatus
  timeRemaining: number
  completedCycles: number
  totalDuration: number
}

export function useCycleTimer() {
  const [state, setState] = useState<CycleTimerState>({
    phase: "work",
    status: "idle",
    timeRemaining: WORK_DURATION,
    completedCycles: 0,
    totalDuration: WORK_DURATION,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.timeRemaining <= 1) {
        // Phase complete
        if (prev.phase === "work") {
          // Switch to break
          return {
            ...prev,
            phase: "break" as TimerPhase,
            timeRemaining: BREAK_DURATION,
            totalDuration: BREAK_DURATION,
          }
        }
        // Break complete - cycle done
        return {
          ...prev,
          phase: "work" as TimerPhase,
          timeRemaining: WORK_DURATION,
          totalDuration: WORK_DURATION,
          completedCycles: prev.completedCycles + 1,
        }
      }
      return {
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }
    })
  }, [])

  const start = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(tick, 1000)
    setState((prev) => ({ ...prev, status: "running" }))
  }, [tick, clearTimer])

  const pause = useCallback(() => {
    clearTimer()
    setState((prev) => ({ ...prev, status: "paused" }))
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setState({
      phase: "work",
      status: "idle",
      timeRemaining: WORK_DURATION,
      completedCycles: 0,
      totalDuration: WORK_DURATION,
    })
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    setState((prev) => {
      if (prev.phase === "work") {
        return {
          ...prev,
          phase: "break" as TimerPhase,
          timeRemaining: BREAK_DURATION,
          totalDuration: BREAK_DURATION,
          status: "running",
        }
      }
      return {
        ...prev,
        phase: "work" as TimerPhase,
        timeRemaining: WORK_DURATION,
        totalDuration: WORK_DURATION,
        completedCycles: prev.completedCycles + 1,
        status: "running",
      }
    })
    // restart the interval
    intervalRef.current = setInterval(tick, 1000)
  }, [clearTimer, tick])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const progress = state.timeRemaining / state.totalDuration

  return {
    ...state,
    progress,
    start,
    pause,
    skip,
    reset,
  }
}
