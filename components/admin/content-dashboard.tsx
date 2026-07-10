"use client"

import { useState, useRef } from "react"
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
  Upload,
  LogOut,
  ArrowLeft,
  Images,
  DollarSign,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { logoutAction } from "@/app/actions/admin"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceEntry {
  id: string
  category: string
  name: string
  variant?: string
  price: number
}

interface PortfolioImage {
  id: string
  src: string
  alt: string
  category: "rzesy" | "makijaz"
  isNew?: boolean
}

interface Review {
  id: string
  firstName: string
  lastName: string
  rating: number
  content: string
  date: string
  hidden: boolean
  isManual?: boolean
}

// ─── Initial mock data ────────────────────────────────────────────────────────

const INITIAL_SERVICES: PriceEntry[] = [
  { id: "1", category: "Stylizacja Rzęs", name: "1:1", variant: "Nowe", price: 90 },
  { id: "2", category: "Stylizacja Rzęs", name: "1:1", variant: "Uzupełnienie", price: 50 },
  { id: "3", category: "Stylizacja Rzęs", name: "2-3D", variant: "Nowe", price: 100 },
  { id: "4", category: "Stylizacja Rzęs", name: "2-3D", variant: "Uzupełnienie", price: 60 },
  { id: "5", category: "Stylizacja Rzęs", name: "Wet Look", variant: "Nowe", price: 150 },
  { id: "6", category: "Stylizacja Rzęs", name: "Wet Look", variant: "Uzupełnienie", price: 110 },
  { id: "7", category: "Stylizacja Rzęs", name: "Wispy Set", variant: "Nowe", price: 160 },
  { id: "8", category: "Stylizacja Rzęs", name: "Wispy Set", variant: "Uzupełnienie", price: 140 },
  { id: "9", category: "Dodatki do Rzęs", name: "Kolorowe rzęsy jako dodatek", price: 40 },
  { id: "10", category: "Dodatki do Rzęs", name: "Ściągnięcie stylizacji", price: 50 },
  { id: "11", category: "Makijaż", name: "Makijaż ślubny próbny", price: 150 },
  { id: "12", category: "Makijaż", name: "Makijaż ślubny", price: 180 },
  { id: "13", category: "Makijaż", name: "Makijaż okolicznościowy", price: 180 },
]

const INITIAL_PORTFOLIO: PortfolioImage[] = [
  { id: "p1", src: "/portfolio/rzesy-wet-look-01.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy" },
  { id: "p2", src: "/portfolio/makijaz-slubny-01.jpg", alt: "Makijaż ślubny", category: "makijaz" },
  { id: "p3", src: "/portfolio/rzesy-wet-look-02.jpg", alt: "Stylizacja rzęs: Wet Look", category: "rzesy" },
  { id: "p4", src: "/portfolio/makijaz-okolicznosciowy-01.jpg", alt: "Makijaż okolicznościowy", category: "makijaz" },
  { id: "p5", src: "/portfolio/rzesy-5d-01.jpg", alt: "Stylizacja rzęs: 5D", category: "rzesy" },
  { id: "p6", src: "/portfolio/rzesy-wispy-set-01.jpg", alt: "Stylizacja rzęs: Wispy Set", category: "rzesy" },
  { id: "p7", src: "/portfolio/rzesy-brazowe-01.jpg", alt: "Stylizacja rzęs: Brązowe", category: "rzesy" },
  { id: "p8", src: "/portfolio/makijaz-slubny-02.jpg", alt: "Makijaż ślubny", category: "makijaz" },
]

