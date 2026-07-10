"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

type Category = "wszystkie" | "rzesy" | "makijaz"

interface GalleryImage {
  src: string
  alt: string
  category: Exclude<Category, "wszystkie">
  wide?: boolean
  tall?: boolean
}

/**
 * To add real images:
 * 1. Place your photos in /public/portfolio/
 * 2. Replace the placeholder URLs below with e.g. "/portfolio/rzesy-01.jpg"
 * 3. Update the alt text and category for each image
 */
const images: GalleryImage[] = [
  {
    src: "/portfolio/rzesy-wet-look-01.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/makijaz-slubny-01.jpg?height=700&width=900",
    alt: "Makijaż ślubny",
    category: "makijaz",
    wide: true,
  },
  {
    src: "/portfolio/rzesy-wet-look-02.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/makijaz-okolicznosciowy-01.jpg?height=700&width=700",
    alt: "Makijaż okolicznościowy",
    category: "makijaz",
  },
  {
    src: "/portfolio/rzesy-wet-look-03.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/makijaz-slubny-02.jpg?height=700&width=700",
    alt: "Makijaż ślubny",
    category: "makijaz",
  },
  {
    src: "/portfolio/rzesy-wet-look-04.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/makijaz-okolicznosciowy-02.jpg?height=700&width=900",
    alt: "Makijaż okolicznościowy",
    category: "makijaz",
    wide: true,
  },
  {
    src: "/portfolio/rzesy-wet-look-05.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-wet-look-06.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/makijaz-okolicznosciowy-03.jpg?height=700&width=700",
    alt: "Makijaż okolicznościowy",
    category: "makijaz",
  },
  {
    src: "/portfolio/rzesy-wet-look-07.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/makijaz-okolicznosciowy-04.jpg?height=700&width=900",
    alt: "Makijaż okolicznościowy",
    category: "makijaz",
  },
  {
    src: "/portfolio/rzesy-wet-look-08.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-wet-look-09.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-wet-look-10.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-wet-look-11.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-wet-look-12.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-wispy-set-01.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wispy Set",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-wispy-set-02.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wispy Set",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-brazowe-01.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Brązowe",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-wet-dodatek-kolor-01.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-wet-dodatek-kolor-02.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-wet-dodatek-kolor-03.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: Wet Look z kolorem jako dodatek",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-5d-01.jpg?height=700&width=700",
    alt: "Stylizacja rzęs: 5D (skręt D)",
    category: "rzesy",
  },
  {
    src: "/portfolio/rzesy-5d-02.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: 5D (skręt D)",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy23d-01.jpg?height=900&width=700",
    alt: "Stylizacja rzęs: 2-3D",
    category: "rzesy",
    tall: true,
  },
  {
    src: "/portfolio/rzesy-11-01.jpg?height=900&width=900",
    alt: "Stylizacja rzęs: 1:1",
    category: "rzesy",
    tall: true,
  },
]

const categoryLabels: Record<Category, string> = {
  wszystkie: "Wszystkie",
  rzesy: "Stylizacja rzęs",
  makijaz: "Makijaż",
}

export function PortfolioGallery() {
  const [active, setActive] = useState<Category>("wszystkie")
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  const filtered =
    active === "wszystkie"
      ? images
      : images.filter((img) => img.category === active)

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {(["wszystkie", "rzesy", "makijaz"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-5 py-2 text-xs tracking-widest uppercase transition-all duration-200",
              active === cat
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Masonry-style grid using CSS columns */}
      <div
        className="columns-2 gap-3 md:columns-3 lg:columns-4"
        style={{ columnFill: "balance" }}
      >
        {filtered.map((img, i) => (
          <div
            key={img.src + i}
            className="group relative mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-border bg-muted shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{
              animationDelay: `${(i % 8) * 60}ms`,
            }}
            onClick={() => setLightbox(img)}
            onKeyDown={(e) => e.key === "Enter" && setLightbox(img)}
            tabIndex={0}
            role="button"
            aria-label={`Powiększ: ${img.alt}`}
          >
            <div
              className={cn(
                "relative w-full",
                img.tall ? "aspect-[3/4]" : img.wide ? "aspect-[4/3]" : "aspect-square",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-foreground/0 transition-all duration-300 group-hover:bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="rounded-full bg-background/80 p-2 backdrop-blur-sm">
                  <ZoomIn className="h-4 w-4 text-foreground" />
                </div>
              </div>
            </div>
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-foreground/70 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
              <p className="text-xs text-primary-foreground/90">{img.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
        >
          <button
            className="absolute right-4 top-4 z-10 rounded-full bg-card p-2 text-muted-foreground shadow-md transition-colors hover:text-foreground"
            onClick={() => setLightbox(null)}
            aria-label="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-3xl w-full overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={lightbox.alt}
              width={900}
              height={900}
              className="h-auto max-h-[85vh] w-full object-contain"
              priority
            />
            <p className="bg-card px-5 py-3 text-sm text-muted-foreground">
              {lightbox.alt}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
