'use client'
import { create } from 'zustand'
import { MarketSymbol, OHLCV, ScanResult } from '@/types'

interface MarketStore {
  symbols: MarketSymbol[]
  selectedSymbol: MarketSymbol | null
  ohlcv: OHLCV[]
  timeframe: string
  scanResults: ScanResult[]
  loading: boolean
  setSymbols: (symbols: MarketSymbol[]) => void
  selectSymbol: (symbol: MarketSymbol | null) => void
  setOHLCV: (data: OHLCV[]) => void
  setTimeframe: (tf: string) => void
  setScanResults: (results: ScanResult[]) => void
  setLoading: (v: boolean) => void
  updatePrice: (symbol: string, price: number, change: number, changePercent: number) => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  symbols: [],
  selectedSymbol: null,
  ohlcv: [],
  timeframe: '1h',
  scanResults: [],
  loading: false,
  setSymbols: (symbols) => set({ symbols }),
  selectSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setOHLCV: (data) => set({ ohlcv: data }),
  setTimeframe: (tf) => set({ timeframe: tf }),
  setScanResults: (results) => set({ scanResults: results }),
  setLoading: (v) => set({ loading: v }),
  updatePrice: (symbol, price, change, changePercent) => set((state) => ({
    symbols: state.symbols.map(s => s.symbol === symbol ? { ...s, price, change, changePercent } : s),
    selectedSymbol: state.selectedSymbol?.symbol === symbol
      ? { ...state.selectedSymbol, price, change, changePercent }
      : state.selectedSymbol,
  })),
}))
