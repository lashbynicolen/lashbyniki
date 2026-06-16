"use client"

import { useActionState, useState } from "react"
import { Star } from "lucide-react"
import { submitReview, type SubmitReviewState } from "@/app/opinie/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const initial: SubmitReviewState = { ok: false, message: "" }

export function ReviewForm() {
  const [state, formAction, pending] = useActionState(submitReview, initial)
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/60 px-8 py-10 text-center">
        <p className="font-script text-3xl text-primary">Dziękujemy!</p>
        <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rev-firstName">Imię</Label>
          <Input
            id="rev-firstName"
            name="firstName"
            placeholder="Zofia"
            required
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rev-lastName">Nazwisko</Label>
          <Input
            id="rev-lastName"
            name="lastName"
            placeholder="Kowalska"
            required
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rev-email">Adres e-mail</Label>
        <Input
          id="rev-email"
          name="email"
          type="email"
          placeholder="zofia@przykład.pl"
          required
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground">
          Musi być to adres użyty przy rezerwacji wizyty.
        </p>
      </div>

      {/* Star rating */}
      <div className="space-y-1.5">
        <Label>Ocena</Label>
        <div className="flex gap-1" role="radiogroup" aria-label="Ocena (1–5 gwiazdek)">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} gwiazdek`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  n <= (hovered || rating)
                    ? "fill-primary stroke-primary"
                    : "fill-transparent stroke-muted-foreground/50",
                )}
              />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rev-content">Twoja opinia</Label>
        <Textarea
          id="rev-content"
          name="content"
          placeholder="Napisz kilka słów o swojej wizycie…"
          rows={5}
          required
          minLength={20}
          className="resize-none bg-background"
        />
      </div>

      {state.message && !state.ok && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Wysyłanie…" : "Wyślij opinię"}
      </Button>
    </form>
  )
}
