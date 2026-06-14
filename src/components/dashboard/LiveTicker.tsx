'use client'
import { useEffect, useState, useCallback } from 'react'

interface Tick { bid: number; ask: number; time: number }

const DIGITS = (v: number) => v >= 1000 ? 2 : v >= 10 ? 3 : v >= 1 ? 4 : 5

export function LiveTicker({ symbol }: { symbol: string }) {
  const [tick, setTick] = useState<Tick | null>(null)
  const [error, setError] = useState(false)

  const fetchTick = useCallback(async () => {
    try {
      const sym = symbol.replace(/\//g, '')
      const res = await fetch(`/api/live/tick/${sym}`)
      if (!res.ok) { setError(true); return }
      setTick(await res.json())
      setError(false)
    } catch { setError(true) }
  }, [symbol])

  useEffect(() => {
    fetchTick()
    const id = setInterval(fetchTick, 2000)
    return () => clearInterval(id)
  }, [fetchTick])

  if (tick) return <span className="font-mono tabular-nums">{tick.bid.toFixed(DIGITS(tick.bid))}</span>
  if (error) return <span className="text-muted-foreground text-xs">--</span>
  return <span className="text-muted-foreground text-xs">...</span>
}
