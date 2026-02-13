"use client"

import { Play, Pause, SkipForward, RotateCcw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimerControlsProps {
  status: "idle" | "running" | "paused"
  onStart: () => void
  onPause: () => void
  onSkip: () => void
  onReset: () => void
  onComplete: () => void
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onSkip,
  onReset,
  onComplete,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="rounded-full w-10 h-10 border-border/50 text-muted-foreground hover:text-foreground hover:border-border bg-transparent"
        aria-label="Reset timer"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>

      {status === "running" ? (
        <Button
          size="icon"
          onClick={onPause}
          className="rounded-full w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Pause timer"
        >
          <Pause className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={onStart}
          className="rounded-full w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Start timer"
        >
          <Play className="w-6 h-6 ml-0.5" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={onSkip}
        className="rounded-full w-10 h-10 border-border/50 text-muted-foreground hover:text-foreground hover:border-border bg-transparent"
        aria-label="Skip to next phase"
      >
        <SkipForward className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onComplete}
        className="rounded-full w-10 h-10 border-border/50 text-muted-foreground hover:text-primary hover:border-primary bg-transparent"
        aria-label="Complete task"
      >
        <CheckCircle2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
