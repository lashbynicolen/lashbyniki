import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz"

export const TIMEZONE = "Europe/Warsaw"

/** Minimalna przerwa między wizytami: 2h 15min = 135 minut */
export const MIN_GAP_MINUTES = 135

/** Godziny pracy (lokalny czas Europe/Warsaw) */
export const WORK_START_HOUR = 9 // 09:00
export const WORK_END_HOUR = 20 // ostatni możliwy start 19:45
/** Krok siatki czasu w minutach */
export const SLOT_STEP_MINUTES = 15

/** Konwertuje datę (YYYY-MM-DD) + czas (HH:mm) w strefie Warszawy na absolutny instant UTC */
export function warsawDateTimeToUtc(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE)
}

/** Zwraca lokalną (Warszawa) datę w formacie YYYY-MM-DD dla danego instantu */
export function utcToWarsawDate(instant: Date): string {
  return formatInTimeZone(instant, TIMEZONE, "yyyy-MM-dd")
}

/** Zwraca lokalny (Warszawa) czas w formacie HH:mm dla danego instantu */
export function utcToWarsawTime(instant: Date): string {
  return formatInTimeZone(instant, TIMEZONE, "HH:mm")
}

/** Formatuje instant do czytelnej daty PL */
export function formatWarsawDateLong(instant: Date): string {
  return formatInTimeZone(instant, TIMEZONE, "dd.MM.yyyy")
}

/** Dzisiejsza data w strefie Warszawy (YYYY-MM-DD) */
export function todayWarsaw(): string {
  return formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd")
}

/** Generuje wszystkie możliwe sloty czasowe dla dnia (HH:mm) */
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }
  return slots
}

export interface AvailabilityInput {
  /** Data w formacie YYYY-MM-DD (Warszawa) */
  date: string
  /** Istniejące wizyty jako absolutne instanty UTC */
  existingAppointments: Date[]
  /** Zablokowane konkretne godziny dla tego dnia (HH:mm) */
  blockedTimes: string[]
  /** Czy cały dzień jest zablokowany */
  dayBlocked: boolean
}

/**
 * Oblicza dostępne sloty czasowe dla danego dnia.
 * Slot jest niedostępny, jeśli:
 *  - dzień jest zablokowany
 *  - godzina jest zablokowana
 *  - jest w przeszłości
 *  - jest w odległości mniejszej niż MIN_GAP_MINUTES od istniejącej wizyty
 */
export function getAvailableSlots(input: AvailabilityInput): string[] {
  const { date, existingAppointments, blockedTimes, dayBlocked } = input

  if (dayBlocked) return []

  const now = new Date()
  const gapMs = MIN_GAP_MINUTES * 60 * 1000
  const blockedSet = new Set(blockedTimes)

  return generateTimeSlots().filter((time) => {
    if (blockedSet.has(time)) return false

    const slotInstant = warsawDateTimeToUtc(date, time)

    // przeszłość (z 30 min buforem)
    if (slotInstant.getTime() <= now.getTime() + 30 * 60 * 1000) return false

    // sprawdź odstęp od istniejących wizyt
    for (const appt of existingAppointments) {
      const diff = Math.abs(slotInstant.getTime() - appt.getTime())
      if (diff < gapMs) return false
    }

    return true
  })
}

/**
 * Sprawdza po stronie serwera czy dany slot jest nadal wolny (zabezpieczenie przed podwójną rezerwacją).
 */
export function isSlotStillAvailable(
  candidate: Date,
  existingAppointments: Date[],
): boolean {
  const gapMs = MIN_GAP_MINUTES * 60 * 1000
  for (const appt of existingAppointments) {
    const diff = Math.abs(candidate.getTime() - appt.getTime())
    if (diff < gapMs) return false
  }
  return true
}

export { toZonedTime }
