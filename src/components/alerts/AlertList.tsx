'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useT } from '@/i18n/LocaleProvider'

interface Alert {
  id: string
  symbol: string
  type: string
  condition: any
  enabled: boolean
  channel: string
  createdAt: string
}

function formatCondition(c: any): string {
  if (!c) return ''
  const opLabels: Record<string, string> = {
    above: '\u003E', below: '\u003C', crosses_above: '\u2197 crosses', crosses_below: '\u2198 crosses',
  }
  const op = opLabels[c.operator] || c.operator
  const val = typeof c.value === 'number' ? c.value.toLocaleString() : c.value
  if (c.indicator) return `${c.indicator.toUpperCase()} ${op} ${val}`
  if (c.type === 'percent_change') return `${op} ${val}%`
  return `${op} $${val}`
}

export function AlertList() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [used, setUsed] = useState(0)
  const [limit, setLimit] = useState(5)
  const [loading, setLoading] = useState(true)
  const { t } = useT()

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/alerts')
      if (res.ok) {
        const body = await res.json()
        setAlerts(body.alerts || body)
        if (body.used !== undefined) setUsed(body.used)
        if (body.limit !== undefined) setLimit(body.limit)
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { loadAlerts() }, [])

  const toggleAlert = async (id: string, enabled: boolean) => {
    await fetch(`/api/alerts`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    })
    loadAlerts()
  }

  const deleteAlert = async (id: string) => {
    await fetch(`/api/alerts`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadAlerts()
  }

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">{t('alerts.loading')}</div>

  return (
    <Card>
      <CardHeader>
          <CardTitle className="text-lg">{t('alerts.yourAlerts')} <span className="text-sm font-normal text-muted-foreground">{used}/{limit}</span></CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('alerts.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{a.symbol}</span>
                    <Badge variant="outline" className="text-xs capitalize">{a.type}</Badge>
                    <Badge variant={a.channel === 'telegram' ? 'success' : 'secondary'} className="text-xs">{a.channel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCondition(a.condition)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={a.enabled} onCheckedChange={(v) => toggleAlert(a.id, v)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteAlert(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
