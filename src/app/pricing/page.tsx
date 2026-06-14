'use client'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useT } from '@/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export default function PricingPage() {
  const { data: session } = useSession()
  const { t } = useT()

  const freeFeatures = t('pricing.free.features') as string[]
  const proFeatures = t('pricing.pro.features') as string[]

  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">{t('common.appName')}</Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href={session ? '/dashboard' : '/api/auth/signin'}>
              <Button variant="outline" size="sm">{session ? t('common.dashboard') : t('common.signIn')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
        <p className="text-muted-foreground mb-12">{t('pricing.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{plans[0].name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plans[0].price}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Array.isArray(freeFeatures) && freeFeatures.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={session ? '/dashboard' : '/api/auth/signin'} className="w-full">
                <Button variant="outline" className="w-full">{session ? t('common.dashboard') : t('common.signIn')}</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="relative border-primary shadow-lg shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {t('pricing.popular')}
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{plans[1].name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plans[1].price}</span>
              </div>
              <CardDescription>{plans[1].name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Array.isArray(proFeatures) && proFeatures.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/api/auth/signin" className="w-full">
                <Button className="w-full">{t('common.signIn')}</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