const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    firstName: "Aleksandra",
    lastName: "K.",
    rating: 5,
    content: "Absolutnie zachwycona efektami! Rzęsy wyglądają naturalnie i przepięknie. Na pewno wrócę!",
    date: "2024-12-10",
    hidden: false,
  },
  {
    id: "r2",
    firstName: "Monika",
    lastName: "W.",
    rating: 5,
    content: "Profesjonalizm na najwyższym poziomie. Nicole jest bardzo dokładna i dbająca o każdy detal.",
    date: "2024-12-05",
    hidden: false,
  },
  {
    id: "r3",
    firstName: "Karolina",
    lastName: "P.",
    rating: 4,
    content: "Piękny makijaż ślubny, który utrzymał się przez cały dzień. Polecam z całego serca!",
    date: "2024-11-28",
    hidden: false,
  },
  {
    id: "r4",
    firstName: "Natalia",
    lastName: "B.",
    rating: 5,
    content: "Wet Look wygląda niesamowicie, dokładnie taki efekt o jakim marzyłam.",
    date: "2024-11-20",
    hidden: true,
  },
]

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = "overview" | "cennik" | "portfolio" | "opinie"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Przegląd", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "cennik", label: "Cennik i Usługi", icon: <ListOrdered className="h-4 w-4" /> },
  { id: "portfolio", label: "Portfolio", icon: <Images className="h-4 w-4" /> },
  { id: "opinie", label: "Opinie", icon: <Star className="h-4 w-4" /> },
]

// ─── Root component ───────────────────────────────────────────────────────────

