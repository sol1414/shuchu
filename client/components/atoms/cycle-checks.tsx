"use client"

import { Check } from "lucide-react"

interface CycleChecksProps {
  completedCycles: number
  maxDisplay?: number
}

export function CycleChecks({ completedCycles, maxDisplay = 8 }: CycleChecksProps) {
  const displayCount = Math.min(completedCycles, maxDisplay)
  const remaining = completedCycles - displayCount

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 border border-primary/30"
        >
          <Check className="w-4 h-4 text-primary" />
        </div>
      ))}
      {remaining > 0 && (
        <span className="text-sm text-muted-foreground font-mono">
          {`+${remaining}`}
        </span>
      )}
      {completedCycles === 0 && (
        <span className="text-sm text-muted-foreground">
          No cycles completed yet
        </span>
      )}
    </div>
  )
}
