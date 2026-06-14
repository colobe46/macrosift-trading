import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = (searchParams.get('symbol') || 'SP500').toUpperCase()

  const raw = await redis.get(`mt4:price:${symbol}`)
  if (!raw) {
    return NextResponse.json({ error: `No MT4 data for ${symbol}` }, { status: 404 })
  }

  const latest = JSON.parse(raw)
  const historyRaw = await redis.zrevrange(`mt4:history:${symbol}`, 0, 999, 'WITHSCORES')
  const history: { bid: number; ask: number; timestamp: string }[] = []
  for (let i = 0; i < historyRaw.length; i += 2) {
    const parts = (historyRaw[i] as string).split(':')
    history.push({ bid: parseFloat(parts[1]), ask: parseFloat(parts[2]), timestamp: new Date(parseInt(parts[0])).toISOString() })
  }
  history.reverse()

  return NextResponse.json({ symbol, latest, history })
}
