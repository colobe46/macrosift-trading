import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, bid, ask } = body

    if (!symbol || typeof bid !== 'number' || typeof ask !== 'number') {
      return NextResponse.json({ ok: false, error: 'Missing symbol, bid, or ask' }, { status: 400 })
    }

    const s = symbol.toUpperCase()
    const ts = Date.now()
    const payload = { bid, ask, timestamp: new Date().toISOString() }
    const tickPayload = { bid, ask, time: ts }

    await Promise.all([
      redis.set(`mt4:price:${s}`, JSON.stringify(payload)),
      redis.set(`tick:${s}`, JSON.stringify(tickPayload), 'EX', 60),
      redis.zadd(`mt4:history:${s}`, ts, `${ts}:${bid}:${ask}`),
      redis.zremrangebyrank(`mt4:history:${s}`, 0, -10001),
      redis.publish(`mt4:tick:${s}`, JSON.stringify(payload)),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
