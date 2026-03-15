import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/welcome',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // Sign up
        if (credentials.action === 'signup') {
          const existing = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (existing) throw new Error('Email already in use')

          const hashedPassword = await bcrypt.hash(credentials.password, 10)
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              password: hashedPassword,
            },
          })
          await prisma.streakData.create({
            data: { userId: user.id },
          })
          return { id: user.id, email: user.email, name: user.name }
        }

        // Sign in
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        const guestId = `guest_${Date.now()}`
        const user = await prisma.user.create({
          data: {
            email: `${guestId}@guest.appreciate.app`,
            name: 'Guest User',
            isGuest: true,
          },
        })
        await prisma.streakData.create({
          data: { userId: user.id },
        })
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string
      }
      return session
    },
  },
}
