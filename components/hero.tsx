import Image from "next/image"

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Banner image with gradient overlay */}
      <div className="relative w-full">
        <Image
          src="/images/logo-banner.jpg"
          alt="Nicole Bosiacka – Lash & Beauty"
          width={1062}
          height={602}
          priority
          className="max-h-48 w-full object-cover sm:max-h-60"
        />
        {/* Bottom fade into background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        {/* Subtle top vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-background/20" />
      </div>

      {/* Text content – overlaps the image slightly */}
      <div className="relative -mt-4 mx-auto max-w-2xl px-6 pb-2 pt-0 text-center">
        <p className="hero-script font-script text-2xl text-primary/80">Witaj</p>
        <h1 className="hero-title mt-1 text-balance font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Umów swoją wizytę
        </h1>
        <p className="hero-sub mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Stylizacja rzęs i profesjonalny makijaż w kameralnej, eleganckiej
          atmosferze. Wybierz usługę, dogodny termin i zarezerwuj miejsce w
          kilku prostych krokach.
        </p>
      </div>
    </header>
  )
}
