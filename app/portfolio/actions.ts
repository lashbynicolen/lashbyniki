"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PortfolioCategory = "rzesy" | "makijaz"

export interface PortfolioImageRow {
  id: number
  src: string
  alt: string
  category: PortfolioCategory
  wide: boolean
  tall: boolean
  sort_order: number
  created_at: Date
}

// ─── Static seed data (mirrors portfolio-gallery.tsx) ────────────────────────

const STATIC_IMAGES: Omit<PortfolioImageRow, "id" | "created_at">[] = [
  { src: "/portfolio/rzesy-wet-look-01.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: true,  sort_order: 10 },
  { src: "/portfolio/makijaz-slubny-01.jpg", alt: "Makijaż ślubny",            category: "makijaz", wide: true,  tall: false, sort_order: 20 },
  { src: "/portfolio/rzesy-wet-look-02.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 30 },
  { src: "/portfolio/makijaz-okolicznosciowy-01.jpg", alt: "Makijaż okolicznościowy", category: "makijaz", wide: false, tall: false, sort_order: 40 },
  { src: "/portfolio/rzesy-wet-look-03.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: true,  sort_order: 50 },
  { src: "/portfolio/makijaz-slubny-02.jpg", alt: "Makijaż ślubny",            category: "makijaz", wide: false, tall: false, sort_order: 60 },
  { src: "/portfolio/rzesy-wet-look-04.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 70 },
  { src: "/portfolio/makijaz-okolicznosciowy-02.jpg", alt: "Makijaż okolicznościowy", category: "makijaz", wide: true,  tall: false, sort_order: 80 },
  { src: "/portfolio/rzesy-wet-look-05.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 90 },
  { src: "/portfolio/rzesy-wet-look-06.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: true,  sort_order: 100 },
  { src: "/portfolio/makijaz-okolicznosciowy-03.jpg", alt: "Makijaż okolicznościowy", category: "makijaz", wide: false, tall: false, sort_order: 110 },
  { src: "/portfolio/rzesy-wet-look-07.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 120 },
  { src: "/portfolio/makijaz-okolicznosciowy-04.jpg", alt: "Makijaż okolicznościowy", category: "makijaz", wide: false, tall: false, sort_order: 130 },
  { src: "/portfolio/rzesy-wet-look-08.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: true,  sort_order: 140 },
  { src: "/portfolio/rzesy-wet-look-09.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 150 },
  { src: "/portfolio/rzesy-wet-look-10.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: true,  sort_order: 160 },
  { src: "/portfolio/rzesy-wet-look-11.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 170 },
  { src: "/portfolio/rzesy-wet-look-12.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy", wide: false, tall: false, sort_order: 180 },
  { src: "/portfolio/rzesy-wispy-set-01.jpg", alt: "Stylizacja rzęs: Wispy Set", category: "rzesy", wide: false, tall: true,  sort_order: 190 },
  { src: "/portfolio/rzesy-wispy-set-02.jpg", alt: "Stylizacja rzęs: Wispy Set", category: "rzesy", wide: false, tall: false, sort_order: 200 },
  { src: "/portfolio/rzesy-brazowe-01.jpg", alt: "Stylizacja rzęs: Brązowe",    category: "rzesy", wide: false, tall: true,  sort_order: 210 },
  { src: "/portfolio/rzesy-wet-dodatek-kolor-01.jpg", alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek", category: "rzesy", wide: false, tall: true,  sort_order: 220 },
  { src: "/portfolio/rzesy-wet-dodatek-kolor-02.jpg", alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek", category: "rzesy", wide: false, tall: false, sort_order: 230 },
  { src: "/portfolio/rzesy-wet-dodatek-kolor-03.jpg", alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek", category: "rzesy", wide: false, tall: false, sort_order: 240 },
  { src: "/portfolio/rzesy-5d-01.jpg", alt: "Stylizacja rzęs: 5D (skręt D)", category: "rzesy", wide: false, tall: false, sort_order: 250 },
  { src: "/portfolio/rzesy-5d-02.jpg", alt: "Stylizacja rzęs: 5D (skręt D)", category: "rzesy", wide: false, tall: true,  sort_order: 260 },
  { src: "/portfolio/rzesy23d-01.jpg", alt: "Stylizacja rzęs: 2-3D",         category: "rzesy", wide: false, tall: true,  sort_order: 270 },
  { src: "/portfolio/rzesy-11-01.jpg", alt: "Stylizacja rzęs: 1:1",          category: "rzesy", wide: false, tall: true,  sort_order: 280 },
]

// ─── Table bootstrap ──────────────────────────────────────────────────────────

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS portfolio_images (
      id          SERIAL        PRIMARY KEY,
      src         TEXT          NOT NULL UNIQUE,
      alt         TEXT          NOT NULL,
      category    TEXT          NOT NULL DEFAULT 'rzesy',
      wide        BOOLEAN       NOT NULL DEFAULT false,
      tall        BOOLEAN       NOT NULL DEFAULT false,
      sort_order  INTEGER       NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  // Seed from static array if the table is empty
  const countRows = await prisma.$queryRaw<Array<{ cnt: number }>>`
    SELECT COUNT(*)::integer AS cnt FROM portfolio_images
  `
  if ((countRows[0]?.cnt ?? 0) === 0) {
    for (const img of STATIC_IMAGES) {
      await prisma.$executeRaw`
        INSERT INTO portfolio_images (src, alt, category, wide, tall, sort_order)
        VALUES (${img.src}, ${img.alt}, ${img.category}, ${img.wide}, ${img.tall}, ${img.sort_order})
        ON CONFLICT (src) DO NOTHING
      `
    }
  }
}

// ─── Public read ──────────────────────────────────────────────────────────────

/** Returns all portfolio images ordered by sort_order. Used by the public gallery. */
export async function getPortfolioImages(): Promise<PortfolioImageRow[]> {
  await ensureTable()
  return prisma.$queryRaw<PortfolioImageRow[]>`
    SELECT id, src, alt, category, wide, tall, sort_order, created_at
    FROM   portfolio_images
    ORDER  BY sort_order ASC, created_at ASC
  `
}

// ─── Admin mutations ──────────────────────────────────────────────────────────

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Brak autoryzacji")
}

/** Add a new portfolio image row (src is a public path like /portfolio/xxx.jpg). */
export async function addPortfolioImage(
  src: string,
  alt: string,
  category: PortfolioCategory,
  wide = false,
  tall = false,
): Promise<{ ok: boolean; message: string }> {
  await requireAuth()
  await ensureTable()

  if (!src || !alt) {
    return { ok: false, message: "Brakuje adresu lub opisu zdjęcia." }
  }

  const maxOrder = await prisma.$queryRaw<Array<{ max: number | null }>>`
    SELECT MAX(sort_order) AS max FROM portfolio_images
  `
  const nextOrder = (maxOrder[0]?.max ?? 0) + 10

  try {
    await prisma.$executeRaw`
      INSERT INTO portfolio_images (src, alt, category, wide, tall, sort_order)
      VALUES (${src}, ${alt}, ${category}, ${wide}, ${tall}, ${nextOrder})
      ON CONFLICT (src) DO UPDATE SET alt = EXCLUDED.alt, category = EXCLUDED.category
    `
  } catch {
    return { ok: false, message: "Błąd zapisu. Spróbuj ponownie." }
  }

  revalidatePath("/portfolio")
  revalidatePath("/klienci/zarzadzanie")
  return { ok: true, message: "Zdjęcie zostało dodane do portfolio." }
}

/** Delete a portfolio image row by id. */
export async function deletePortfolioImage(id: number): Promise<void> {
  await requireAuth()
  await ensureTable()
  await prisma.$executeRaw`DELETE FROM portfolio_images WHERE id = ${id}`
  revalidatePath("/portfolio")
  revalidatePath("/klienci/zarzadzanie")
}
