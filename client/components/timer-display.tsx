"use client"

interface TimerDisplayProps {
  timeRemaining: number
  phase: "work" | "break"
  status: "idle" | "running" | "paused"
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function TimerDisplay({ timeRemaining, phase, status }: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`text-xs font-semibold uppercase tracking-widest ${
          phase === "work" ? "text-primary" : "text-accent"
        }`}
      >
        {phase === "work" ? "Work" : "Break"}
      </span>
      <span className="text-5xl font-mono font-bold text-foreground tabular-nums">
        {formatTime(timeRemaining)}
      </span>
      {status === "paused" && (
        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          Paused
        </span>
      )}
    </div>
  )
}
