'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { normalizeInternalPath } from '@/lib/utils'

export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomePageSkeleton />}>
      <WelcomePageContent />
    </Suspense>
  )
}

function WelcomePageContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const nextPath = normalizeInternalPath(searchParams.get('next'), '/feed')
  const source = searchParams.get('from')

  const handleCredentialAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })

        if (signUpError) {
          setError(signUpError.message.includes('already registered')
            ? 'Email already in use. Try signing in.'
            : signUpError.message)
          setIsLoading(false)
          return
        }

        if (data.session) {
          router.push(nextPath)
        } else {
          setError('Check your email to confirm your account!')
          setIsLoading(false)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
          setError('Invalid email or password.')
          setIsLoading(false)
          return
        }

        router.push(nextPath)
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo Header */}
        <div className="text-center mb-10">
          <svg className="w-12 h-12 mx-auto mb-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h1 className="text-title text-brand-text-primary tracking-tight">Appreciate</h1>
          <p className="text-subheadline text-brand-text-secondary mt-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 border border-brand-border rounded-2xl">
          <GoogleSignInButton redirectTo={`/auth/callback?next=${encodeURIComponent(nextPath)}`} />

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">or</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          <form onSubmit={handleCredentialAuth} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display Name"
                className="w-full px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
              required
              minLength={6}
            />

            {error && (
              <p className="text-caption text-red-500 text-center py-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold text-subheadline tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="w-full text-center mt-4 text-caption tracking-wide text-brand-text-muted hover:text-brand-primary transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
          </button>
        </div>

        <p className="text-center text-[10px] tracking-widest uppercase text-brand-text-muted mt-6">
          {source === 'share' ? 'You came from a shared gratitude link' : 'Private posts are never shared'}
        </p>

        <p className="text-center text-[10px] text-brand-text-muted mt-4">
          By continuing you agree to our{' '}
          <a href="/terms" className="underline underline-offset-2 hover:text-brand-primary transition-colors">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="underline underline-offset-2 hover:text-brand-primary transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

function WelcomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <svg className="w-12 h-12 mx-auto mb-4 text-brand-border animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div className="h-8 bg-gray-100 rounded-xl w-32 mx-auto mb-3" />
          <div className="h-4 bg-gray-100 rounded-xl w-40 mx-auto" />
        </div>
        <div className="p-6 border border-brand-border rounded-2xl space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-px bg-brand-border my-5" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
