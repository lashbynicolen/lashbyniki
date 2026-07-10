import type { Metadata } from "next"
import Image from "next/image"
import { SiteFooter } from "@/components/site-footer"
import { ScrollReveal } from "@/components/scroll-reveal"
import { PortfolioGallery } from "@/components/portfolio-gallery"

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Portfolio Nicole Bosiacka – stylizacja rzęs, przedłużanie i makijaż. Galeria efektów pracy.",
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.93_0.018_84)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
          <ScrollReveal>
            <p className="font-script text-2xl text-primary/70">Moje prace</p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              Portfolio
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Każda stylizacja jest indywidualnie dopasowana do klientki.
              Poniżej znajdziesz wybrane realizacje z mojej codziennej pracy.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <PortfolioGallery />
      </section>

      <SiteFooter />
    </main>
  )
}
