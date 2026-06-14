'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Bell, ArrowUp, ArrowDown } from 'lucide-react'
import { useT } from '@/i18n/LocaleProvider'

interface AlertLogItem {
  id: string
  symbol: string
  message: string
  sentAt: string
}

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<AlertLogItem[]>([])
  const { t } = useT()

  useEffect(() => {
    fetch('/api/alerts/logs').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAlerts(data.slice(0, 5))
    }).catch(() => {})
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('dashboard.recentAlerts.title')}</CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.recentAlerts.empty')}</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <Badge variant="outline" className="shrink-0 mt-0.5 font-mono text-xs">{a.symbol}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-muted-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground/60">{new Date(a.sentAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface Mover {
  symbol: string
  name: string
  changePercent: number
  price: number
}

export function MarketMovers() {
  const [movers, setMovers] = useState<Mover[]>([])
  const { t } = useT()

  useEffect(() => {
    fetch('/api/markets').then(r => r.json()).then(data => {
      if (data.symbols) {
        const sorted = [...data.symbols].filter((s: any) => s.changePercent).sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        setMovers(sorted.slice(0, 5))
      }
    }).catch(() => {})
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t('dashboard.marketMovers.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {movers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.marketMovers.loading')}</p>
        ) : (
          <div className="space-y-3">
            {movers.map((m) => (
              <div key={m.symbol} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{m.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.name}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm font-mono ${m.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {m.changePercent >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {m.changePercent >= 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
