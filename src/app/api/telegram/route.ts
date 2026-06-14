import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramUpdate } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const update = await req.json()
  await handleTelegramUpdate(update)
  return NextResponse.json({ ok: true })
}
