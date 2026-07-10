"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Delay before animation starts, in ms */
  delay?: number
  /** Direction the element slides in from */
  from?: "bottom" | "left" | "right" | "none"
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => {
      const t = setTimeout(() => {
        el.classList.add("sr-visible")
      }, delay)
      return t
    }

    // If the element is already in the viewport on mount, reveal immediately.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      const t = reveal()
      return () => clearTimeout(t)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = reveal()
          observer.unobserve(el)
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "sr-hidden",
        from === "left" && "sr-from-left",
        from === "right" && "sr-from-right",
        from === "none" && "sr-from-none",
        className,
      )}
    >
      {children}
    </div>
  )
}
