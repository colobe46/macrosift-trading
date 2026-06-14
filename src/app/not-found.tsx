'use client'
import Link from 'next/link'
import { useT } from '@/i18n/LocaleProvider'

export default function NotFound() {
  const { t } = useT()
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl text-muted-foreground">{t('notFound.title')}</p>
        <Link href="/dashboard" className="text-primary hover:underline">{t('notFound.back')}</Link>
      </div>
    </div>
  )
}
