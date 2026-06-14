import { NextRequest, NextResponse } from 'next/server'
import { fetchOHLCV } from '@/lib/market-data'
import { getOHLCV } from '@/lib/mt4-history'

const intervalMinutes: Record<string, number> = {
  '15m': 15, '30m': 30, '1h': 60, '2h': 120, '4h': 240,
  '8h': 480, '12h': 720, '1d': 1440, '1w': 10080,
}

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase().replace(/-/g, '/')
  const interval = req.nextUrl.searchParams.get('interval') || '1h'
  const count = Number(req.nextUrl.searchParams.get('count')) || 200
  const source = req.nextUrl.searchParams.get('source') || 'auto'

  const targetMin = intervalMinutes[interval] || 240

  let usedSource = 'external'
  if (source === 'mt4' || source === 'auto') {
    // MT4 HST files are 4H (240min). Intervals >=4H can use MT4 data.
    if (targetMin >= 240) {
      const mt4Data = getOHLCV(symbol, interval, count)
      if (mt4Data && mt4Data.length > 0) {
        const res = NextResponse.json(mt4Data)
        res.headers.set('X-Data-Source', 'MT4')
        return res
      }
    }
    if (source === 'mt4') {
      // Silently fall through to external API
    }
  }

  const data = await fetchOHLCV(symbol, interval, count)
  if (!data.length) return NextResponse.json({ error: 'No data' }, { status: 404 })
  const res = NextResponse.json(data)
  res.headers.set('X-Data-Source', source === 'mt4' ? 'API (fallback)' : 'API')
  return res
}
