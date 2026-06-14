'use client'
import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import {
  createChart, IChartApi, ISeriesApi,
  CandlestickSeries, HistogramSeries,
  CandlestickData, HistogramData, ColorType,
  LineStyle,
} from 'lightweight-charts'
import { OHLCV } from '@/types'
import { useT } from '@/i18n/LocaleProvider'

interface MarketChartProps {
  data: OHLCV[]
  loading?: boolean
  height?: number
}

function computeLevels(data: OHLCV[], n = 3): { price: number; label: string; color: string }[] {
  if (data.length < 20) return []
  const recent = data.slice(-60)
  const highs = recent.map(d => d.high).sort((a, b) => b - a)
  const lows = recent.map(d => d.low).sort((a, b) => a - b)
  const levels: { price: number; label: string; color: string }[] = []
  const used = new Set<number>()

  for (let i = 0; i < Math.min(n, highs.length); i++) {
    const nearest = highs.filter(h => ![...used].some(u => Math.abs(h - u) / u < 0.003))
    if (nearest.length === 0) break
    const val = nearest[0]
    used.add(val)
    levels.push({ price: val, label: 'R', color: '#ef5350' })
  }

  for (let i = 0; i < Math.min(n, lows.length); i++) {
    const nearest = lows.filter(l => ![...used].some(u => Math.abs(l - u) / u < 0.003))
    if (nearest.length === 0) break
    const val = nearest[0]
    used.add(val)
    levels.push({ price: val, label: 'S', color: '#26a69a' })
  }

  return levels.sort((a, b) => a.price - b.price)
}

export function MarketChart({ data, loading, height = 400 }: MarketChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const priceLinesRef = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']>[]>([])
  const [showSR, setShowSR] = useState(true)
  const { t } = useT()

  const levels = useMemo(() => computeLevels(data), [data])

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#888',
      },
      grid: {
        vertLines: { color: '#1a1a2e' },
        horzLines: { color: '#1a1a2e' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#2a6eff', width: 1, style: 2, labelBackgroundColor: '#2a6eff' },
        horzLine: { color: '#2a6eff', width: 1, style: 2, labelBackgroundColor: '#2a6eff' },
      },
      rightPriceScale: { borderColor: '#2a2a4a' },
      timeScale: { borderColor: '#2a2a4a', timeVisible: true, secondsVisible: false },
      handleScroll: { vertTouchDrag: false },
      width: containerRef.current.clientWidth,
      height,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })
    const volSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a20',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    chartRef.current = chart
    candleRef.current = candleSeries
    volumeRef.current = volSeries

    const syncWidth = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    syncWidth()
    window.addEventListener('resize', syncWidth)
    return () => {
      window.removeEventListener('resize', syncWidth)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.applyOptions({ height })
  }, [height])

  useEffect(() => {
    if (!candleRef.current || !volumeRef.current) return
    if (!data || !data.length) return
    const candles: CandlestickData[] = data.map(d => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    const volumes: HistogramData[] = data.map(d => ({
      time: d.time as any,
      value: d.volume,
      color: d.close >= d.open ? '#26a69a40' : '#ef535040',
    }))
    candleRef.current.setData(candles)
    volumeRef.current.setData(volumes)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  const updateLines = useCallback((series: ISeriesApi<'Candlestick'>, enabled: boolean, lvls: typeof levels) => {
    priceLinesRef.current.forEach(pl => {
      series.removePriceLine(pl)
    })
    priceLinesRef.current = []
    if (!enabled) return
    lvls.forEach(l => {
      const pl = series.createPriceLine({
        price: l.price,
        color: l.color,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: l.label,
      })
      priceLinesRef.current.push(pl)
    })
  }, [])

  useEffect(() => {
    const series = candleRef.current
    if (!series) return
    updateLines(series, showSR, levels)
  }, [levels, showSR, updateLines])

  return (
    <div className="relative">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setShowSR(v => !v)}
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            showSR
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted/50 border-border text-muted-foreground'
          }`}
        >
          {t('dashboard.sRLabel')}
        </button>
        <div className="group relative">
          <span className="text-xs text-muted-foreground cursor-help border border-border rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow whitespace-nowrap">
            {t('dashboard.sRTooltip')}
          </div>
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <span className="text-muted-foreground">{t('common.chartLoading')}</span>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
