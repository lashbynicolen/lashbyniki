/**
 * Konfiguracja usług i cen.
 *
 * Ceny bazowe są zdefiniowane tutaj. Administratorzy mogą nadpisywać je
 * przez dashboard — nadpisania trafiają do tabeli `services_overrides` w DB.
 * Funkcja `getServiceCategoriesWithPrices()` scala bazowe ceny z nadpisaniami.
 */

export type ServiceVariantKey = "nowe" | "uzupelnienie"

export interface ServiceVariant {
  key: ServiceVariantKey
  label: string
  price: number
}

export interface Service {
  key: string
  label: string
  /** Jeśli usługa ma warianty (Nowe / Uzupełnienie) */
  variants?: ServiceVariant[]
  /** Cena dla usług bez wariantów */
  price?: number
}

export interface ServiceCategory {
  key: string
  label: string
  description?: string
  services: Service[]
}

/** Pomocnik: usługa rzęs z wariantami Nowe / Uzupełnienie */
function lashService(
  key: string,
  label: string,
  pricesNowe = 0,
  pricesUzupelnienie = 0,
): Service {
  return {
    key,
    label,
    variants: [
      { key: "nowe", label: "Nowe", price: pricesNowe },
      { key: "uzupelnienie", label: "Uzupełnienie", price: pricesUzupelnienie },
    ],
  }
}

export const serviceCategories: ServiceCategory[] = [
  {
    key: "rzesy",
    label: "Stylizacja Rzęs",
    services: [
      lashService("1-1", "1:1", 90, 50),
      lashService("2-3d", "2-3D", 100, 60),
      lashService("3-4d", "3-4D", 130, 90),
      lashService("5d", "5D", 140, 100),
      lashService("wet-look", "Wet Look", 150, 110),
      lashService("wispy-set", "Wispy Set", 160, 140),
      lashService("kolorowe-rzesy", "Kolorowe Rzęsy", 120, 80),
      lashService("brazowe-rzesy", "Brązowe Rzęsy", 150, 110),
    ],
  },
  {
    key: "dodatki",
    label: "Dodatki do Rzęs",
    description: "Opcjonalne dodatki, które możesz dołączyć do wizyty.",
    services: [
      { key: "kolorowe-dodatek", label: "Kolorowe rzęsy jako dodatek", price: 40 },
      { key: "sciagniecie", label: "Ściągnięcie stylizacji", price: 50 },
    ],
  },
  {
    key: "makijaz",
    label: "Makijaż",
    services: [
      { key: "makijaz-slubny-probny", label: "Makijaż ślubny próbny", price: 150 },
      { key: "makijaz-slubny", label: "Makijaż ślubny", price: 180 },
      { key: "makijaz-okolicznosciowy", label: "Makijaż okolicznościowy", price: 180 },
    ],
  },
]

/** Kategorie usług głównych (wymagają wyboru jednej usługi) */
export const mainCategoryKeys = ["rzesy", "makijaz"]

/** Kategoria dodatków (wielokrotny wybór, opcjonalne) */
export const addonCategoryKey = "dodatki"

export const makeupInfoMessage =
  "Jeżeli istnieje taka możliwość, dojeżdżam do klientki i wykonuję usługę na miejscu."

/** Formatuje cenę do wyświetlenia */
export function formatPrice(price: number): string {
  return `${price} zł`
}

/** Wyszukuje wszystkie usługi spłaszczone z informacją o kategorii */
export interface FlatService {
  categoryKey: string
  categoryLabel: string
  service: Service
}

export function getAllServices(): FlatService[] {
  return serviceCategories.flatMap((category) =>
    category.services.map((service) => ({
      categoryKey: category.key,
      categoryLabel: category.label,
      service,
    })),
  )
}

/** Znajduje usługę po kluczu */
export function findService(serviceKey: string): FlatService | undefined {
  return getAllServices().find((s) => s.service.key === serviceKey)
}

/** Oblicza cenę dla wybranej usługi + wariantu */
export function getServicePrice(
  serviceKey: string,
  variantKey?: string | null,
): number {
  const found = findService(serviceKey)
  if (!found) return 0
  const { service } = found
  if (service.variants && variantKey) {
    return service.variants.find((v) => v.key === variantKey)?.price ?? 0
  }
  return service.price ?? 0
}

/** Czytelna etykieta usługi (z wariantem jeśli istnieje) */
export function getServiceLabel(
  serviceKey: string,
  variantKey?: string | null,
): string {
  const found = findService(serviceKey)
  if (!found) return serviceKey
  const { service } = found
  if (service.variants && variantKey) {
    const variant = service.variants.find((v) => v.key === variantKey)
    return `${service.label}${variant ? ` – ${variant.label}` : ""}`
  }
  return service.label
}

/**
 * Returns a deep clone of serviceCategories with prices merged from
 * the DB overrides table. Use this in server components / server actions
 * so the displayed and booked prices always reflect admin edits.
 */
export async function getServiceCategoriesWithPrices(): Promise<ServiceCategory[]> {
  // Lazy import to avoid pulling prisma into client bundles
  const { getPriceOverrides } = await import("@/app/actions/services")
  const overrides = await getPriceOverrides()

  return serviceCategories.map((cat) => ({
    ...cat,
    services: cat.services.map((svc) => {
      if (svc.variants) {
        return {
          ...svc,
          variants: svc.variants.map((v) => {
            const mapKey = `${svc.key}__${v.key}`
            return mapKey in overrides
              ? { ...v, price: overrides[mapKey] }
              : { ...v }
          }),
        }
      }
      return svc.key in overrides
        ? { ...svc, price: overrides[svc.key] }
        : { ...svc }
    }),
  }))
}

/**
 * DB-aware price lookup for use in server actions (e.g. booking).
 * Falls back to static price when no override is stored.
 */
export async function getServicePriceFromDB(
  serviceKey: string,
  variantKey?: string | null,
): Promise<number> {
  const { getPriceOverrides } = await import("@/app/actions/services")
  const overrides = await getPriceOverrides()
  const mapKey = variantKey ? `${serviceKey}__${variantKey}` : serviceKey
  if (mapKey in overrides) return overrides[mapKey]
  return getServicePrice(serviceKey, variantKey)
}
