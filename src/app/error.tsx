'use client'
import { useT } from '@/i18n/LocaleProvider'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useT()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">{t('common.error')}</h1>
        <p className="text-muted-foreground">{t('common.noData')}</p>
        <button onClick={reset} className="text-primary hover:underline">{t('common.tryAgain')}</button>
      </div>
    </div>
  )
}
