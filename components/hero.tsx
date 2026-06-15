import Image from "next/image"

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="relative w-full">
        <Image
          src="/images/logo-banner.jpg"
          alt="Nicole Bosiacka – Lash & Beauty"
          width={1062}
          height={602}
          priority
          className="max-h-48 w-full object-cover sm:max-h-64"
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-2 pt-5 text-center">
        <p className="font-script text-2xl text-primary/80">Witaj</p>
        <h1 className="mt-1 text-balance font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Umów swoją wizytę
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Stylizacja rzęs i profesjonalny makijaż w kameralnej, eleganckiej
          atmosferze. Wybierz usługę, dogodny termin i zarezerwuj miejsce w
          kilku prostych krokach.
        </p>
      </div>
    </header>
  )
}
