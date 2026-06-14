import { NextRequest, NextResponse } from 'next/server'
import { fetchQuote } from '@/lib/market-data'
import { ALL_SYMBOLS } from '@/lib/market-data'

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase().replace(/-/g, '/')
  const meta = ALL_SYMBOLS.find(s => s.symbol === symbol)
  const quote = await fetchQuote(symbol)
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...meta, ...quote, symbol })
}
