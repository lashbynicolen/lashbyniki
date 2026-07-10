"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceOverrideRow {
  service_key: string
  variant_key: string | null
  price: number
}

// ─── Table bootstrap ──────────────────────────────────────────────────────────

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS services_overrides (
      service_key  TEXT    NOT NULL,
      variant_key  TEXT,
      price        INTEGER NOT NULL,
      PRIMARY KEY  (service_key, COALESCE(variant_key, ''))
    )
  `
}

// ─── Public read ──────────────────────────────────────────────────────────────

/**
 * Returns all price overrides as a flat map keyed by "serviceKey" or
 * "serviceKey__variantKey".
 */
export async function getPriceOverrides(): Promise<Record<string, number>> {
  await ensureTable()
  const rows = await prisma.$queryRaw<PriceOverrideRow[]>`
    SELECT service_key, variant_key, price FROM services_overrides
  `
  const map: Record<string, number> = {}
  for (const row of rows) {
    const key = row.variant_key
      ? `${row.service_key}__${row.variant_key}`
      : row.service_key
    map[key] = row.price
  }
  return map
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Brak autoryzacji")
}

/**
 * Insert or update a single price override.
 * Pass variantKey as null for services without variants.
 */
export async function upsertPriceOverride(
  serviceKey: string,
  variantKey: string | null,
  price: number,
): Promise<void> {
  await requireAuth()
  await ensureTable()

  if (variantKey) {
    await prisma.$executeRaw`
      INSERT INTO services_overrides (service_key, variant_key, price)
      VALUES (${serviceKey}, ${variantKey}, ${price})
      ON CONFLICT (service_key, COALESCE(variant_key, ''))
      DO UPDATE SET price = EXCLUDED.price
    `
  } else {
    await prisma.$executeRaw`
      INSERT INTO services_overrides (service_key, variant_key, price)
      VALUES (${serviceKey}, NULL, ${price})
      ON CONFLICT (service_key, COALESCE(variant_key, ''))
      DO UPDATE SET price = EXCLUDED.price
    `
  }

  revalidatePath("/")
  revalidatePath("/klienci/zarzadzanie")
}

/** Remove a price override (reverts to static default). */
export async function deletePriceOverride(
  serviceKey: string,
  variantKey: string | null,
): Promise<void> {
  await requireAuth()
  await ensureTable()

  if (variantKey) {
    await prisma.$executeRaw`
      DELETE FROM services_overrides
      WHERE service_key = ${serviceKey} AND variant_key = ${variantKey}
    `
  } else {
    await prisma.$executeRaw`
      DELETE FROM services_overrides
      WHERE service_key = ${serviceKey} AND variant_key IS NULL
    `
  }

  revalidatePath("/")
  revalidatePath("/klienci/zarzadzanie")
}
