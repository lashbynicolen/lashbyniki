"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// Ensures the reviews table exists before any query
async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      first_name TEXT        NOT NULL,
      last_name  TEXT        NOT NULL,
      email      TEXT        NOT NULL UNIQUE,
      content    TEXT        NOT NULL,
      rating     INTEGER     NOT NULL DEFAULT 5,
      approved   BOOLEAN     NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export interface ReviewRow {
  id: number
  first_name: string
  last_name: string
  content: string
  rating: number
  created_at: Date
}

export async function getApprovedReviews(): Promise<ReviewRow[]> {
  await ensureTable()
  return prisma.$queryRaw<ReviewRow[]>`
    SELECT id, first_name, last_name, content, rating, created_at
    FROM   reviews
    WHERE  approved = true
    ORDER  BY created_at DESC
  `
}

export interface SubmitReviewState {
  ok: boolean
  message: string
}

export async function submitReview(
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  await ensureTable()

  const firstName = formData.get("firstName")?.toString().trim() ?? ""
  const lastName  = formData.get("lastName")?.toString().trim() ?? ""
  const email     = formData.get("email")?.toString().trim().toLowerCase() ?? ""
  const content   = formData.get("content")?.toString().trim() ?? ""
  const ratingRaw = parseInt(formData.get("rating")?.toString() ?? "5")
  const rating    = Math.max(1, Math.min(5, isNaN(ratingRaw) ? 5 : ratingRaw))

  if (!firstName || !lastName || !email || !content) {
    return { ok: false, message: "Uzupełnij wszystkie pola formularza." }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Podaj poprawny adres e-mail." }
  }
  if (content.length < 20) {
    return { ok: false, message: "Opinia musi mieć co najmniej 20 znaków." }
  }

  // Check if email has at least one completed appointment (DONE status)
  const doneRows = await prisma.$queryRaw<Array<{ cnt: number }>>`
    SELECT COUNT(*)::integer AS cnt
    FROM   "Appointment" a
    JOIN   "Customer"    c ON c.id = a."customerId"
    WHERE  LOWER(c.email) = ${email}
      AND  a.status = 'DONE'
  `
  const doneCount = doneRows[0]?.cnt ?? 0
  if (doneCount === 0) {
    return {
      ok: false,
      message:
        "Opinie mogą dodawać wyłącznie klientki, które odbyły wizytę. " +
        "Nie znaleziono zakończonej wizyty powiązanej z podanym adresem e-mail.",
    }
  }

  // Prevent duplicate reviews from the same email
  const dupRows = await prisma.$queryRaw<Array<{ cnt: number }>>`
    SELECT COUNT(*)::integer AS cnt FROM reviews WHERE email = ${email}
  `
  if ((dupRows[0]?.cnt ?? 0) > 0) {
    return {
      ok: false,
      message: "Na ten adres e-mail została już dodana opinia.",
    }
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO reviews (first_name, last_name, email, content, rating)
      VALUES (${firstName}, ${lastName}, ${email}, ${content}, ${rating})
    `
  } catch {
    return {
      ok: false,
      message: "Wystąpił błąd podczas zapisu. Spróbuj ponownie.",
    }
  }

  return { ok: true, message: "Dziękujemy za opinię! Została opublikowana." }
}

// ─── Admin-only actions ───────────────────────────────────────────────────────

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Brak autoryzacji")
}

export interface AdminReviewRow {
  id: number
  first_name: string
  last_name: string
  email: string
  content: string
  rating: number
  approved: boolean
  created_at: Date
}

/** Returns ALL reviews (approved + hidden) for the admin dashboard. */
export async function getAllReviews(): Promise<AdminReviewRow[]> {
  await requireAuth()
  await ensureTable()
  return prisma.$queryRaw<AdminReviewRow[]>`
    SELECT id, first_name, last_name, email, content, rating, approved, created_at
    FROM   reviews
    ORDER  BY created_at DESC
  `
}

/** Permanently delete a review by id. */
export async function deleteReview(id: number): Promise<void> {
  await requireAuth()
  await ensureTable()
  await prisma.$executeRaw`DELETE FROM reviews WHERE id = ${id}`
  revalidatePath("/opinie")
  revalidatePath("/klienci/zarzadzanie")
}

/** Toggle the approved flag of a review. */
export async function toggleReviewApproval(id: number, approved: boolean): Promise<void> {
  await requireAuth()
  await ensureTable()
  await prisma.$executeRaw`UPDATE reviews SET approved = ${approved} WHERE id = ${id}`
  revalidatePath("/opinie")
  revalidatePath("/klienci/zarzadzanie")
}

/** Add a review manually (admin bypasses the DONE-appointment check). */
export async function adminAddReview(
  firstName: string,
  lastName: string,
  email: string,
  content: string,
  rating: number,
): Promise<{ ok: boolean; message: string }> {
  await requireAuth()
  await ensureTable()

  if (!firstName || !lastName || !email || !content) {
    return { ok: false, message: "Uzupełnij wszystkie pola." }
  }
  if (content.length < 5) {
    return { ok: false, message: "Treść jest za krótka." }
  }

  const dupRows = await prisma.$queryRaw<Array<{ cnt: number }>>`
    SELECT COUNT(*)::integer AS cnt FROM reviews WHERE email = ${email}
  `
  if ((dupRows[0]?.cnt ?? 0) > 0) {
    return { ok: false, message: "Opinia dla tego e-mail już istnieje." }
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO reviews (first_name, last_name, email, content, rating)
      VALUES (${firstName}, ${lastName}, ${email}, ${content}, ${rating})
    `
  } catch {
    return { ok: false, message: "Błąd zapisu. Spróbuj ponownie." }
  }

  revalidatePath("/opinie")
  revalidatePath("/klienci/zarzadzanie")
  return { ok: true, message: "Opinia została dodana." }
}
