'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { useT } from '@/i18n/LocaleProvider'

interface LogEntry {
  id: string
  symbol: string
  message: string
  sentAt: string
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useT()

  useEffect(() => {
    fetch('/api/alerts/logs').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLogs(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('history.title')}</h1>
        <p className="text-muted-foreground">{t('history.subtitle')}</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">{t('history.log')}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('history.empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/20 border border-border text-sm">
                  <Badge variant="outline" className="shrink-0 font-mono">{l.symbol}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">{l.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground/60 shrink-0">{new Date(l.sentAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
