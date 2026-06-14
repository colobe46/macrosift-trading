import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from './providers'
import { getServerLocale } from '@/i18n/server'
import { tServer } from '@/i18n/server'

const inter = Inter({ subsets: ['latin'] })

export function generateMetadata(): Metadata {
  const locale = getServerLocale()
  return {
    title: `${tServer('common.appName')} - ${tServer('landing.hero.title')}`,
    description: tServer('landing.hero.description'),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: 'MacroSift',
      description: tServer('landing.hero.description'),
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
