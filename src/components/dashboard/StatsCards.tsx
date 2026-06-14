'use client'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Bell, Activity, DollarSign } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useT } from '@/i18n/LocaleProvider'

export function StatsCards() {
  const { data: session } = useSession()
  const { t } = useT()
  const plan = session?.user?.plan || 'free'

  const stats = [
    { icon: Activity, label: t('dashboard.stats.alertsActive'), value: '5', sub: t('dashboard.stats.ofLimit', { n: session?.user?.alertsLimit || 5 }) },
    { icon: Bell, label: t('dashboard.stats.triggeredToday'), value: '12', sub: t('dashboard.stats.todayVsYesterday') },
    { icon: TrendingUp, label: t('dashboard.stats.watchlist'), value: '8', sub: t('dashboard.stats.assetsTracked') },
    { icon: DollarSign, label: t('dashboard.stats.plan'), value: plan === 'pro' ? 'Pro' : t('pricing.free.name'), sub: plan === 'pro' ? t('dashboard.stats.unlimited') : t('dashboard.stats.upgrade') },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
