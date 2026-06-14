import { NextRequest, NextResponse } from 'next/server'
import { ALL_COINS, NON_CRYPTO } from '@/lib/market-data'

// Check if MT4 history exists for a symbol
function hasMT4(symbol: string): boolean {
  const sym = symbol.toUpperCase().replace(/\//g, '')
  // MT4 history only for forex pairs on MetaQuotes-Demo
  const mt4Symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
    'GBPJPY', 'GBPCHF', 'AUDJPY', 'AUDCHF', 'AUDNZD', 'CADJPY', 'CADCHF', 'CHFJPY']
  return mt4Symbols.includes(sym)
}

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase().replace(/-/g, '/')
  const sym = symbol.toUpperCase().replace(/\//g, '')
  const isCrypto = ALL_COINS.includes(sym) && !NON_CRYPTO.has(sym)
  const isForex = symbol.includes('/')

  const sources = []

  if (hasMT4(symbol)) {
    sources.push({ id: 'mt4', label: 'MT4', available: true })
  }

  if (isCrypto) {
    sources.push({ id: 'api', label: 'Binance', available: true })
  } else if (isForex) {
    sources.push({ id: 'api', label: 'Yahoo/API', available: true })
  } else {
    sources.push({ id: 'api', label: 'Yahoo Finance', available: true })
  }

  return NextResponse.json({ sources })
}
