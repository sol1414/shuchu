"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ListTodo, CalendarCheck, Timer, CalendarDays } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Tasks", icon: ListTodo },
  { href: "/todos", label: "Daily", icon: CalendarCheck },
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
