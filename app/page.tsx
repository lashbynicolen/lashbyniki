import { Hero } from "@/components/hero"
import { BookingForm } from "@/components/booking-form"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <section className="mt-6">
        <BookingForm />
      </section>
      <SiteFooter />
    </main>
  )
}
