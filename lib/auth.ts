import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"

const COOKIE_NAME = "nb_admin_session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 dni

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "nicole-bosiacka-default-secret-change-me"
  )
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex")
}

function createToken(): string {
  const expires = Date.now() + SESSION_DURATION_MS
  const payload = `admin.${expires}`
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const parts = token.split(".")
  if (parts.length !== 3) return false
  const [role, expires, signature] = parts
  const payload = `${role}.${expires}`
  const expected = sign(payload)
  try {
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    if (!timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  if (Number(expires) < Date.now()) return false
  return role === "admin"
}

/** Weryfikuje dane logowania względem zmiennych środowiskowych */
export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD
  if (!expectedUser || !expectedPass) {
    console.log("[v0] Brak ADMIN_USERNAME / ADMIN_PASSWORD w zmiennych środowiskowych.")
    return false
  }
  return username === expectedUser && password === expectedPass
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyToken(cookieStore.get(COOKIE_NAME)?.value)
}
