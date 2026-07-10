"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  ListOrdered,
  ImageIcon,
  Star,
  Trash2,
  Plus,
  EyeOff,
  Eye,
  Pencil,
  Check,
  X,
  ArrowLeft,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Real data types & server actions — reviews
import type { AdminReviewRow } from "@/app/opinie/actions"
import {
  deleteReview,
  toggleReviewApproval,
  adminAddReview,
} from "@/app/opinie/actions"

// Real data types & server actions — portfolio
import type { PortfolioImageRow } from "@/app/portfolio/actions"
import {
  deletePortfolioImage,
  addPortfolioImage,
} from "@/app/portfolio/actions"

// Real service categories from lib/services.ts
import type { ServiceCategory } from "@/lib/services"

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialReviews: AdminReviewRow[]
  initialPortfolioImages: PortfolioImageRow[]
  initialServiceCategories: ServiceCategory[]
}

type Tab = "overview" | "cennik" | "portfolio" | "opinie"

// ─── Shared helper ────────────────────────────────────────────────────────────

function StarDisplay({
  rating,
  onChange,
}: {
  rating: number
  onChange?: (n: number) => void
}) {
  return (
    <div className="flex gap-0.5" aria-label={`Ocena: ${rating} z 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={cn(
            "transition-colors",
            onChange ? "cursor-pointer" : "cursor-default pointer-events-none",
          )}
          aria-label={`${n} gwiazdek`}
        >
          <Star
            className={cn(
              "h-4 w-4",
              n <= rating
                ? "fill-primary stroke-primary"
                : "fill-transparent stroke-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  reviews,
  portfolioImages,
  serviceCategories,
  onChangeTab,
}: {
  reviews: AdminReviewRow[]
  portfolioImages: PortfolioImageRow[]
  serviceCategories: ServiceCategory[]
  onChangeTab: (t: Tab) => void
}) {
  const totalServices = serviceCategories.reduce(
    (sum, cat) => sum + cat.services.length,
    0,
  )
  const approvedCount = reviews.filter((r) => r.approved).length
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—"

  const stats = [
    {
      label: "Usługi w cenniku",
      value: totalServices,
      sub: `${serviceCategories.length} kategorie`,
      tab: "cennik" as Tab,
    },
    {
      label: "Zdjęcia w portfolio",
      value: portfolioImages.length,
      sub: `${portfolioImages.filter((p) => p.category === "rzesy").length} rzęsy · ${portfolioImages.filter((p) => p.category === "makijaz").length} makijaż`,
      tab: "portfolio" as Tab,
    },
    {
      label: "Opinie widoczne",
      value: approvedCount,
      sub: `${reviews.length - approvedCount} ukryte`,
      tab: "opinie" as Tab,
    },
    {
      label: "Średnia ocena",
      value: avgRating,
      sub: `z ${reviews.length} opinii`,
      tab: "opinie" as Tab,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-foreground">
          Przegląd
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dane na żywo z bazy PostgreSQL i pliku konfiguracyjnego usług.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onChangeTab(s.tab)}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <p className="font-serif text-3xl font-medium text-primary">
              {s.value}
            </p>
            <p className="text-sm font-medium text-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Last 5 reviews */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-medium text-foreground">
          Ostatnie opinie
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak opinii w bazie.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {reviews.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-4 border-b border-border px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {r.first_name} {r.last_name.charAt(0)}.
                    </span>
                    <StarDisplay rating={r.rating} />
                    {!r.approved && (
                      <Badge variant="secondary" className="text-xs">
                        Ukryta
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {r.content}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("pl-PL")}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Cennik Tab ───────────────────────────────────────────────────────────────
// Services are stored in lib/services.ts (static TypeScript file).
// In-session price edits mutate the imported object in memory; to persist them
// permanently the user must edit lib/services.ts in their repo.

function CennikTab({
  serviceCategories,
}: {
  serviceCategories: ServiceCategory[]
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-medium text-foreground">
          Cennik i Usługi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dane z{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            lib/services.ts
          </code>
          . Kliknij cenę, aby ją edytować w bieżącej sesji. Aby zapisać zmiany
          trwale, zaktualizuj plik w repozytorium.
        </p>
      </div>

      {serviceCategories.map((category) => (
        <div key={category.key}>
          <h3 className="mb-3 font-serif text-lg font-medium text-foreground">
            {category.label}
          </h3>
          {category.description && (
            <p className="mb-3 text-sm text-muted-foreground">
              {category.description}
            </p>
          )}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Usługa
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Cena
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {category.services.map((service) =>
                  service.variants ? (
                    service.variants.map((variant) => {
                      const cellKey = `${service.key}__${variant.key}`
                      const isEditing = editingKey === cellKey
                      return (
                        <tr
                          key={cellKey}
                          className="group transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-3 text-foreground">
                            {service.label}
                            <span className="ml-2 text-xs text-muted-foreground">
                              — {variant.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-7 w-24 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (
                                      !e.nativeEvent.isComposing &&
                                      e.key === "Enter"
                                    ) {
                                      variant.price =
                                        Number(editValue) || variant.price
                                      setEditingKey(null)
                                    }
                                    if (e.key === "Escape")
                                      setEditingKey(null)
                                  }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  zł
                                </span>
                                <button
                                  onClick={() => {
                                    variant.price =
                                      Number(editValue) || variant.price
                                    setEditingKey(null)
                                  }}
                                  aria-label="Zapisz"
                                  className="text-primary hover:text-primary/70"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingKey(null)}
                                  aria-label="Anuluj"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {variant.price} zł
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingKey(cellKey)
                                    setEditValue(String(variant.price))
                                  }}
                                  aria-label="Edytuj cenę"
                                  className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr
                      key={service.key}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-3 text-foreground">
                        {service.label}
                      </td>
                      <td className="px-5 py-3">
                        {editingKey === service.key ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 w-24 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (
                                  !e.nativeEvent.isComposing &&
                                  e.key === "Enter"
                                ) {
                                  service.price =
                                    Number(editValue) || service.price
                                  setEditingKey(null)
                                }
                                if (e.key === "Escape") setEditingKey(null)
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              zł
                            </span>
                            <button
                              onClick={() => {
                                service.price =
                                  Number(editValue) || service.price
                                setEditingKey(null)
                              }}
                              aria-label="Zapisz"
                              className="text-primary hover:text-primary/70"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              aria-label="Anuluj"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {service.price} zł
                            </span>
                            <button
                              onClick={() => {
                                setEditingKey(service.key)
                                setEditValue(String(service.price ?? 0))
                              }}
                              aria-label="Edytuj cenę"
                              className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab({
  initialImages,
}: {
  initialImages: PortfolioImageRow[]
}) {
  const [images, setImages] = useState(initialImages)
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [newSrc, setNewSrc] = useState("")
  const [newAlt, setNewAlt] = useState("")
  const [newCategory, setNewCategory] = useState<"rzesy" | "makijaz">("rzesy")
  const [newWide, setNewWide] = useState(false)
  const [newTall, setNewTall] = useState(false)
  const [addError, setAddError] = useState("")

  function handleDelete(id: number) {
    setConfirmDelete(null)
    setImages((prev) => prev.filter((img) => img.id !== id))
    startTransition(async () => {
      await deletePortfolioImage(id)
    })
  }

  async function handleAdd() {
    setAddError("")
    if (!newSrc.trim() || !newAlt.trim()) {
      setAddError("Uzupełnij ścieżkę i opis zdjęcia.")
      return
    }
    const result = await addPortfolioImage(
      newSrc.trim(),
      newAlt.trim(),
      newCategory,
      newWide,
      newTall,
    )
    if (!result.ok) {
      setAddError(result.message)
      return
    }
    const optimistic: PortfolioImageRow = {
      id: Date.now(),
      src: newSrc.trim(),
      alt: newAlt.trim(),
      category: newCategory,
      wide: newWide,
      tall: newTall,
      sort_order: 9999,
      created_at: new Date(),
    }
    setImages((prev) => [...prev, optimistic])
    setAddOpen(false)
    setNewSrc("")
    setNewAlt("")
    setNewCategory("rzesy")
    setNewWide(false)
    setNewTall(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Portfolio
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {images.length}{" "}
            {images.length === 1 ? "zdjęcie" : "zdjęć"} w galerii. Dane
            przechowywane w tabeli{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              portfolio_images
            </code>{" "}
            w PostgreSQL.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Dodaj zdjęcie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                Dodaj zdjęcie do portfolio
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-src">Ścieżka do pliku</Label>
                <Input
                  id="new-src"
                  placeholder="/portfolio/nazwa-pliku.jpg"
                  value={newSrc}
                  onChange={(e) => setNewSrc(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Wgraj plik do{" "}
                  <code className="rounded bg-muted px-1">
                    public/portfolio/
                  </code>{" "}
                  i wpisz ścieżkę.
                </p>
              </div>

              {newSrc && (
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={newSrc}
                    alt="Podgląd"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-alt">Opis (tekst alternatywny)</Label>
                <Input
                  id="new-alt"
                  placeholder="np. Stylizacja rzęs: Wet Look"
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Kategoria</Label>
                <div className="flex gap-2">
                  {(["rzesy", "makijaz"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-xs tracking-widest uppercase transition-all",
                        newCategory === cat
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {cat === "rzesy" ? "Rzęsy" : "Makijaż"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newWide}
                    onChange={(e) => setNewWide(e.target.checked)}
                    className="rounded border-border"
                  />
                  Szerokie (4:3)
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newTall}
                    onChange={(e) => setNewTall(e.target.checked)}
                    className="rounded border-border"
                  />
                  Wysokie (3:4)
                </label>
              </div>

              {addError && (
                <p className="text-sm text-destructive">{addError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Anuluj
                </Button>
                <Button onClick={handleAdd} disabled={isPending}>
                  Dodaj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Brak zdjęć w portfolio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
            >
              <div
                className={cn(
                  "relative w-full",
                  img.tall
                    ? "aspect-[3/4]"
                    : img.wide
                      ? "aspect-[4/3]"
                      : "aspect-square",
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Caption overlay */}
              <div className="absolute inset-0 flex flex-col items-start justify-end bg-foreground/0 p-2 opacity-0 transition-all duration-300 group-hover:bg-foreground/50 group-hover:opacity-100">
                <p className="line-clamp-2 text-xs text-white">{img.alt}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {img.category === "rzesy" ? "Rzęsy" : "Makijaż"}
                </Badge>
              </div>

              {/* Delete button */}
              {confirmDelete === img.id ? (
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="rounded-md bg-destructive px-2 py-1 text-xs text-white shadow"
                  >
                    Usuń
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="rounded-md bg-card px-2 py-1 text-xs text-foreground shadow"
                  >
                    Nie
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(img.id)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label="Usuń zdjęcie"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Opinie Tab ───────────────────────────────────────────────────────────────

function OpinieTab({
  initialReviews,
}: {
  initialReviews: AdminReviewRow[]
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    content: "",
    rating: 5,
  })
  const [formError, setFormError] = useState("")

  function handleToggle(id: number, currentlyApproved: boolean) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, approved: !currentlyApproved } : r,
      ),
    )
    startTransition(async () => {
      await toggleReviewApproval(id, !currentlyApproved)
    })
  }

  function handleDelete(id: number) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    startTransition(async () => {
      await deleteReview(id)
    })
  }

  async function handleAdd() {
    setFormError("")
    const result = await adminAddReview(
      form.firstName,
      form.lastName,
      form.email,
      form.content,
      form.rating,
    )
    if (!result.ok) {
      setFormError(result.message)
      return
    }
    const optimistic: AdminReviewRow = {
      id: Date.now(),
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      content: form.content,
      rating: form.rating,
      approved: true,
      created_at: new Date(),
    }
    setReviews((prev) => [optimistic, ...prev])
    setForm({ firstName: "", lastName: "", email: "", content: "", rating: 5 })
    setAddOpen(false)
  }

  const approvedCount = reviews.filter((r) => r.approved).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Opinie
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {approvedCount} widocznych · {reviews.length - approvedCount}{" "}
            ukrytych · {reviews.length} łącznie. Tabela{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              reviews
            </code>{" "}
            w PostgreSQL.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Dodaj opinię
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                Dodaj opinię ręcznie
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="add-fn">Imię</Label>
                  <Input
                    id="add-fn"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-ln">Nazwisko</Label>
                  <Input
                    id="add-ln"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-em">E-mail</Label>
                <Input
                  id="add-em"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-co">Treść opinii</Label>
                <Textarea
                  id="add-co"
                  rows={4}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ocena</Label>
                <StarDisplay
                  rating={form.rating}
                  onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
                />
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Anuluj
                </Button>
                <Button onClick={handleAdd} disabled={isPending}>
                  Dodaj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Brak opinii w bazie danych.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "rounded-xl border bg-card p-4 shadow-sm transition-all",
                review.approved
                  ? "border-border"
                  : "border-border/50 opacity-60",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {review.first_name} {review.last_name.charAt(0)}.
                    </span>
                    <StarDisplay rating={review.rating} />
                    <Badge
                      variant={review.approved ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {review.approved ? "Widoczna" : "Ukryta"}
                    </Badge>
                    <time className="ml-auto text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("pl-PL")}
                    </time>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.content}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {review.email}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => handleToggle(review.id, review.approved)}
                    disabled={isPending}
                    className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    aria-label={
                      review.approved ? "Ukryj opinię" : "Pokaż opinię"
                    }
                  >
                    {review.approved ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    aria-label="Usuń opinię"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Przegląd",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "cennik",
    label: "Cennik i Usługi",
    icon: <ListOrdered className="h-4 w-4" />,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    id: "opinie",
    label: "Opinie",
    icon: <MessageSquare className="h-4 w-4" />,
  },
]

// ─── Root component ───────────────────────────────────────────────────────────

export function ContentDashboard({
  initialReviews,
  initialPortfolioImages,
  initialServiceCategories,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/klienci">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Rezerwacje</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="font-serif text-lg font-medium text-foreground">
              Panel zarządzania
            </h1>
            <p className="text-xs text-muted-foreground">
              Nicole Bosiacka · Lash &amp; Beauty
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Tab navigation */}
        <nav
          className="mb-8 flex gap-1 overflow-x-auto border-b border-border"
          aria-label="Sekcje panelu"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        {tab === "overview" && (
          <OverviewTab
            reviews={initialReviews}
            portfolioImages={initialPortfolioImages}
            serviceCategories={initialServiceCategories}
            onChangeTab={setTab}
          />
        )}
        {tab === "cennik" && (
          <CennikTab serviceCategories={initialServiceCategories} />
        )}
        {tab === "portfolio" && (
          <PortfolioTab initialImages={initialPortfolioImages} />
        )}
        {tab === "opinie" && (
          <OpinieTab initialReviews={initialReviews} />
        )}
      </div>
    </div>
  )
}
