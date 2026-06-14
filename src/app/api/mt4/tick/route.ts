import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import redis from '@/lib/redis'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${process.env.TELEGRAM_BOT_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { symbol, bid, ask, volume } = await req.json()
  if (!symbol || bid == null || ask == null) {
    return NextResponse.json({ error: 'Missing symbol, bid, or ask' }, { status: 400 })
  }

  const sym = (symbol as string).toUpperCase()

  await Promise.all([
    prisma.tick.create({ data: { symbol: sym, bid, ask, volume: volume || 0 } }),
    redis.set(`tick:${sym}`, JSON.stringify({ bid, ask, time: Date.now() }), 'EX', 60),
  ])

  return NextResponse.json({ ok: true })
}
