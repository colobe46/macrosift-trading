import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const watchlist = await prisma.watchlist.findFirst({
    where: { userId: session.user.id },
  })
  return NextResponse.json(watchlist?.symbols || [])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { symbol } = await req.json()
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
  let watchlist = await prisma.watchlist.findFirst({ where: { userId: session.user.id } })
  if (!watchlist) {
    watchlist = await prisma.watchlist.create({
      data: { userId: session.user.id, symbols: [symbol.toUpperCase()] },
    })
  } else {
    const symbols = [...new Set([...watchlist.symbols, symbol.toUpperCase()])]
    watchlist = await prisma.watchlist.update({
      where: { id: watchlist.id },
      data: { symbols },
    })
  }
  return NextResponse.json(watchlist.symbols)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { symbol } = await req.json()
  const watchlist = await prisma.watchlist.findFirst({ where: { userId: session.user.id } })
  if (watchlist) {
    const symbols = watchlist.symbols.filter(s => s !== symbol.toUpperCase())
    await prisma.watchlist.update({ where: { id: watchlist.id }, data: { symbols } })
  }
  return NextResponse.json({ ok: true })
}
