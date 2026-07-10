import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost, Dancing_Script, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/navbar'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
})

const dancing = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nicolebosiacka.pl'),
  title: {
    default: 'Nicole Bosiacka – Stylizacja Rzęs & Makijaż',
    template: '%s | Nicole Bosiacka',
  },
  description:
    'Profesjonalna stylizacja rzęs i makijaż. Umów wizytę online u Nicole Bosiacka – elegancja, precyzja i naturalne piękno.',
  keywords: [
    'stylizacja rzęs',
    'przedłużanie rzęs',
    'makijaż ślubny',
    'makijaż okolicznościowy',
    'Nicole Bosiacka',
    'lash',
    'beauty',
  ],
  openGraph: {
    title: 'Nicole Bosiacka – Stylizacja Rzęs & Makijaż',
    description:
      'Profesjonalna stylizacja rzęs i makijaż. Umów wizytę online.',
    type: 'website',
    locale: 'pl_PL',
    images: ['/images/logo-banner.jpg'],
  },
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pl"
      className={`${cormorant.variable} ${jost.variable} ${dancing.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
