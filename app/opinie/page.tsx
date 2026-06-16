import type { Metadata } from "next"
import { Star } from "lucide-react"
import { getApprovedReviews, type ReviewRow } from "@/app/opinie/actions"
import { ReviewForm } from "@/components/review-form"
import { SiteFooter } from "@/components/site-footer"
import { ScrollReveal } from "@/components/scroll-reveal"

export const metadata: Metadata = {
  title: "Opinie",
  description:
    "Opinie klientek Nicole Bosiacka – stylizacja rzęs i makijaż w Bydgoszczy. Podziel się swoją opinią.",
}

export const dynamic = "force-dynamic"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Ocena: ${rating} z 5 gwiazdek`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= rating
              ? "h-4 w-4 fill-primary stroke-primary"
              : "h-4 w-4 fill-transparent stroke-muted-foreground/40"
          }
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewRow }) {
  const date = new Date(review.created_at).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <StarRating rating={review.rating} />
      <blockquote className="flex-1 text-sm leading-relaxed text-foreground/80">
        &ldquo;{review.content}&rdquo;
      </blockquote>
      <footer className="flex items-center justify-between border-t border-border pt-4">
        <p className="font-medium text-foreground">
          {review.first_name} {review.last_name.charAt(0)}.
        </p>
        <time className="text-xs text-muted-foreground">{date}</time>
      </footer>
    </article>
  )
}

export default async function OpiniePage() {
  const reviews = await getApprovedReviews()

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.93_0.018_84)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <ScrollReveal>
            <p className="font-script text-2xl text-primary/70">Głosy klientek</p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              Opinie
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Każda wizyta to dla mnie wyjątkowe spotkanie. Sprawdź, co mówią
              klientki, które mi zaufały.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        {reviews.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
              <p className="font-script text-2xl text-primary/60">Bądź pierwsza!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Jeszcze nie ma opinii. Podziel się swoją.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <ScrollReveal key={review.id} delay={i * 80}>
                <ReviewCard review={review} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Add review form */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <ScrollReveal>
            <div className="mb-10 text-center">
              <p className="font-script text-2xl text-primary/70">Twoje zdanie</p>
              <h2 className="mt-2 font-serif text-3xl font-medium text-foreground">
                Podziel się opinią
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                Możliwość dodania opinii mają klientki, które odbyły wizytę.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <ReviewForm />
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