export function ContentDashboard() {
  const [tab, setTab] = useState<Tab>("overview")
  const [services, setServices] = useState<PriceEntry[]>(INITIAL_SERVICES)
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>(INITIAL_PORTFOLIO)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)

  const visibleReviews = reviews.filter((r) => !r.hidden).length
  const totalImages = portfolio.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/klienci"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Rezerwacje
            </Link>
            <span className="text-border">|</span>
            <div>
              <h1 className="font-serif text-lg font-medium text-foreground">Panel zarządzania</h1>
              <p className="text-xs text-muted-foreground">Nicole Bosiacka · Lash &amp; Beauty</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Tabs — desktop horizontal, mobile scrollable */}
        <nav
          className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-0"
          aria-label="Sekcje panelu"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 -mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
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
            services={services}
            portfolio={portfolio}
            reviews={reviews}
            visibleReviews={visibleReviews}
            onChangeTab={setTab}
          />
        )}
        {tab === "cennik" && (
          <CennikTab services={services} setServices={setServices} />
        )}
        {tab === "portfolio" && (
          <PortfolioTab portfolio={portfolio} setPortfolio={setPortfolio} />
        )}
        {tab === "opinie" && (
          <OpinieTab reviews={reviews} setReviews={setReviews} />
        )}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  services,
  portfolio,
  reviews,
  visibleReviews,
  onChangeTab,
}: {
  services: PriceEntry[]
  portfolio: PortfolioImage[]
  reviews: Review[]
  visibleReviews: number
  onChangeTab: (t: Tab) => void
}) {
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—"

  const stats = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Usługi w cenniku",
      value: services.length,
      action: () => onChangeTab("cennik"),
      actionLabel: "Zarządzaj cennikiem",
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      label: "Zdjęcia w portfolio",
      value: portfolio.length,
      action: () => onChangeTab("portfolio"),
      actionLabel: "Zarządzaj portfolio",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Opinie (widoczne)",
      value: `${visibleReviews} / ${reviews.length}`,
      action: () => onChangeTab("opinie"),
      actionLabel: "Zarządzaj opiniami",
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "Średnia ocena",
      value: avgRating,
      action: () => onChangeTab("opinie"),
      actionLabel: "Zobacz opinie",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-medium text-foreground">Przegląd</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Szybki podgląd stanu contentu Twojego salonu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <button
            key={i}
            type="button"
            onClick={stat.action}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary">
                {stat.actionLabel} →
              </span>
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick summary cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* Services summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <ListOrdered className="h-4 w-4 text-primary" />
            Kategorie cennika
          </h3>
          {Array.from(new Set(services.map((s) => s.category))).map((cat) => (
            <div key={cat} className="flex items-center justify-between border-t border-border py-2 first:border-t-0">
              <span className="text-sm text-muted-foreground">{cat}</span>
              <Badge variant="outline" className="text-xs">
                {services.filter((s) => s.category === cat).length} poz.
              </Badge>
            </div>
          ))}
        </div>

        {/* Portfolio summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Images className="h-4 w-4 text-primary" />
            Kategorie portfolio
          </h3>
          {(["rzesy", "makijaz"] as const).map((cat) => (
            <div key={cat} className="flex items-center justify-between border-t border-border py-2 first:border-t-0">
              <span className="text-sm text-muted-foreground">
                {cat === "rzesy" ? "Stylizacja rzęs" : "Makijaż"}
              </span>
              <Badge variant="outline" className="text-xs">
                {portfolio.filter((p) => p.category === cat).length} zdjęć
              </Badge>
            </div>
          ))}
        </div>

        {/* Reviews summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Star className="h-4 w-4 text-primary" />
            Status opinii
          </h3>
          <div className="flex items-center justify-between border-t border-border py-2 first:border-t-0">
            <span className="text-sm text-muted-foreground">Widoczne</span>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              {visibleReviews}
            </Badge>
          </div>
          <div className="flex items-center justify-between border-t border-border py-2">
            <span className="text-sm text-muted-foreground">Ukryte</span>
            <Badge variant="outline" className="text-xs">
              {reviews.length - visibleReviews}
            </Badge>
          </div>
          <div className="flex items-center justify-between border-t border-border py-2">
            <span className="text-sm text-muted-foreground">Dodane ręcznie</span>
            <Badge variant="outline" className="text-xs">
              {reviews.filter((r) => r.isManual).length}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Cennik Tab ───────────────────────────────────────────────────────────────

function CennikTab({
  services,
  setServices,
}: {
  services: PriceEntry[]
  setServices: React.Dispatch<React.SetStateAction<PriceEntry[]>>
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [toDelete, setToDelete] = useState<PriceEntry | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({
    category: "",
    name: "",
    variant: "",
    price: "",
  })

  const grouped = services.reduce<Record<string, PriceEntry[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  function startEdit(s: PriceEntry) {
    setEditingId(s.id)
    setEditPrice(String(s.price))
  }

  function saveEdit(id: string) {
    const price = parseInt(editPrice, 10)
    if (isNaN(price) || price < 0) return
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, price } : s)))
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditPrice("")
  }

  function deleteService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id))
    setToDelete(null)
  }

  function addService() {
    const price = parseInt(newEntry.price, 10)
    if (!newEntry.category || !newEntry.name || isNaN(price)) return
    const id = `svc-${Date.now()}`
    setServices((prev) => [
      ...prev,
      {
        id,
        category: newEntry.category,
        name: newEntry.name,
        variant: newEntry.variant || undefined,
        price,
      },
    ])
    setNewEntry({ category: "", name: "", variant: "", price: "" })
    setShowAdd(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">Cennik i Usługi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edytuj ceny, dodaj nowe usługi lub usuń te, których już nie oferujesz.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Dodaj usługę
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-5 py-3">
              <h3 className="text-sm font-medium text-foreground">{category}</h3>
            </div>
            <div className="divide-y divide-border">
              {entries.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-foreground">
                      {s.name}
                      {s.variant && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          — {s.variant}
                        </span>
                      )}
                    </span>
                  </div>

                  {editingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 pr-7 text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(s.id)
                            if (e.key === "Escape") cancelEdit()
                          }}
                        />
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          zł
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-primary"
                        onClick={() => saveEdit(s.id)}
                        aria-label="Zapisz"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={cancelEdit}
                        aria-label="Anuluj"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="min-w-[4rem] text-right text-sm font-medium text-foreground">
                        {s.price} zł
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(s)}
                        aria-label={`Edytuj cenę: ${s.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setToDelete(s)}
                        aria-label={`Usuń usługę: ${s.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add service dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Dodaj usługę</DialogTitle>
            <DialogDescription>
              Uzupełnij dane nowej pozycji cennika.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat">Kategoria</Label>
              <Input
                id="cat"
                placeholder="np. Stylizacja Rzęs"
                value={newEntry.category}
                onChange={(e) => setNewEntry((p) => ({ ...p, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sname">Nazwa usługi</Label>
              <Input
                id="sname"
                placeholder="np. Mega Volume"
                value={newEntry.name}
                onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svariant">Wariant (opcjonalnie)</Label>
              <Input
                id="svariant"
                placeholder="np. Nowe / Uzupełnienie"
                value={newEntry.variant}
                onChange={(e) => setNewEntry((p) => ({ ...p, variant: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprice">Cena (zł)</Label>
              <Input
                id="sprice"
                type="number"
                min={0}
                placeholder="0"
                value={newEntry.price}
                onChange={(e) => setNewEntry((p) => ({ ...p, price: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              Anuluj
            </Button>
            <Button
              onClick={addService}
              disabled={!newEntry.category || !newEntry.name || !newEntry.price}
            >
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Usunąć usługę?</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  <strong>{toDelete.name}</strong>
                  {toDelete.variant ? ` – ${toDelete.variant}` : ""} zostanie trwale usunięta
                  z cennika.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => toDelete && deleteService(toDelete.id)}
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab({
  portfolio,
  setPortfolio,
}: {
  portfolio: PortfolioImage[]
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioImage[]>>
}) {
  const [toDelete, setToDelete] = useState<PortfolioImage | null>(null)
  const [filterCat, setFilterCat] = useState<"wszystkie" | "rzesy" | "makijaz">("wszystkie")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewAlt, setPreviewAlt] = useState("")
  const [previewCat, setPreviewCat] = useState<"rzesy" | "makijaz">("rzesy")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered =
    filterCat === "wszystkie"
      ? portfolio
      : portfolio.filter((p) => p.category === filterCat)

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setPreviewAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function confirmUpload() {
    if (!previewUrl) return
    const id = `new-${Date.now()}`
    setPortfolio((prev) => [
      { id, src: previewUrl, alt: previewAlt || "Nowe zdjęcie", category: previewCat, isNew: true },
      ...prev,
    ])
    setPreviewUrl(null)
    setPreviewAlt("")
    setPreviewCat("rzesy")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function cancelUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewAlt("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function deleteImage(id: string) {
    setPortfolio((prev) => prev.filter((p) => p.id !== id))
    setToDelete(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium text-foreground">Portfolio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Zarządzaj galerią zdjęć. Dodawaj nowe lub usuwaj nieaktualne.
        </p>
      </div>

      {/* Upload zone */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-medium text-foreground">Dodaj nowe zdjęcie</h3>

        {previewUrl ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image src={previewUrl} alt="Podgląd" fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="alt-text">Opis zdjęcia (alt)</Label>
                <Input
                  id="alt-text"
                  value={previewAlt}
                  onChange={(e) => setPreviewAlt(e.target.value)}
                  placeholder="np. Stylizacja rzęs Wet Look"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategoria</Label>
                <div className="flex gap-2">
                  {(["rzesy", "makijaz"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPreviewCat(cat)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        previewCat === cat
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {cat === "rzesy" ? "Stylizacja rzęs" : "Makijaż"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={confirmUpload}>
                  <Check className="mr-2 h-4 w-4" />
                  Dodaj do portfolio
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelUpload}>
                  Anuluj
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-secondary/20",
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Przeciągnij i upuść zdjęcie lub kliknij aby wybrać"
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Przeciągnij zdjęcie lub kliknij
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleInputChange}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(["wszystkie", "rzesy", "makijaz"] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filterCat === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {cat === "wszystkie" ? "Wszystkie" : cat === "rzesy" ? "Rzęsy" : "Makijaż"}
            <span className="ml-1.5 text-xs opacity-60">
              ({cat === "wszystkie" ? portfolio.length : portfolio.filter((p) => p.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((img) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-muted"
          >
            <div className="aspect-square relative">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {img.isNew && (
              <Badge className="absolute left-2 top-2 text-[10px] bg-primary text-primary-foreground shadow-sm">
                Nowe
              </Badge>
            )}

            {/* Delete overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/0 transition-all duration-200 group-hover:bg-background/60">
              <Button
                size="icon"
                variant="destructive"
                className="h-9 w-9 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg"
                onClick={() => setToDelete(img)}
                aria-label={`Usuń: ${img.alt}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="truncate px-2 py-1.5 text-[10px] text-muted-foreground">
              {img.alt}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">Brak zdjęć w tej kategorii.</p>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Usunąć zdjęcie?</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  Zdjęcie <strong>&ldquo;{toDelete.alt}&rdquo;</strong> zostanie trwale usunięte
                  z portfolio.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => toDelete && deleteImage(toDelete.id)}
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Opinie Tab ───────────────────────────────────────────────────────────────

function StarRating({
  rating,
  interactive,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (n: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5" aria-label={`Ocena: ${rating} z 5 gwiazdek`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(
            "transition-colors",
            interactive ? "cursor-pointer" : "cursor-default",
          )}
          aria-label={interactive ? `Oceń na ${n} gwiazdek` : undefined}
        >
          <Star
            className={cn(
              "h-4 w-4",
              n <= (hovered || rating)
                ? "fill-primary stroke-primary"
                : "fill-transparent stroke-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  )
}

function OpinieTab({
  reviews,
  setReviews,
}: {
  reviews: Review[]
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>
}) {
  const [toDelete, setToDelete] = useState<Review | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newReview, setNewReview] = useState({
    firstName: "",
    lastName: "",
    rating: 5,
    content: "",
  })

  function toggleHide(id: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)),
    )
  }

  function deleteReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setToDelete(null)
  }

  function addReview() {
    if (!newReview.firstName || !newReview.content) return
    const id = `manual-${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    setReviews((prev) => [
      {
        id,
        firstName: newReview.firstName,
        lastName: newReview.lastName,
        rating: newReview.rating,
        content: newReview.content,
        date: today,
        hidden: false,
        isManual: true,
      },
      ...prev,
    ])
    setNewReview({ firstName: "", lastName: "", rating: 5, content: "" })
    setShowAdd(false)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">Opinie</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj opiniami klientek — ukrywaj, usuwaj lub dodawaj ręcznie.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Dodaj opinię
        </Button>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={cn(
              "rounded-xl border bg-card p-5 transition-all",
              review.hidden
                ? "border-border opacity-50"
                : "border-border",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">
                    {review.firstName} {review.lastName}
                  </span>
                  <StarRating rating={review.rating} />
                  {review.hidden && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Ukryta
                    </Badge>
                  )}
                  {review.isManual && (
                    <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/40">
                      Ręczna
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{review.content}&rdquo;
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(review.date)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleHide(review.id)}
                  aria-label={review.hidden ? "Pokaż opinię" : "Ukryj opinię"}
                  title={review.hidden ? "Pokaż" : "Ukryj"}
                >
                  {review.hidden ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setToDelete(review)}
                  aria-label={`Usuń opinię: ${review.firstName} ${review.lastName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">Brak opinii.</p>
          </div>
        )}
      </div>

      {/* Add review dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Dodaj opinię ręcznie</DialogTitle>
            <DialogDescription>
              Dodaj opinię klientki bezpośrednio z panelu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rfirst">Imię</Label>
                <Input
                  id="rfirst"
                  placeholder="Aleksandra"
                  value={newReview.firstName}
                  onChange={(e) => setNewReview((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rlast">Nazwisko</Label>
                <Input
                  id="rlast"
                  placeholder="K."
                  value={newReview.lastName}
                  onChange={(e) => setNewReview((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ocena</Label>
              <StarRating
                rating={newReview.rating}
                interactive
                onChange={(n) => setNewReview((p) => ({ ...p, rating: n }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rcontent">Treść opinii</Label>
              <Textarea
                id="rcontent"
                placeholder="Treść opinii klientki..."
                rows={4}
                value={newReview.content}
                onChange={(e) => setNewReview((p) => ({ ...p, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              Anuluj
            </Button>
            <Button
              onClick={addReview}
              disabled={!newReview.firstName || !newReview.content}
            >
              Dodaj opinię
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Usunąć opinię?</DialogTitle>
            <DialogDescription>
              {toDelete && (
                <>
                  Opinia od <strong>{toDelete.firstName} {toDelete.lastName}</strong> zostanie
                  trwale usunięta.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => toDelete && deleteReview(toDelete.id)}
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
