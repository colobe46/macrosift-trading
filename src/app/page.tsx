'use client'
import { ArrowRight, BarChart3, Bell, Shield, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useT } from '@/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export default function HomePage() {
  const { data: session } = useSession()
  const { t } = useT()

  const features = [
    { icon: Bell, title: t('landing.features.alerts.title'), desc: t('landing.features.alerts.desc') },
    { icon: BarChart3, title: t('landing.features.charts.title'), desc: t('landing.features.charts.desc') },
    { icon: TrendingUp, title: t('landing.features.scanner.title'), desc: t('landing.features.scanner.desc') },
    { icon: Shield, title: t('landing.features.analysis.title'), desc: t('landing.features.analysis.desc') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="MacroSift" width={120} height={65} className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {session ? (
              <Link href="/dashboard"><Button>{t('common.dashboard')}</Button></Link>
            ) : (
              <Link href="/api/auth/signin"><Button variant="default">{t('common.signIn')}</Button></Link>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          {t('landing.hero.title')}<br />
          <span className="text-primary">{t('landing.hero.subtitle')}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          {t('landing.hero.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          {session ? (
            <Link href="/dashboard"><Button size="lg">{t('common.dashboard')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          ) : (
            <Link href="/api/auth/signin"><Button size="lg">{t('landing.hero.getStarted')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          )}
          <Link href="/pricing"><Button variant="outline" size="lg">{t('landing.hero.viewPricing')}</Button></Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        MacroSift — {t('landing.footer')}
      </footer>
    </div>
  )
}
