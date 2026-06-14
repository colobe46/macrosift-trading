'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useT } from '@/i18n/LocaleProvider'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [saving, setSaving] = useState(false)
  const { t } = useT()

  const handleSave = async () => {
    setSaving(true)
    toast.success(t('settings.saved'))
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.profile')}</CardTitle>
          <CardDescription>{t('settings.profileInfo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.email')}</label>
            <Input value={session?.user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('settings.name')}</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? t('common.loading') : t('common.save')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.plan')}</CardTitle>
          <CardDescription>{t('dashboard.navbar.plan', { plan: session?.user?.plan || t('pricing.free.name') })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('alerts.title')}: {session?.user?.alertsLimit || 5} {t('dashboard.stats.ofLimit', { n: session?.user?.alertsLimit || 5 })}</p>
            <p>{t('dashboard.stats.watchlist')}: {session?.user?.watchlistLimit || 3}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.telegram')}</CardTitle>
          <CardDescription>{t('settings.telegramInstructions')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('settings.telegramSend')}
          </p>
          <Input value={`/email ${t('common.yourEmail')}`} readOnly className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground mt-2">{t('settings.copyCommand')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
