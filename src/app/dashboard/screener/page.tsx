'use client'
import { ScreenerPanel } from '@/components/screener/ScreenerPanel'
import { useT } from '@/i18n/LocaleProvider'

export default function ScreenerPage() {
  const { t } = useT()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('screener.title')}</h1>
        <p className="text-muted-foreground">{t('screener.subtitle')}</p>
      </div>
      <ScreenerPanel />
    </div>
  )
}
