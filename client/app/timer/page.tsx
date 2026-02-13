"use client"

import { useEffect, useRef } from "react"
import { ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/atoms/button"
import { DonutRing } from "@/components/atoms/donut-ring"
import { TimerDisplay } from "@/components/atoms/timer-display"
import { TimerControls } from "@/components/molecules/timer-controls"
import { CycleChecks } from "@/components/atoms/cycle-checks"
import { useCycleTimer } from "@/hooks/use-cycle-timer"
import { useTaskContext } from "@/lib/task-context"
import { PRIORITY_CONFIG, LABEL_CONFIG } from "@/lib/types"
import Link from "next/link"

export default function CycleTimer() {
  const {
    activeTimerTaskId,
    getTaskById,
    incrementPomodoro,
    setActiveTimerTaskId,
    mounted,
  } = useTaskContext()

  const task = activeTimerTaskId ? getTaskById(activeTimerTaskId) : undefined
  const timer = useCycleTimer()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const hasAutoStarted = useRef(false)
  const prevCyclesRef = useRef(0)

  // Auto-start timer when arriving with an active task
  useEffect(() => {
    if (task && !hasAutoStarted.current && timer.status === "idle") {
      hasAutoStarted.current = true
      timer.start()
    }
  }, [task, timer])

  // Reset auto-start flag when task changes
  useEffect(() => {
    hasAutoStarted.current = false
  }, [activeTimerTaskId])

  // Increment pomodoro on cycle completion
  useEffect(() => {
    if (timer.completedCycles > prevCyclesRef.current && activeTimerTaskId) {
      incrementPomodoro(activeTimerTaskId)

      // Play sound notification
      if (soundEnabled) {
        try {
          const audioCtx = new AudioContext()
          const osc = audioCtx.createOscillator()
          const gain = audioCtx.createGain()
          osc.connect(gain)
          gain.connect(audioCtx.destination)
          osc.frequency.value = 800
          gain.gain.value = 0.3
          osc.start()
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
          osc.stop(audioCtx.currentTime + 0.5)
        } catch {
          /* audio not supported */
        }
      }
    }
    prevCyclesRef.current = timer.completedCycles
  }, [timer.completedCycles, activeTimerTaskId, incrementPomodoro, soundEnabled])

  // Play sound on phase change
  const prevPhaseRef = useRef(timer.phase)
  useEffect(() => {
    if (timer.phase !== prevPhaseRef.current && timer.status === "running" && soundEnabled) {
      try {
        const audioCtx = new AudioContext()
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.frequency.value = timer.phase === "work" ? 600 : 400
        osc.type = "sine"
        gain.gain.value = 0.2
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
        osc.stop(audioCtx.currentTime + 0.3)
      } catch {
        /* audio not supported */
      }
    }
    prevPhaseRef.current = timer.phase
  }, [timer.phase, timer.status, soundEnabled])

  function handleBack() {
    timer.pause()
    timer.reset()
    setActiveTimerTaskId(null)
  }

  // Wait for context to load from localStorage
  if (!mounted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-8">
        <DonutRing progress={1} phase="work" size={240} strokeWidth={10}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-mono font-bold text-foreground/20 tabular-nums">
              45:00
            </span>
          </div>
        </DonutRing>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    )
  }

  // No task selected - show guard
  if (!task) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-8">
        <div className="relative">
          <DonutRing progress={1} phase="work" size={240} strokeWidth={10}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-mono font-bold text-foreground/20 tabular-nums">
                45:00
              </span>
            </div>
          </DonutRing>
          {/* Overlay */}
          <div className="absolute inset-0 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-8">
              <p className="text-sm font-medium text-foreground mb-1">
                No task selected
              </p>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Choose a task from the task list and press Start to begin your focus session.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go to Tasks
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const label = LABEL_CONFIG[task.label]

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-24 gap-8">
      {/* Back button + sound */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Task info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border ${priority.color} ${priority.bg} ${priority.border}`}
          >
            {priority.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${label.color} ${label.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${label.dot}`} />
            {label.label}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-foreground text-balance">
          {task.name}
        </h2>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            {task.description}
          </p>
        )}
      </div>

      {/* Donut Timer */}
      <DonutRing progress={timer.progress} phase={timer.phase}>
        <TimerDisplay
          timeRemaining={timer.timeRemaining}
          phase={timer.phase}
          status={timer.status}
        />
      </DonutRing>

      {/* Controls */}
      <TimerControls
        status={timer.status}
        onStart={timer.start}
        onPause={timer.pause}
        onSkip={timer.skip}
        onReset={timer.reset}
      />

      {/* Pomodoro progress */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase tracking-wider">Cycle</span>
          <span className="font-mono font-bold text-foreground">
            {task.completedPomodoros}
          </span>
          <span>/</span>
          <span className="font-mono">{task.estimatedPomodoros}</span>
        </div>
        <CycleChecks completedCycles={task.completedPomodoros} />
      </div>
    </main>
  )
}
