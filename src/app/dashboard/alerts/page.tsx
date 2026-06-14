'use client'
import { useState } from 'react'
import { AlertList } from '@/components/alerts/AlertList'
import { AlertForm } from '@/components/alerts/AlertForm'
import { useT } from '@/i18n/LocaleProvider'

export default function AlertsPage() {
  const { t } = useT()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('alerts.title')}</h1>
        <p className="text-muted-foreground">{t('alerts.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertForm onCreated={() => setRefreshKey(k => k + 1)} />
        <AlertList key={refreshKey} />
      </div>
    </div>
  )
}
