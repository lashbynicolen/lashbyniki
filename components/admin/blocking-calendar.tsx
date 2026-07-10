"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Ban, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  blockDay,
  unblockDay,
  blockSlot,
  unblockSlot,
} from "@/app/actions/admin"
import { generateTimeSlots } from "@/lib/booking"
import type { AdminAppointment } from "@/components/admin/admin-dashboard"

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "N"]
const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
]

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

interface BlockedDay {
  date: string
  note: string | null
}
interface BlockedSlot {
  date: string
  time: string
  note: string | null
}

export function BlockingCalendar({
  blockedDays,
  blockedSlots,
  appointments,
  today,
}: {
  blockedDays: BlockedDay[]
  blockedSlots: BlockedSlot[]
  appointments: AdminAppointment[]
  today: string
}) {
  const [ty, tm] = today.split("-").map(Number)
  const [viewYear, setViewYear] = useState(ty)
  const [viewMonth, setViewMonth] = useState(tm - 1)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const blockedDaySet = useMemo(
    () => new Set(blockedDays.map((b) => b.date)),
    [blockedDays],
  )
  const blockedSlotMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const b of blockedSlots) {
      if (!map.has(b.date)) map.set(b.date, new Set())
      map.get(b.date)!.add(b.time)
    }
    return map
  }, [blockedSlots])

  const appointmentMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const a of appointments) {
      if (a.status === "CANCELLED") continue
      if (!map.has(a.date)) map.set(a.date, new Set())
      map.get(a.date)!.add(a.time)
    }
    return map
  }, [appointments])

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const canGoPrev = !(viewYear === ty && viewMonth === tm - 1)

  function prevMonth() {
    if (!canGoPrev) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
    setSelected(null)
  }

  function handleToggleDay(date: string) {
    const isBlocked = blockedDaySet.has(date)
    startTransition(async () => {
      if (isBlocked) {
        await unblockDay(date)
        toast.success("Dzień odblokowany.")
      } else {
        await blockDay(date)
        toast.success("Dzień zablokowany.")
      }
    })
  }

  function handleToggleSlot(date: string, time: string) {
    const isBlocked = blockedSlotMap.get(date)?.has(time)
    startTransition(async () => {
      if (isBlocked) {
        await unblockSlot(date, time)
        toast.success(`Godzina ${time} odblokowana.`)
      } else {
        await blockSlot(date, time)
        toast.success(`Godzina ${time} zablokowana.`)
      }
    })
  }

  const selectedDayBlocked = selected ? blockedDaySet.has(selected) : false
  const allSlots = generateTimeSlots()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Poprzedni miesiąc"
            className="rounded-md p-2 transition-colors hover:bg-secondary disabled:opacity-30"
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
            className="rounded-md p-2 transition-colors hover:bg-secondary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium uppercase text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} />
            const key = toKey(viewYear, viewMonth, day)
            const past = key < today
            const dayBlocked = blockedDaySet.has(key)
            const hasAppts = appointmentMap.has(key)
            const hasBlockedSlots = (blockedSlotMap.get(key)?.size ?? 0) > 0
            const isSelected = selected === key

            return (
              <button
                key={key}
                type="button"
                disabled={past}
                onClick={() => setSelected(key)}
                className={cn(
                  "relative aspect-square rounded-md text-sm transition-all",
                  past && "cursor-not-allowed text-muted-foreground/30",
                  !past && !isSelected && !dayBlocked && "text-foreground hover:bg-secondary",
                  dayBlocked && !isSelected && "bg-destructive/10 text-destructive",
                  isSelected && "bg-primary text-primary-foreground",
                )}
              >
                {day}
                {!past && (
                  <span className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
                    {hasAppts && (
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary",
                        )}
                      />
                    )}
                    {(hasBlockedSlots || dayBlocked) && (
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-destructive",
                        )}
                      />
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Rezerwacje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Zablokowane
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        {!selected ? (
          <p className="text-sm text-muted-foreground">
            Wybierz dzień z kalendarza, aby zarządzać dostępnością.
          </p>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-lg font-medium text-foreground">
                {selected.split("-").reverse().join(".")}
              </h3>
              <Button
                size="sm"
                variant={selectedDayBlocked ? "outline" : "destructive"}
                disabled={isPending}
                onClick={() => handleToggleDay(selected)}
              >
                {selectedDayBlocked ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Odblokuj dzień
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" /> Zablokuj cały dzień
                  </>
                )}
              </Button>
            </div>

            {selectedDayBlocked ? (
              <p className="mt-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                Cały dzień jest zablokowany — klienci nie mogą rezerwować
                terminów.
              </p>
            ) : (
              <>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Kliknij godzinę, aby ją zablokować lub odblokować.
                </p>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {allSlots.map((slot) => {
                    const slotBlocked = blockedSlotMap.get(selected)?.has(slot)
                    const booked = appointmentMap.get(selected)?.has(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isPending || booked}
                        onClick={() => handleToggleSlot(selected, slot)}
                        className={cn(
                          "rounded-md border py-1.5 text-xs transition-all",
                          booked &&
                            "cursor-not-allowed border-primary/40 bg-primary/10 text-primary",
                          !booked &&
                            slotBlocked &&
                            "border-destructive/40 bg-destructive/10 text-destructive",
                          !booked &&
                            !slotBlocked &&
                            "border-border bg-background text-foreground hover:bg-secondary",
                        )}
                        title={booked ? "Zarezerwowane" : undefined}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-primary/40 bg-primary/10" />
                    Zarezerwowane
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-destructive/40 bg-destructive/10" />
                    Zablokowane
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
