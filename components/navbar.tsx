"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Rezerwacja" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/opinie", label: "Opinie" },
]

/** Routes where the public navbar should be hidden (admin section). */
const HIDDEN_PREFIXES = ["/klienci"]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (hidden) return null

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex flex-col leading-tight"
          aria-label="Nicole Bosiacka – strona główna"
        >
          <span className="font-serif text-base font-medium tracking-wide text-foreground transition-colors group-hover:text-primary">
            Nicole Bosiacka
          </span>
          <span className="font-script text-sm text-primary/70 transition-colors group-hover:text-primary/90">
            Lash &amp; Beauty
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-xs tracking-widest uppercase transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-primary after:transition-transform after:duration-300",
                pathname === link.href
                  ? "text-primary font-semibold after:scale-x-100"
                  : "text-muted-foreground hover:text-foreground hover:after:scale-x-100",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-all duration-300 md:hidden",
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-6 py-4 text-xs tracking-widest uppercase transition-colors",
              pathname === link.href
                ? "text-primary font-semibold bg-secondary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
