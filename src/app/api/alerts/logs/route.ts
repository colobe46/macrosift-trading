import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const logs = await prisma.alertLog.findMany({
    where: { alert: { userId: session.user.id } },
    orderBy: { sentAt: 'desc' },
    take: 50,
    include: { alert: { select: { symbol: true } } },
  })
  return NextResponse.json(logs.map(l => ({
    id: l.id,
    symbol: l.symbol,
    message: l.message,
    sentAt: l.sentAt,
  })))
}
