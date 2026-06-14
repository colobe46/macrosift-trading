'use client'
import { useEffect } from 'react'
import { useMarketStore } from '@/stores/market'

export function usePricePolling(intervalMs = 30000) {
  const { setSymbols, updatePrice } = useMarketStore()

  useEffect(() => {
    let mounted = true
    const poll = async () => {
      try {
        const res = await fetch('/api/markets')
        const data = await res.json()
        if (!mounted) return
        if (data.symbols) {
          setSymbols(data.symbols)
          for (const s of data.symbols) {
            if (s.price) updatePrice(s.symbol, s.price, s.change, s.changePercent)
          }
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, intervalMs)
    return () => { mounted = false; clearInterval(id) }
  }, [intervalMs, setSymbols, updatePrice])
}
