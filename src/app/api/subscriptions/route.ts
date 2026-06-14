import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createCheckoutSession, createPortalSession } from '@/lib/stripe'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(sub || { plan: 'free', status: 'inactive' })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (body.action === 'create-checkout') {
    const url = await createCheckoutSession(session.user.id, session.user.email)
    if (!url) return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    return NextResponse.json({ url })
  }
  if (body.action === 'create-portal') {
    const url = await createPortalSession(session.user.id)
    if (!url) return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    return NextResponse.json({ url })
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
