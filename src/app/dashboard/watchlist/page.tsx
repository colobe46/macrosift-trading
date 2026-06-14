'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

function symUrl(symbol: string) { return symbol.replace(/\//g, '-') }
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPercent } from '@/lib/utils'
import { MarketSymbol, OHLCV } from '@/types'
import { MarketChart } from '@/components/charts/MarketChart'
import { useMarketStore } from '@/stores/market'
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton'
import { usePricePolling } from '@/hooks/usePricePolling'
import { Search, Plus, X, Maximize2, Minimize2, Database, Radio } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useT } from '@/i18n/LocaleProvider'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { LiveTicker } from '@/components/dashboard/LiveTicker'

const INTERVALS = [
  { label: '15m', interval: '15m', count: 200 },
  { label: '30m', interval: '30m', count: 200 },
  { label: '1H', interval: '1h', count: 200 },
  { label: '4H', interval: '4h', count: 200 },
  { label: '1D', interval: '1d', count: 150 },
  { label: '1W', interval: '1w', count: 100 },
]

export default function WatchlistPage() {
  const { selectedSymbol, selectSymbol, ohlcv, setOHLCV } = useMarketStore()
  const { data: session } = useSession()
  const [symbols, setSymbols] = useState<MarketSymbol[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<MarketSymbol[]>([])
  const [currentInterval, setCurrentInterval] = useState(INTERVALS[2])
  const [chartKey, setChartKey] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [chartHeight, setChartHeight] = useState(400)
  const [dataSource, setDataSource] = useState<'mt4' | 'api' | 'auto'>('auto')
  const [availableSources, setAvailableSources] = useState<{id:string,label:string,available:boolean}[]>([])
  const [activeSource, setActiveSource] = useState<string>('')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInnerRef = useRef<HTMLDivElement>(null)
  const { t } = useT()

  usePricePolling(30000)

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      chartContainerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [fullscreen])

  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement
      setFullscreen(fs)
      if (fs) {
        setTimeout(() => setChartHeight(window.innerHeight - 100), 100)
      } else {
        setChartHeight(400)
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!fullscreen || !chartInnerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setChartHeight(entry.contentRect.height - 10)
    })
    ro.observe(chartInnerRef.current)
    return () => ro.disconnect()
  }, [fullscreen])

  const fetchChart = useCallback((symbol: string, iv: typeof currentInterval, source?: string) => {
    setChartLoading(true)
    const src = source || dataSource
    fetch(`/api/markets/${symUrl(symbol)}/chart?interval=${iv.interval}&count=${iv.count}&source=${src}`)
      .then(r => {
        const dataSource = r.headers.get('X-Data-Source') || 'API'
        setActiveSource(dataSource)
        return r.json()
      })
      .then((data: OHLCV[]) => { if (Array.isArray(data)) setOHLCV(data); setChartLoading(false) })
      .catch(() => setChartLoading(false))
  }, [setOHLCV, dataSource])

  useEffect(() => {
    fetch('/api/symbols').then(r => r.json()).then(async (tracked: string[]) => {
      if (!tracked.length) { setLoading(false); return }
      const results = await Promise.allSettled(
        tracked.map(sym => fetch(`/api/markets?search=${encodeURIComponent(sym)}`).then(r => r.json()))
      )
      const all = results.flatMap((r: any) => r.status === 'fulfilled' ? (r.value?.symbols || []) : []) as MarketSymbol[]
      const trackedSymbols = all.filter(s => tracked.includes(s.symbol))
      setSymbols(trackedSymbols)
      setLoading(false)
      if (trackedSymbols.length > 0 && !selectedSymbol) {
        selectSymbol(trackedSymbols[0])
      }
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedSymbol) {
      setChartKey(k => k + 1)
      fetchChart(selectedSymbol.symbol, currentInterval, dataSource)
      // Fetch available sources for this symbol
      fetch(`/api/markets/${symUrl(selectedSymbol.symbol)}/sources`)
        .then(r => r.json())
        .then(d => {
          const srcs = d.sources || []
          setAvailableSources(srcs)
          // Auto-select: if only one source, pick it; otherwise default to 'mt4' if available
          const srcIds = srcs.map((s: any) => s.id)
          if (srcIds.length === 1) {
            setDataSource(srcIds[0] as any)
          } else if (!srcIds.includes(dataSource)) {
            setDataSource(srcIds.includes('mt4') ? 'auto' : srcIds[0] as any)
          }
        })
        .catch(() => {})
    }
  }, [selectedSymbol, dataSource])

  const addSymbol = async (sym: string) => {
    const limit = session?.user?.watchlistLimit ?? 10
    if (!session?.user) {
      toast.error('Debes iniciar sesión para añadir activos')
      return
    }
    if (symbols.length >= limit) {
      toast.error(`Límite de ${limit} activos alcanzado`)
      return
    }
    const res = await fetch('/api/symbols', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err?.error || 'Error al guardar el activo')
      return
    }
    // Try to find the symbol in the full market list, but also search specifically
    const data = await fetch(`/api/markets?search=${encodeURIComponent(sym)}`)
    const all = (await data.json()).symbols || []
    const match = all.find((s: MarketSymbol) => s.symbol === sym)
    if (match) {
      setSymbols(prev => [...prev, match])
    } else {
      // Fallback: add with basic info from the saved symbol
      setSymbols(prev => [...prev, { symbol: sym, name: sym, type: 'forex' as const, exchange: '', price: 0, change: 0, changePercent: 0 }])
    }
    setSearch('')
    setSearchResults([])
  }

  const removeSymbol = async (sym: string) => {
    await fetch('/api/symbols', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym }),
    })
    setSymbols(prev => prev.filter(s => s.symbol !== sym))
    if (selectedSymbol?.symbol === sym) selectSymbol(symbols[0] || null)
  }

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 1) { setSearchResults([]); return }
    const res = await fetch(`/api/markets?search=${q}`)
    const data = await res.json()
    setSearchResults((data.symbols || []).filter((s: MarketSymbol) => !symbols.find(t => t.symbol === s.symbol)).slice(0, 5))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">{t('watchlist.title')}</h1><p className="text-muted-foreground">{t('watchlist.loading')}</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-1" />
          <div className="lg:col-span-2"><SkeletonChart height={400} /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('watchlist.title')}</h1>
        <p className="text-muted-foreground">{t('watchlist.assetsTracked', { n: symbols.length })}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('watchlist.search')}
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="pl-9"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-1 w-full rounded-md border border-border bg-popover shadow-md z-10">
            {searchResults.map((s) => (
              <button
                key={s.symbol}
                onClick={() => addSymbol(s.symbol)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span className="font-medium">{s.symbol}</span>
                <span className="text-muted-foreground">{s.name}</span>
                <Plus className="h-3 w-3 text-primary" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">{t('watchlist.assets')}</CardTitle></CardHeader>
          <CardContent>
            {symbols.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">{t('watchlist.empty')}</p>
                <p className="text-xs mt-1">{t('watchlist.addHint')}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {symbols.map((s) => (
                  <div key={s.symbol} className="group flex items-center">
                    <button
                      onClick={() => selectSymbol(s)}
                      className={`flex-1 flex items-center justify-between p-2 rounded-md text-sm transition-colors hover:bg-accent ${selectedSymbol?.symbol === s.symbol ? 'bg-accent' : ''}`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{s.symbol}</div>
                        <div className="text-xs text-muted-foreground">{s.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono"><LiveTicker symbol={s.symbol} /></div>
                        <div className={`text-xs font-mono ${s.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercent(s.changePercent)}
                        </div>
                      </div>
                    </button>
                    <button onClick={() => removeSymbol(s.symbol)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div ref={chartContainerRef} className={`${fullscreen ? 'fixed inset-0 z-50 bg-background' : 'lg:col-span-2'}`}>
          <div className={fullscreen ? 'h-full flex flex-col p-4' : ''}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {selectedSymbol ? `${selectedSymbol.symbol} — ${selectedSymbol.name}` : t('watchlist.noSelection')}
              </h3>
              {activeSource && (
                <Badge variant="outline" className="text-xs font-normal ml-2">
                  {activeSource}
                </Badge>
              )}
              {selectedSymbol && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5 mr-2 bg-muted rounded-lg p-0.5">
                    {INTERVALS.map((iv) => (
                      <button
                        key={iv.interval}
                        onClick={() => {
                          setCurrentInterval(iv)
                          setChartKey(k => k + 1)
                          fetchChart(selectedSymbol.symbol, iv, dataSource)
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          currentInterval.interval === iv.interval
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {iv.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 mr-2 bg-muted rounded-lg p-0.5">
                    {availableSources.filter(s => s.id !== 'api' || true).map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setDataSource(s.id as any); setChartKey(k => k + 1); if (selectedSymbol) fetchChart(selectedSymbol.symbol, currentInterval, s.id) }}
                        className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                          (dataSource === s.id || (dataSource === 'auto' && availableSources.length > 0 && availableSources[0].id === s.id))
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s.id === 'mt4' ? <Database className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0">
              {!selectedSymbol ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {t('watchlist.addHint')}
                </div>
              ) : chartLoading ? (
                <SkeletonChart height={chartHeight} />
              ) : ohlcv.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {t('watchlist.noData', { symbol: selectedSymbol.symbol })}
                </div>
              ) : (
                <div key={chartKey} ref={chartInnerRef} className="h-full">
                  <MarketChart data={ohlcv} height={chartHeight} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
