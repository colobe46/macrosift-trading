import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@/lib/auth-adapter'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
        const sub = await prisma.subscription.findUnique({ where: { userId: user.id } })
        session.user.plan = sub?.plan || 'free'
        session.user.alertsLimit = sub?.alertsLimit || 5
        session.user.watchlistLimit = sub?.watchlistLimit || 2
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
