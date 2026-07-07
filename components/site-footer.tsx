import Link from "next/link"
import { MapPin } from "lucide-react"

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.84 4.84 0 01-1.01-.07z" />
    </svg>
  )
}

const socialLinks = [
  {
    href: "https://www.instagram.com/nicole_bosiacka",
    label: "Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://facebook.com/nicole.bosiacka.1/",
    label: "Facebook",
    Icon: FacebookIcon,
  },
  {
    href: "https://www.tiktok.com/@lomisa_studio/",
    label: "TikTok",
    Icon: TikTokIcon,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-medium text-foreground">
              Nicole Bosiacka
            </p>
            <p className="font-script text-lg text-primary/70">
              Lash &amp; Beauty
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
              <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
              <address className="not-italic">
                Plac J. Weyssenhoffa 9/1A, Bydgoszcz
              </address>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col items-center gap-3 md:items-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Strony
            </p>
            <nav aria-label="Stopka nawigacja" className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Rezerwacja
              </Link>
              <Link
                href="/portfolio"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Portfolio
              </Link>
              <Link
                href="/opinie"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Opinie
              </Link>
            </nav>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Obserwuj mnie
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary hover:text-primary"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nicole Bosiacka. Wszelkie prawa
          zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
