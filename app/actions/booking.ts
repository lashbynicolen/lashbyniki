"use server"

import { prisma } from "@/lib/prisma"
import {
  warsawDateTimeToUtc,
  isSlotStillAvailable,
  formatWarsawDateLong,
  utcToWarsawTime,
  MIN_GAP_MINUTES,
} from "@/lib/booking"
import {
  findService,
  getServiceLabel,
  getServicePrice,
} from "@/lib/services"
import { sendBookingEmails } from "@/lib/email"

export interface BookingFormState {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

interface BookingPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceKey: string
  variant: string | null
  addons: string[]
  date: string
  time: string
}

function validate(payload: BookingPayload): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!payload.firstName.trim()) errors.firstName = "Podaj imię"
  if (!payload.lastName.trim()) errors.lastName = "Podaj nazwisko"
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email))
    errors.email = "Nieprawidłowy adres e-mail"
  if (payload.phone.replace(/\D/g, "").length < 9)
    errors.phone = "Nieprawidłowy numer telefonu"
  if (!payload.serviceKey) errors.serviceKey = "Wybierz usługę"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) errors.date = "Wybierz datę"
  if (!/^\d{2}:\d{2}$/.test(payload.time)) errors.time = "Wybierz godzinę"
  return errors
}

export async function createBooking(
  payload: BookingPayload,
): Promise<BookingFormState> {
  const fieldErrors = validate(payload)
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Popraw zaznaczone pola.", fieldErrors }
  }

  const found = findService(payload.serviceKey)
  if (!found) {
    return { ok: false, message: "Wybrana usługa nie istnieje." }
  }

  const startAt = warsawDateTimeToUtc(payload.date, payload.time)

  if (startAt.getTime() <= Date.now()) {
    return { ok: false, message: "Nie można rezerwować terminu w przeszłości." }
  }

  // Sprawdzenia dostępności po stronie serwera (zabezpieczenie)
  const gapMs = MIN_GAP_MINUTES * 60 * 1000
  const windowStart = new Date(startAt.getTime() - gapMs)
  const windowEnd = new Date(startAt.getTime() + gapMs)

  const [blockedDay, blockedSlot, nearbyAppointments] = await Promise.all([
    prisma.blockedDay.findUnique({ where: { date: payload.date } }),
    prisma.blockedSlot.findUnique({
      where: { date_time: { date: payload.date, time: payload.time } },
    }),
    prisma.appointment.findMany({
      where: {
        startAt: { gt: windowStart, lt: windowEnd },
        status: { not: "CANCELLED" },
      },
      select: { startAt: true },
    }),
  ])

  if (blockedDay) {
    return { ok: false, message: "Ten dzień jest niedostępny. Wybierz inny." }
  }
  if (blockedSlot) {
    return { ok: false, message: "Ta godzina jest niedostępna. Wybierz inną." }
  }
  if (!isSlotStillAvailable(startAt, nearbyAppointments.map((a) => a.startAt))) {
    return {
      ok: false,
      message:
        "Niestety ten termin został właśnie zajęty. Wybierz inną godzinę.",
    }
  }

  const serviceLabel = getServiceLabel(payload.serviceKey, payload.variant)
  const servicePrice = getServicePrice(payload.serviceKey, payload.variant)
  const addonLabels = payload.addons.map((key) => getServiceLabel(key))
  const addonsPrice = payload.addons.reduce(
    (sum, key) => sum + getServicePrice(key),
    0,
  )
  const totalPrice = servicePrice + addonsPrice

  try {
    await prisma.customer.create({
      data: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        appointments: {
          create: {
            serviceKey: payload.serviceKey,
            serviceLabel,
            variant: payload.variant,
            addons: addonLabels,
            totalPrice,
            startAt,
            status: "PENDING",
          },
        },
      },
    })
  } catch (error) {
    console.log("[v0] Błąd zapisu rezerwacji:", error)
    return {
      ok: false,
      message: "Wystąpił błąd podczas zapisu. Spróbuj ponownie.",
    }
  }

  // Wyślij e-maile (nie blokuj odpowiedzi w razie błędu SMTP)
  try {
    await sendBookingEmails({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      serviceLabel,
      addons: addonLabels,
      date: formatWarsawDateLong(startAt),
      time: utcToWarsawTime(startAt),
      totalPrice,
    })
  } catch (error) {
    console.log("[v0] Błąd wysyłki e-maili:", error)
  }

  return {
    ok: true,
    message: "Rezerwacja przyjęta! Potwierdzenie wysłaliśmy na e-mail.",
  }
}
