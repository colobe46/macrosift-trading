'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useT } from '@/i18n/LocaleProvider'

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [telegramAlerts, setTelegramAlerts] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const { t } = useT()

  const handleSave = () => {
    toast.success(t('settings.notifications.saved'))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.notifications.title')}</h1>
        <p className="text-muted-foreground">{t('settings.notifications.subtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.notifications.channels')}</CardTitle>
          <CardDescription>{t('settings.notifications.chooseChannels')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t('settings.notifications.telegram')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.notifications.telegramFast')}</p>
            </div>
            <Switch checked={telegramAlerts} onCheckedChange={setTelegramAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{t('settings.notifications.email')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.notifications.emailSentTo', { email: session?.user?.email || '' })}</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <Button onClick={handleSave}>{t('settings.notifications.save')}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.notifications.linkTelegram')}</CardTitle>
          <CardDescription>{t('settings.notifications.linkTelegramDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block bg-secondary p-3 rounded text-sm font-mono">
            /email {session?.user?.email || t('common.yourEmail')}
          </code>
        </CardContent>
      </Card>
    </div>
  )
}
