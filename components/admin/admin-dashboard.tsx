"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import {
  CalendarDays,
  Users,
  Ban,
  Check,
  Clock,
  Trash2,
  LogOut,
  Phone,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  logoutAction,
  updateAppointmentStatus,
  deleteAppointment,
  blockDay,
  unblockDay,
  blockSlot,
  unblockSlot,
} from "@/app/actions/admin"
import { BlockingCalendar } from "@/components/admin/blocking-calendar"
import { formatPrice } from "@/lib/services"

export interface AdminAppointment {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceLabel: string
  addons: string[]
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED"
  date: string
  time: string
  startAtIso: string
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

const STATUS_CONFIG: Record<
  AdminAppointment["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "Oczekuje",
    className: "bg-accent/30 text-accent-foreground border-accent/50",
  },
  CONFIRMED: {
    label: "Potwierdzona",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  DONE: {
    label: "Zrealizowana",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  CANCELLED: {
    label: "Anulowana",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
}

const MONTHS_LONG = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
]

function formatDatePretty(key: string): string {
  const [y, m, d] = key.split("-").map(Number)
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`
}

type Tab = "appointments" | "calendar"

export function AdminDashboard({
  appointments,
  blockedDays,
  blockedSlots,
  today,
}: {
  appointments: AdminAppointment[]
  blockedDays: BlockedDay[]
  blockedSlots: BlockedSlot[]
  today: string
}) {
  const [tab, setTab] = useState<Tab>("appointments")

  const upcoming = appointments.filter(
    (a) => a.date >= today && a.status !== "CANCELLED",
  )
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-serif text-xl font-medium text-foreground">
              Nicole Bosiacka
            </h1>
            <p className="text-xs text-muted-foreground">Panel rezerwacji</p>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Nadchodzące wizyty"
            value={upcoming.length}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Oczekujące"
            value={pendingCount}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Wszystkie rezerwacje"
            value={appointments.length}
          />
        </div>

        <div className="mt-8 flex gap-2 border-b border-border">
          <TabButton
            active={tab === "appointments"}
            onClick={() => setTab("appointments")}
          >
            Rezerwacje
          </TabButton>
          <TabButton
            active={tab === "calendar"}
            onClick={() => setTab("calendar")}
          >
            Dostępność
          </TabButton>
        </div>

        <div className="mt-6">
          {tab === "appointments" ? (
            <AppointmentsList appointments={appointments} today={today} />
          ) : (
            <BlockingCalendar
              blockedDays={blockedDays}
              blockedSlots={blockedSlots}
              appointments={appointments}
              today={today}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-medium text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function AppointmentsList({
  appointments,
  today,
}: {
  appointments: AdminAppointment[]
  today: string
}) {
  const [filter, setFilter] = useState<"upcoming" | "all" | "past">("upcoming")
  const [isPending, startTransition] = useTransition()
  const [toDelete, setToDelete] = useState<AdminAppointment | null>(null)

  const filtered = useMemo(() => {
    if (filter === "upcoming")
      return appointments.filter((a) => a.date >= today)
    if (filter === "past") return appointments.filter((a) => a.date < today)
    return appointments
  }, [appointments, filter, today])

  function handleStatus(id: string, status: AdminAppointment["status"]) {
    startTransition(async () => {
      await updateAppointmentStatus(id, status)
      toast.success("Status zaktualizowany.")
    })
  }

  function handleDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    startTransition(async () => {
      await deleteAppointment(id)
      toast.success("Rezerwacja usunięta.")
    })
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["upcoming", "past", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "upcoming" ? "Nadchodzące" : f === "past" ? "Minione" : "Wszystkie"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Brak rezerwacji w tej kategorii.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div
              key={appt.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {appt.firstName} {appt.lastName}
                    </p>
                    <Badge
                      variant="outline"
                      className={STATUS_CONFIG[appt.status].className}
                    >
                      {STATUS_CONFIG[appt.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {appt.serviceLabel}
                    {appt.addons.length > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        + {appt.addons.join(", ")}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDatePretty(appt.date)} · {appt.time}
                    </span>
                    <a
                      href={`tel:${appt.phone}`}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {appt.phone}
                    </a>
                    <a
                      href={`mailto:${appt.email}`}
                      className="flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {appt.email}
                    </a>
                  </div>
                  {appt.totalPrice > 0 && (
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatPrice(appt.totalPrice)}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Select
                    value={appt.status}
                    onValueChange={(v) =>
                      handleStatus(appt.id, v as AdminAppointment["status"])
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Oczekuje</SelectItem>
                      <SelectItem value="CONFIRMED">Potwierdzona</SelectItem>
                      <SelectItem value="DONE">Zrealizowana</SelectItem>
                      <SelectItem value="CANCELLED">Anulowana</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setToDelete(appt)}
                    aria-label="Usuń rezerwację"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć rezerwację?</DialogTitle>
            <DialogDescription>
              {toDelete &&
                `Rezerwacja ${toDelete.firstName} ${toDelete.lastName} (${formatDatePretty(
                  toDelete.date,
                )}, ${toDelete.time}) zostanie trwale usunięta.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
