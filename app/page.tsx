import { Hero } from "@/components/hero"
import { BookingForm } from "@/components/booking-form"
import { SiteFooter } from "@/components/site-footer"
import { getServiceCategoriesWithPrices } from "@/lib/services"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const serviceCategories = await getServiceCategoriesWithPrices()
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <section className="mt-6">
        <BookingForm serviceCategories={serviceCategories} />
      </section>
      <SiteFooter />
    </main>
  )
}
