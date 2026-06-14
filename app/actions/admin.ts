"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  checkCredentials,
  createSession,
  destroySession,
  isAuthenticated,
} from "@/lib/auth"

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = String(formData.get("username") || "")
  const password = String(formData.get("password") || "")

  if (!checkCredentials(username, password)) {
    return { error: "Nieprawidłowy login lub hasło." }
  }

  await createSession()
  redirect("/klienci")
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/klienci/logowanie")
}

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Brak autoryzacji")
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED",
): Promise<void> {
  await requireAuth()
  await prisma.appointment.update({ where: { id }, data: { status } })
  revalidatePath("/klienci")
}

export async function deleteAppointment(id: string): Promise<void> {
  await requireAuth()
  await prisma.appointment.delete({ where: { id } })
  revalidatePath("/klienci")
}

export async function blockDay(date: string, note?: string): Promise<void> {
  await requireAuth()
  await prisma.blockedDay.upsert({
    where: { date },
    create: { date, note },
    update: { note },
  })
  revalidatePath("/klienci")
}

export async function unblockDay(date: string): Promise<void> {
  await requireAuth()
  await prisma.blockedDay.deleteMany({ where: { date } })
  revalidatePath("/klienci")
}

export async function blockSlot(
  date: string,
  time: string,
  note?: string,
): Promise<void> {
  await requireAuth()
  await prisma.blockedSlot.upsert({
    where: { date_time: { date, time } },
    create: { date, time, note },
    update: { note },
  })
  revalidatePath("/klienci")
}

export async function unblockSlot(date: string, time: string): Promise<void> {
  await requireAuth()
  await prisma.blockedSlot.deleteMany({ where: { date, time } })
  revalidatePath("/klienci")
}
