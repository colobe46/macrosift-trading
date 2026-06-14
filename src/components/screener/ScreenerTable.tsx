'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPrice, formatPercent, formatVolume } from '@/lib/utils'
import { Search } from 'lucide-react'
import { ALL_SYMBOLS } from '@/lib/market-data'
import { MarketSymbol } from '@/types'
import { useT } from '@/i18n/LocaleProvider'

export function ScreenerTable() {
  const [query, setQuery] = useState('')
  const { t } = useT()
  const filtered = ALL_SYMBOLS.filter(s =>
    s.symbol.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('screener.assetScreener')}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('screener.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">{t('screener.symbol')}</th>
                <th className="text-left py-2 pr-4">{t('screener.name')}</th>
                <th className="text-right py-2 pr-4">{t('screener.type')}</th>
                <th className="text-right py-2 pr-4">{t('screener.exchange')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.symbol} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-2 pr-4 font-medium">{s.symbol}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{s.name}</td>
                  <td className="py-2 pr-4 text-right"><Badge variant="outline" className="capitalize">{s.type}</Badge></td>
                  <td className="py-2 text-right text-muted-foreground">{s.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
