"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Check, Loader2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookingCalendar } from "@/components/booking-calendar"
import {
  addonCategoryKey,
  makeupInfoMessage,
  formatPrice,
  getServicePrice,
  getServiceLabel,
  type ServiceVariantKey,
  type ServiceCategory,
} from "@/lib/services"
import { createBooking } from "@/app/actions/booking"

type Step = 0 | 1 | 2 | 3

const STEPS = ["Usługa", "Termin", "Dane", "Podsumowanie"]

interface Selection {
  serviceKey: string | null
  variant: ServiceVariantKey | null
  addons: string[]
}

interface BookingFormProps {
  serviceCategories: ServiceCategory[]
}

const MONTHS_LONG = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
]

function formatDatePretty(key: string): string {
  const [y, m, d] = key.split("-").map(Number)
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`
}

export function BookingForm({ serviceCategories }: BookingFormProps) {
  const [step, setStep] = useState<Step>(0)
  const [selection, setSelection] = useState<Selection>({
    serviceKey: null,
    variant: null,
    addons: [],
  })
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)

  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [dayBlocked, setDayBlocked] = useState(false)
  const [todayKey, setTodayKey] = useState<string>("")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Pobierz dzisiejszą datę z serwera (strefa Warszawa) przy montażu
  useEffect(() => {
    fetch("/api/availability?date=2000-01-01")
      .then((r) => r.json())
      .then((d) => {
        if (d.serverDate) setTodayKey(d.serverDate)
      })
      .catch(() => {
        setTodayKey(new Date().toISOString().slice(0, 10))
      })
  }, [])

  // Pobierz dostępne sloty po wyborze daty
  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    setTime(null)
    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || [])
        setDayBlocked(Boolean(d.dayBlocked))
      })
      .catch(() => {
        setSlots([])
        toast.error("Nie udało się pobrać dostępnych godzin.")
      })
      .finally(() => setLoadingSlots(false))
  }, [date])

  /** Look up a price from the live serviceCategories prop */
  const getPriceFromProp = useMemo(() => {
    return (serviceKey: string, variantKey?: string | null): number => {
      for (const cat of serviceCategories) {
        const svc = cat.services.find((s) => s.key === serviceKey)
        if (!svc) continue
        if (svc.variants && variantKey) {
          return svc.variants.find((v) => v.key === variantKey)?.price ?? 0
        }
        return svc.price ?? 0
      }
      return getServicePrice(serviceKey, variantKey)
    }
  }, [serviceCategories])

  const selectedServiceLabel = useMemo(() => {
    if (!selection.serviceKey) return null
    return getServiceLabel(selection.serviceKey, selection.variant)
  }, [selection])

  const totalPrice = useMemo(() => {
    let total = 0
    if (selection.serviceKey)
      total += getPriceFromProp(selection.serviceKey, selection.variant)
    for (const addon of selection.addons) total += getPriceFromProp(addon)
    return total
  }, [selection, getPriceFromProp])

  const isMakeup = useMemo(() => {
    if (!selection.serviceKey) return false
    const cat = serviceCategories.find((c) =>
      c.services.some((s) => s.key === selection.serviceKey),
    )
    return cat?.key === "makijaz"
  }, [selection.serviceKey, serviceCategories])

  function selectService(serviceKey: string, hasVariants: boolean) {
    setSelection((prev) => ({
      ...prev,
      serviceKey,
      variant: hasVariants ? prev.variant ?? "nowe" : null,
    }))
  }

  function toggleAddon(key: string) {
    setSelection((prev) => ({
      ...prev,
      addons: prev.addons.includes(key)
        ? prev.addons.filter((a) => a !== key)
        : [...prev.addons, key],
    }))
  }

  function validateDetails(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = "Imię jest wymagane."
    if (!form.lastName.trim()) errs.lastName = "Nazwisko jest wymagane."
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) {
      errs.email = "Adres e-mail jest wymagany."
    } else if (!emailRe.test(form.email.trim())) {
      errs.email = "Podaj poprawny adres e-mail."
    }
    // Accepts Polish mobile/landline: optional +48 or 0, then 9 digits (with spaces/dashes)
    const phoneRe = /^(\+48|0)?[\s-]?(\d[\s-]?){9}$/
    if (!form.phone.trim()) {
      errs.phone = "Numer telefonu jest wymagany."
    } else if (!phoneRe.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Podaj poprawny numer telefonu (np. 600 123 456)."
    }
    return errs
  }

  function canProceed(): boolean {
    if (step === 0) return Boolean(selection.serviceKey)
    if (step === 1) return Boolean(date && time)
    if (step === 2) {
      const errs = validateDetails()
      return Object.keys(errs).length === 0
    }
    return true
  }

  async function handleSubmit() {
    if (!selection.serviceKey || !date || !time) return
    setSubmitting(true)
    setErrors({})
    const result = await createBooking({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      serviceKey: selection.serviceKey,
      variant: selection.variant,
      addons: selection.addons,
      date,
      time,
    })
    setSubmitting(false)

    if (result.ok) {
      setDone(true)
      toast.success(result.message)
    } else {
      if (result.fieldErrors) setErrors(result.fieldErrors)
      toast.error(result.message)
      // Jeśli slot zajęty — wróć do wyboru terminu i odśwież
      if (result.message.includes("termin") || result.message.includes("godzin")) {
        setStep(1)
        setTime(null)
        if (date) {
          setLoadingSlots(true)
          fetch(`/api/availability?date=${date}`)
            .then((r) => r.json())
            .then((d) => setSlots(d.slots || []))
            .finally(() => setLoadingSlots(false))
        }
      }
    }
  }

  if (done) {
    return <BookingSuccess firstName={form.firstName} />
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
      <Stepper step={step} />

      <div className="mt-8">
        {step === 0 && (
          <ServiceStep
            selection={selection}
            serviceCategories={serviceCategories}
            onSelectService={selectService}
            onSelectVariant={(v) =>
              setSelection((prev) => ({ ...prev, variant: v }))
            }
            onToggleAddon={toggleAddon}
          />
        )}

        {step === 1 && (
          <div className="grid gap-6 md:grid-cols-2">
            <BookingCalendar
              selectedDate={date}
              onSelect={setDate}
              todayKey={todayKey || "2026-01-01"}
            />
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="font-serif text-lg font-medium text-foreground">
                Dostępne godziny
              </h3>
              {!date && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Najpierw wybierz dzień z kalendarza.
                </p>
              )}
              {date && loadingSlots && (
                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ładowanie terminów…
                </div>
              )}
              {date && !loadingSlots && dayBlocked && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ten dzień jest niedostępny. Wybierz inny termin.
                </p>
              )}
              {date && !loadingSlots && !dayBlocked && slots.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Brak wolnych godzin tego dnia. Wybierz inny termin.
                </p>
              )}
              {date && !loadingSlots && slots.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-md border py-2 text-sm transition-all",
                        time === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <DetailsStep form={form} setForm={setForm} errors={errors} isMakeup={isMakeup} />
        )}

        {step === 3 && (
          <SummaryStep
            serviceLabel={selectedServiceLabel}
            addons={selection.addons}
            date={date}
            time={time}
            form={form}
            totalPrice={totalPrice}
            formatDatePretty={formatDatePretty}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          disabled={step === 0 || submitting}
        >
          Wstecz
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => {
              if (step === 2) {
                const errs = validateDetails()
                if (Object.keys(errs).length > 0) {
                  setErrors(errs)
                  return
                }
                setErrors({})
              }
              setStep((s) => (s + 1) as Step)
            }}
            disabled={step !== 2 && !canProceed()}
          >
            Dalej
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Zarezerwuj wizytę
          </Button>
        )}
      </div>
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, idx) => {
        const active = idx === step
        const complete = idx < step
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors",
                  complete && "border-primary bg-primary text-primary-foreground",
                  active &&
                    "border-primary bg-background font-medium text-primary",
                  !active &&
                    !complete &&
                    "border-border bg-background text-muted-foreground",
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : idx + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-12",
                  complete ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function ServiceStep({
  selection,
  onSelectService,
  onSelectVariant,
  onToggleAddon,
  serviceCategories,
}: {
  selection: Selection
  onSelectService: (key: string, hasVariants: boolean) => void
  onSelectVariant: (v: ServiceVariantKey) => void
  onToggleAddon: (key: string) => void
  serviceCategories: ServiceCategory[]
}) {
  return (
    <div className="space-y-8">
      {serviceCategories
        .filter((c) => c.key !== addonCategoryKey)
        .map((category) => (
          <div key={category.key}>
            <h3 className="font-serif text-xl font-medium text-foreground">
              {category.label}
            </h3>
            {category.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {category.services.map((service) => {
                const selected = selection.serviceKey === service.key
                const hasVariants = Boolean(service.variants)
                return (
                  <div key={service.key}>
                    <button
                      type="button"
                      onClick={() => onSelectService(service.key, hasVariants)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                        selected
                          ? "border-primary bg-secondary"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <span className="font-medium text-foreground">
                        {service.label}
                      </span>
                      <span className="ml-3 shrink-0 text-sm text-muted-foreground">
                        {hasVariants && service.variants
                          ? (() => {
                              const prices = service.variants.map((v) => v.price)
                              const min = Math.min(...prices)
                              const max = Math.max(...prices)
                              return min === max
                                ? formatPrice(min)
                                : `od ${formatPrice(min)}`
                            })()
                          : formatPrice(service.price ?? 0)}
                      </span>
                      {selected && (
                        <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>

                    {selected && hasVariants && service.variants && (
                      <div className="mt-2 flex gap-2 pl-1">
                        {service.variants.map((variant) => (
                          <button
                            key={variant.key}
                            type="button"
                            onClick={() => onSelectVariant(variant.key)}
                            className={cn(
                              "flex-1 rounded-md border px-3 py-2 text-sm transition-all",
                              selection.variant === variant.key
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-secondary",
                            )}
                          >
                            {variant.label}
                            {variant.price > 0 && (
                              <span className="ml-1 opacity-80">
                                · {formatPrice(variant.price)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      {/* Dodatki */}
      {(() => {
        const addonCat = serviceCategories.find(
          (c) => c.key === addonCategoryKey,
        )
        if (!addonCat) return null
        return (
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              {addonCat.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Opcjonalnie — możesz wybrać kilka.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {addonCat.services.map((service) => {
                const checked = selection.addons.includes(service.key)
                return (
                  <button
                    key={service.key}
                    type="button"
                    onClick={() => onToggleAddon(service.key)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                      checked
                        ? "border-primary bg-secondary"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="text-foreground">{service.label}</span>
                    <span className="ml-3 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(service.price ?? 0)}
                      </span>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border",
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function DetailsStep({
  form,
  setForm,
  errors,
  isMakeup,
}: {
  form: { firstName: string; lastName: string; email: string; phone: string }
  setForm: (
    f: (prev: typeof form) => typeof form,
  ) => void
  errors: Record<string, string>
  isMakeup: boolean
}) {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      {isMakeup && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground">
            {makeupInfoMessage}
          </p>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label="Imię"
          value={form.firstName}
          error={errors.firstName}
          onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
        />
        <Field
          id="lastName"
          label="Nazwisko"
          value={form.lastName}
          error={errors.lastName}
          onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
        />
      </div>
      <Field
        id="email"
        label="Adres e-mail"
        type="email"
        value={form.email}
        error={errors.email}
        onChange={(v) => setForm((p) => ({ ...p, email: v }))}
      />
      <Field
        id="phone"
        label="Numer telefonu"
        type="tel"
        value={form.phone}
        error={errors.phone}
        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
      />
    </div>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function SummaryStep({
  serviceLabel,
  addons,
  date,
  time,
  form,
  totalPrice,
  formatDatePretty,
}: {
  serviceLabel: string | null
  addons: string[]
  date: string | null
  time: string | null
  form: { firstName: string; lastName: string; email: string; phone: string }
  totalPrice: number
  formatDatePretty: (key: string) => string
}) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-xl font-medium text-foreground">
          Podsumowanie rezerwacji
        </h3>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Usługa" value={serviceLabel ?? "—"} />
          {addons.length > 0 && (
            <Row
              label="Dodatki"
              value={addons.map((a) => getServiceLabel(a)).join(", ")}
            />
          )}
          <Row label="Data" value={date ? formatDatePretty(date) : "—"} />
          <Row label="Godzina" value={time ?? "—"} />
          <Row
            label="Klient"
            value={`${form.firstName} ${form.lastName}`}
          />
          <Row label="E-mail" value={form.email} />
          <Row label="Telefon" value={form.phone} />
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-serif text-lg text-foreground">Razem</span>
          <span className="font-serif text-lg font-medium text-foreground">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Po kliknięciu „Zarezerwuj wizytę” otrzymasz potwierdzenie na podany
        adres e-mail.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}

function BookingSuccess({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 pb-20 pt-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mt-6 font-serif text-2xl font-medium text-foreground">
        Dziękuję, {firstName || "do zobaczenia"}!
      </h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Twoja rezerwacja została przyjęta. Potwierdzenie wysłałam na podany adres
        e-mail. W razie pytań skontaktuję się z Tobą telefonicznie.
      </p>
      <Button className="mt-8" onClick={() => window.location.reload()}>
        Zarezerwuj kolejną wizytę
      </Button>
    </div>
  )
}
