"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "N"]
const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
]

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

interface BookingCalendarProps {
  selectedDate: string | null
  onSelect: (date: string) => void
  /** Daty całkowicie zablokowane (YYYY-MM-DD) */
  blockedDays?: string[]
  todayKey: string
}

export function BookingCalendar({
  selectedDate,
  onSelect,
  blockedDays = [],
  todayKey,
}: BookingCalendarProps) {
  const today = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number)
    return { y, m: m - 1, d }
  }, [todayKey])

  const [viewYear, setViewYear] = useState(today.y)
  const [viewMonth, setViewMonth] = useState(today.m)

  const blockedSet = useMemo(() => new Set(blockedDays), [blockedDays])

  const firstDay = new Date(viewYear, viewMonth, 1)
  // Poniedziałek = 0
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const canGoPrev = !(viewYear === today.y && viewMonth === today.m)

  function prevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function isPast(day: number): boolean {
    const key = toKey(viewYear, viewMonth, day)
    return key < todayKey
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Poprzedni miesiąc"
          className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-serif text-lg font-medium text-foreground">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Następny miesiąc"
          className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />
          const key = toKey(viewYear, viewMonth, day)
          const past = isPast(day)
          const blocked = blockedSet.has(key)
          const disabled = past || blocked
          const isSelected = selectedDate === key
          const isToday = key === todayKey

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(key)}
              className={cn(
                "relative aspect-square rounded-md text-sm transition-all",
                disabled &&
                  "cursor-not-allowed text-muted-foreground/40 line-through",
                !disabled &&
                  !isSelected &&
                  "text-foreground hover:bg-secondary",
                isSelected &&
                  "bg-primary font-medium text-primary-foreground shadow-sm",
                isToday && !isSelected && "ring-1 ring-inset ring-primary/40",
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
