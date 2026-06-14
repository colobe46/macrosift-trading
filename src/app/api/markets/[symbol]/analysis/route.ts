import { NextRequest, NextResponse } from 'next/server'
import { fetchQuote, fetchOHLCV, getCoinName, getCategoryFor, METAL_NAMES } from '@/lib/market-data'
import { calcRSI, calcMACD, calcBB, calcATR, IndicatorInput } from '@/lib/indicators'

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase().replace(/-/g, '/')
  const name = getCoinName(symbol)
  const category = getCategoryFor(symbol)
  const isMetal = symbol in METAL_NAMES

  const quote = await fetchQuote(symbol)
  if (!quote) return NextResponse.json({ error: 'No data' }, { status: 404 })

  const ohlcv = await fetchOHLCV(symbol, '1h', 100)
  const ohlcvDaily = await fetchOHLCV(symbol, '1d', 30)

  const input: IndicatorInput = {
    close: ohlcv.map(c => c.close),
    high: ohlcv.map(c => c.high),
    low: ohlcv.map(c => c.low),
    volume: ohlcv.map(c => c.volume),
  }

  const rsi = input.close.length >= 14 ? calcRSI(input) : []
  const macd = input.close.length >= 26 ? calcMACD(input) : null
  const bb = input.close.length >= 20 ? calcBB(input) : null
  const atr = input.close.length >= 14 ? calcATR(input) : []

  const lastRSI = rsi.length > 1 ? rsi[rsi.length - 1] : null
  const lastPrice = quote.price

  const analysis = {
    symbol,
    name,
    category,
    isMetal,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    rsi: lastRSI ? { value: Math.round(lastRSI * 100) / 100, signal: lastRSI > 70 ? 'overbought' : lastRSI < 30 ? 'oversold' : 'neutral' } : null,
    macd: macd ? {
      macdLine: Math.round(macd.macdLine[macd.macdLine.length - 1] * 100) / 100,
      signal: Math.round(macd.signal[macd.signal.length - 1] * 100) / 100,
      histogram: Math.round(macd.histogram[macd.histogram.length - 1] * 100) / 100,
    } : null,
    bb: bb ? {
      upper: Math.round(bb.upper[bb.upper.length - 1] * 100) / 100,
      middle: Math.round(bb.middle[bb.middle.length - 1] * 100) / 100,
      lower: Math.round(bb.lower[bb.lower.length - 1] * 100) / 100,
    } : null,
    atr: atr.length > 1 ? Math.round(atr[atr.length - 1] * 100) / 100 : null,
    high24h: ohlcvDaily.length > 0 ? Math.max(...ohlcvDaily.slice(-24).map(c => c.high)) : null,
    low24h: ohlcvDaily.length > 0 ? Math.min(...ohlcvDaily.slice(-24).map(c => c.low)) : null,
    volume24h: ohlcv.slice(-24).reduce((s, c) => s + c.volume, 0),
    volatility: atr.length > 1 && lastPrice ? Math.round((atr[atr.length - 1] / lastPrice) * 10000) / 100 : null,
  }

  return NextResponse.json(analysis)
}
