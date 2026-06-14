export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketSymbol {
  symbol: string
  name: string
  type: 'stock' | 'forex' | 'crypto' | 'index'
  exchange: string
  price: number
  change: number
  changePercent: number
  volume?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
}

export interface IndicatorValues {
  [key: string]: number | null
}

export interface AlertCondition {
  type: 'price' | 'indicator' | 'percent_change' | 'volume' | 'cross'
  operator: 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'equals'
  value: number
  indicator?: string
  timeframe?: string
}

export interface AlertDefinition {
  id: string
  symbol: string
  name?: string
  type: 'price' | 'indicator' | 'percent_change' | 'volume'
  condition: AlertCondition
  channel: 'telegram' | 'email' | 'both'
  enabled: boolean
}

export interface ScanResult {
  symbol: string
  price: number
  changePercent: number
  volume: number
  indicators: Record<string, number>
  signals: string[]
  score: number
}

export type PlanTier = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'
