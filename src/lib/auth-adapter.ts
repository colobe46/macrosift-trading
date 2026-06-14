import type { Adapter } from 'next-auth/adapters'
import { prisma } from './db'

export const PrismaAdapter: Adapter = {
  createUser: async (data: Record<string, any>) => {
    const user = await prisma.user.create({ data: { email: data.email!, name: data.name, image: data.image } })
    await prisma.subscription.create({ data: { userId: user.id } })
    return { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null }
  },
  getUser: async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null }
  },
  getUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null }
  },
  getUserByAccount: async (query: Record<string, any>) => {
    const account = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: query.provider, providerAccountId: query.providerAccountId } },
      include: { user: true },
    })
    if (!account) return null
    const { user } = account
    return { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null }
  },
  updateUser: async (data: Record<string, any>) => {
    const { id, ...rest } = data
    const user = await prisma.user.update({ where: { id }, data: rest })
    return { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null }
  },
  deleteUser: async (id: string) => {
    await prisma.user.delete({ where: { id } })
  },
  linkAccount: async (data: Record<string, any>) => {
    await prisma.account.create({ data: { userId: data.userId, type: data.type, provider: data.provider, providerAccountId: data.providerAccountId, refresh_token: data.refresh_token, access_token: data.access_token, expires_at: data.expires_at, token_type: data.token_type, scope: data.scope, id_token: data.id_token, session_state: data.session_state } })
  },
  unlinkAccount: async (query: Record<string, any>) => {
    await prisma.account.delete({ where: { provider_providerAccountId: { provider: query.provider, providerAccountId: query.providerAccountId } } })
  },
  createSession: async (data: Record<string, any>) => {
    const session = await prisma.session.create({ data: { sessionToken: data.sessionToken, userId: data.userId, expires: data.expires } })
    return { sessionToken: session.sessionToken, userId: session.userId, expires: session.expires }
  },
  getSessionAndUser: async (sessionToken: string) => {
    const session = await prisma.session.findUnique({ where: { sessionToken }, include: { user: true } })
    if (!session) return null
    const { user } = session
    return {
      session: { sessionToken: session.sessionToken, userId: session.userId, expires: session.expires },
      user: { id: user.id, email: user.email!, name: user.name, image: user.image, emailVerified: null },
    }
  },
  updateSession: async (data: Record<string, any>) => {
    const session = await prisma.session.update({ where: { sessionToken: data.sessionToken }, data: { expires: data.expires } })
    return { sessionToken: session.sessionToken, userId: session.userId, expires: session.expires }
  },
  deleteSession: async (sessionToken: string) => {
    await prisma.session.delete({ where: { sessionToken } })
  },
  createVerificationToken: async (data: Record<string, any>) => {
    const token = await prisma.verificationToken.create({ data: { identifier: data.identifier, token: data.token, expires: data.expires } })
    return { identifier: token.identifier, token: token.token, expires: token.expires }
  },
  useVerificationToken: async (query: Record<string, any>) => {
    try {
      const vt = await prisma.verificationToken.delete({ where: { identifier_token: { identifier: query.identifier, token: query.token } } })
      return { identifier: vt.identifier, token: vt.token, expires: vt.expires }
    } catch {
      return null
    }
  },
}
