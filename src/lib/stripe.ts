import Stripe from 'stripe'
import { prisma } from './db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' })

export const PRO_MONTHLY_PRICE = process.env.STRIPE_PRICE_PRO_MONTHLY || ''

export async function createCheckoutSession(userId: string, email: string): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: 'subscription',
      line_items: [{ price: PRO_MONTHLY_PRICE, quantity: 1 }],
      metadata: { userId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })
    return session.url
  } catch (e) {
    console.error('Stripe checkout error:', e)
    return null
  }
}

export async function createPortalSession(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  })
  if (!user?.subscription?.stripeSubscriptionId) return null
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId || '',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
    return session.url
  } catch { return null }
}

export async function handleWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId) return
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: session.subscription as string,
          status: 'active',
          plan: 'pro',
          alertsLimit: 50,
          watchlistLimit: 10,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId,
          stripeSubscriptionId: session.subscription as string,
          status: 'active',
          plan: 'pro',
          alertsLimit: 50,
          watchlistLimit: 10,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      })
      if (session.customer) {
        await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: session.customer as string } })
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId
      if (!userId) {
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: sub.customer as string } })
        if (!user) return
      }
      const uid = userId || (await prisma.user.findFirst({ where: { stripeCustomerId: sub.customer as string } }))?.id
      if (!uid) return
      const status = sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : sub.status === 'canceled' ? 'canceled' : 'inactive'
      await prisma.subscription.update({
        where: { userId: uid },
        data: {
          status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          alertsLimit: status === 'active' ? 50 : 5,
          watchlistLimit: status === 'active' ? 10 : 3,
        }
      })
      break
    }
  }
}
