'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { MarketSymbol } from '@/types'
import { useT } from '@/i18n/LocaleProvider'

const INDICATORS = ['rsi', 'macd', 'bb', 'stoch', 'volume', 'price']
const OPERATORS = ['above', 'below', 'crosses_above', 'crosses_below']

export function AlertForm({ onCreated }: { onCreated?: () => void }) {
  const [symbol, setSymbol] = useState('')
  const [searchResults, setSearchResults] = useState<MarketSymbol[]>([])
  const [searching, setSearching] = useState(false)
  const [type, setType] = useState('price')
  const [operator, setOperator] = useState('above')
  const [value, setValue] = useState('')
  const [channel, setChannel] = useState('telegram')
  const [saving, setSaving] = useState(false)
  const { t } = useT()

  const handleSearch = async (q: string) => {
    setSymbol(q)
    if (q.length < 1) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/markets?search=${q}`)
      const data = await res.json()
      setSearchResults((data.symbols || []).slice(0, 6))
    } catch { setSearchResults([]) }
    finally { setSearching(false) }
  }

  const selectSymbol = (sym: string) => {
    setSymbol(sym)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symbol || !value) { toast.error(t('alerts.fillFields')); return }
    setSaving(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          type,
          operator,
          value: Number(value),
          channel,
        }),
      })
      if (res.ok) {
        toast.success(t('alerts.created'))
        setSymbol(''); setValue('')
        onCreated?.()
      } else {
        const err = await res.json()
        toast.error(err.error || t('alerts.failedCreate'))
      }
    } catch { toast.error(t('common.networkError')) }
    finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{t('alerts.create')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('alerts.form.symbol')}</label>
              <div className="relative">
                <Input placeholder={t('alerts.form.symbolPlaceholder')} value={symbol} onChange={e => handleSearch(e.target.value)} />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-md border border-border bg-popover shadow-md z-10 max-h-48 overflow-y-auto">
                    {searchResults.map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => selectSymbol(s.symbol)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <span className="font-medium">{s.symbol}</span>
                        <span className="text-muted-foreground text-xs">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{t('common.loading')}</span>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('alerts.form.type')}</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDICATORS.map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('alerts.form.condition')}</label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPERATORS.map(o => <SelectItem key={o} value={o}>{o.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('alerts.form.value')}</label>
              <Input type="number" step="any" placeholder={t('alerts.form.valuePlaceholder')} value={value} onChange={e => setValue(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('alerts.form.channel')}</label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">{t('alerts.form.telegram')}</SelectItem>
                <SelectItem value="email">{t('alerts.form.email')}</SelectItem>
                <SelectItem value="both">{t('alerts.form.both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? t('alerts.creating') : t('alerts.create')}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
