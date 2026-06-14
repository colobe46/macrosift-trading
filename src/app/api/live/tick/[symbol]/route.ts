import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET(_req: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase()
  const raw = await redis.get(`tick:${symbol}`)
  if (!raw) {
    return NextResponse.json({ error: 'No live tick data' }, { status: 404 })
  }
  return NextResponse.json(JSON.parse(raw))
}
