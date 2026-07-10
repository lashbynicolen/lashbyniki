import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  utcToWarsawDate,
  utcToWarsawTime,
  todayWarsaw,
} from "@/lib/booking"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const metadata: Metadata = {
  title: "Panel klientek",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function KlienciPage() {
  if (!(await isAuthenticated())) {
    redirect("/klienci/logowanie")
  }

  const [appointments, blockedDays, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      include: { customer: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.blockedDay.findMany({ orderBy: { date: "asc" } }),
    prisma.blockedSlot.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] }),
  ])

  const serializedAppointments = appointments.map((a) => ({
    id: a.id,
    firstName: a.customer.firstName,
    lastName: a.customer.lastName,
    email: a.customer.email,
    phone: a.customer.phone,
    serviceLabel: a.serviceLabel,
    addons: a.addons,
    totalPrice: a.totalPrice,
    status: a.status,
    date: utcToWarsawDate(a.startAt),
    time: utcToWarsawTime(a.startAt),
    startAtIso: a.startAt.toISOString(),
  }))

  return (
    <AdminDashboard
      appointments={serializedAppointments}
      blockedDays={blockedDays.map((b) => ({ date: b.date, note: b.note }))}
      blockedSlots={blockedSlots.map((b) => ({
        date: b.date,
        time: b.time,
        note: b.note,
      }))}
      today={todayWarsaw()}
    />
  )
}
