'use client'
import { useSession } from 'next-auth/react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { RecentAlerts, MarketMovers } from '@/components/dashboard/MarketWidgets'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import { useT } from '@/i18n/LocaleProvider'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const { t } = useT()

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t) }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome', { name: session?.user?.name || t('common.trader') })}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <StatsCards />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <SkeletonTable rows={8} /> : <MarketOverview />}
        </div>
        <div className="space-y-6">
          {loading ? <SkeletonCard /> : <MarketMovers />}
          {loading ? <SkeletonCard /> : <RecentAlerts />}
        </div>
      </div>
    </div>
  )
}
