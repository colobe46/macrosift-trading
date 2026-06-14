'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils'
import { MarketSymbol } from '@/types'
import Link from 'next/link'
import { useT } from '@/i18n/LocaleProvider'
import { LiveTicker } from './LiveTicker'

export function MarketOverview() {
  const [symbols, setSymbols] = useState<MarketSymbol[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useT()

  useEffect(() => {
    fetch('/api/markets').then(r => r.json()).then(data => {
      setSymbols(data.symbols || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-muted-foreground text-sm py-8 text-center">{t('dashboard.marketOverview.loading')}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.marketOverview.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">{t('dashboard.marketOverview.symbol')}</th>
                <th className="text-left py-2 pr-4">{t('dashboard.marketOverview.name')}</th>
                <th className="text-right py-2 pr-4">{t('dashboard.marketOverview.price')}</th>
                <th className="text-right py-2 pr-4">{t('dashboard.marketOverview.change')}</th>
                <th className="text-right py-2 pr-4">{t('dashboard.marketOverview.type')}</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((s) => (
                <tr key={s.symbol} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-2 pr-4 font-medium">{s.symbol}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{s.name}</td>
                  <td className="py-2 pr-4 text-right font-mono"><LiveTicker symbol={s.symbol} /></td>
                  <td className={`py-2 pr-4 text-right font-mono ${s.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(s.changePercent)}
                  </td>
                  <td className="py-2 text-right">
                    <Badge variant="outline" className="capitalize">{s.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
