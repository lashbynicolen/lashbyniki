import nodemailer from "nodemailer"

/**
 * Konfiguracja SMTP przez zmienne środowiskowe:
 *  - SMTP_HOST
 *  - SMTP_PORT (np. 587)
 *  - SMTP_USER
 *  - SMTP_PASSWORD
 *  - SMTP_FROM (adres nadawcy, np. "Nicole Bosiacka <kontakt@nicolebosiacka.pl>")
 *  - OWNER_EMAIL (adres właścicielki, na który przychodzą powiadomienia)
 */

const OWNER_EMAIL = process.env.OWNER_EMAIL || "kontakt@nicolebosiacka.pl"
const SMTP_FROM =
  process.env.SMTP_FROM || "Nicole Bosiacka <kontakt@nicolebosiacka.pl>"

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export interface BookingEmailData {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceLabel: string
  addons: string[]
  date: string
  time: string
  totalPrice: number
}

const brandColor = "#2f4434"
const bgColor = "#f6f2e9"

function ownerHtml(data: BookingEmailData): string {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:${bgColor}; padding:32px;">
    <div style="max-width:560px; margin:0 auto; background:#fffdf8; border-radius:12px; padding:32px; border:1px solid #e6dfce;">
      <h1 style="color:${brandColor}; font-size:24px; margin:0 0 4px;">Nowa rezerwacja</h1>
      <p style="color:#6b7065; margin:0 0 24px; font-size:14px;">Nicole Bosiacka – Lash & Beauty</p>
      <table style="width:100%; border-collapse:collapse; font-size:15px; color:#2f3a32;">
        ${row("Imię i nazwisko", `${data.firstName} ${data.lastName}`)}
        ${row("E-mail", data.email)}
        ${row("Telefon", data.phone)}
        ${row("Usługa", data.serviceLabel)}
        ${row("Dodatki", data.addons.length ? data.addons.join(", ") : "—")}
        ${row("Data", data.date)}
        ${row("Godzina", data.time)}
        ${row("Cena", `${data.totalPrice} zł`)}
      </table>
    </div>
  </div>`
}

function customerHtml(data: BookingEmailData): string {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:${bgColor}; padding:32px;">
    <div style="max-width:560px; margin:0 auto; background:#fffdf8; border-radius:12px; padding:32px; border:1px solid #e6dfce;">
      <h1 style="color:${brandColor}; font-size:26px; margin:0 0 8px;">Dziękuję za rezerwację!</h1>
      <p style="color:#4a5249; font-size:15px; line-height:1.6;">
        Cześć ${data.firstName}, Twoja wizyta została zarejestrowana. Poniżej znajdziesz szczegóły.
        Skontaktuję się z Tobą w razie potrzeby. Do zobaczenia!
      </p>
      <table style="width:100%; border-collapse:collapse; font-size:15px; color:#2f3a32; margin-top:16px;">
        ${row("Usługa", data.serviceLabel)}
        ${row("Dodatki", data.addons.length ? data.addons.join(", ") : "—")}
        ${row("Data", data.date)}
        ${row("Godzina", data.time)}
        ${row("Cena", `${data.totalPrice} zł`)}
        ${row("Mój numer telefonu", "574 323 772")}
        ${row("Adres", "Plac J. Weyssenhoffa 9/1A, Dzielnica Muzyczna Centrum Miasta Bydgoszcz")}
      </table>
      <p style="color:#8a8f82; font-size:13px; margin-top:24px;">
        Lash by Niki
      </p>
      <p style="color:${brandColor}; font-size:18px; margin-top:24px; font-style:italic;">
        Nicole Bosiacka
      </p>
    </div>
  </div>`
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0; color:#8a8f82; width:40%; vertical-align:top;">${label}</td>
    <td style="padding:8px 0; font-weight:bold; vertical-align:top;">${value}</td>
  </tr>`
}

/**
 * Wysyła obie wiadomości. Jeśli SMTP nie jest skonfigurowany, loguje treść (development).
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log("[v0] SMTP nie skonfigurowany — pomijam wysyłkę e-maili.")
    console.log("[v0] Powiadomienie do właścicielki:", JSON.stringify(data))
    return
  }

  await Promise.all([
    transporter.sendMail({
      from: SMTP_FROM,
      to: OWNER_EMAIL,
      subject: `Nowa rezerwacja: ${data.firstName} ${data.lastName} – ${data.date} ${data.time}`,
      html: ownerHtml(data),
    }),
    transporter.sendMail({
      from: SMTP_FROM,
      to: data.email,
      subject: "Potwierdzenie rezerwacji – Nicole Bosiacka",
      html: customerHtml(data),
    }),
  ])
}
