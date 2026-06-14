import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAvailableSlots,
  warsawDateTimeToUtc,
  TIMEZONE,
} from "@/lib/booking"
import { formatInTimeZone } from "date-fns-tz"

export const dynamic = "force-dynamic"

/**
 * GET /api/availability?date=YYYY-MM-DD
 * Zwraca listę dostępnych godzin (HH:mm) dla danego dnia.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Nieprawidłowa data" }, { status: 400 })
  }

  // Zakres dnia w UTC (od północy do północy czasu Warszawy)
  const dayStart = warsawDateTimeToUtc(date, "00:00")
  const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const [appointments, blockedDay, blockedSlots] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startAt: { gte: dayStart, lt: nextDay },
        status: { not: "CANCELLED" },
      },
      select: { startAt: true },
    }),
    prisma.blockedDay.findUnique({ where: { date } }),
    prisma.blockedSlot.findMany({ where: { date }, select: { time: true } }),
  ])

  const slots = getAvailableSlots({
    date,
    existingAppointments: appointments.map((a) => a.startAt),
    blockedTimes: blockedSlots.map((b) => b.time),
    dayBlocked: Boolean(blockedDay),
  })

  return NextResponse.json({
    date,
    dayBlocked: Boolean(blockedDay),
    slots,
    timezone: TIMEZONE,
    serverDate: formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd"),
  })
}
