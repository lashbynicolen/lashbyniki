import { Hero } from "@/components/hero"
import { BookingForm } from "@/components/booking-form"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <section className="mt-6">
        <BookingForm />
      </section>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-serif text-lg text-foreground">Nicole Bosiacka</p>
          <p className="font-script text-xl text-primary/70">Lash &amp; Beauty</p>
          <p className="mt-3 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Nicole Bosiacka. Wszelkie prawa
            zastrzeżone.
          </p>
        </div>
      </footer>
    </main>
  )
}
