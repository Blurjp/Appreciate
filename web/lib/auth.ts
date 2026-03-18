import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// NextAuth configuration using Railway backend
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/welcome',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
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

        try {
          const endpoint = credentials.action === 'signup' ? '/auth/register' : '/auth/login'
          const body = credentials.action === 'signup'
            ? { email: credentials.email, password: credentials.password, name: credentials.name }
            : { email: credentials.email, password: credentials.password }

          const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || 'Authentication failed')
          }

          const data = await res.json()
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            accessToken: data.data.tokens.accessToken,
            refreshToken: data.data.tokens.refreshToken,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        try {
          const res = await fetch(`${API_URL}/auth/anonymous`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (!res.ok) {
            const errorText = await res.text()
            console.error('Anonymous auth failed:', res.status, errorText)
            throw new Error('Backend not available')
          }

          const data = await res.json()
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        } catch (error) {
          console.error('Guest auth error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).accessToken = token.accessToken as string
        (session.user as any).refreshToken = token.refreshToken as string
      }
      return session
    },
  },
}
