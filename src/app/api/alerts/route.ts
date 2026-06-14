import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const limit = sub?.alertsLimit || 5
  const count = await prisma.alert.count({ where: { userId: session.user.id } })
  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ alerts, used: count, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { symbol, type, operator, value, channel } = body
  if (!symbol || !type || !operator || value === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const limit = sub?.alertsLimit || 5
  const count = await prisma.alert.count({ where: { userId: session.user.id } })
  if (count >= limit) return NextResponse.json({ error: `Alert limit (${limit}) reached. Upgrade to Pro.` }, { status: 403 })
  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      type,
      condition: { type, operator, value },
      channel: channel || 'telegram',
    },
  })
  return NextResponse.json(alert)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, enabled } = body
  const alert = await prisma.alert.findFirst({ where: { id, userId: session.user.id } })
  if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.alert.update({ where: { id }, data: { enabled } })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id } = body
  const alert = await prisma.alert.findFirst({ where: { id, userId: session.user.id } })
  if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.alert.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
