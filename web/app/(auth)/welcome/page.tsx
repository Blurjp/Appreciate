'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'

const ONBOARDING_PAGES = [
  {
    title: 'Welcome to Appreciate',
    subtitle: 'Practice daily gratitude and spread positivity',
    // heart with rays
    svgPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z M12 2v1M12 21v1M4.22 4.22l.7.7M19.08 19.08l.7.7M2 12h1M21 12h1M4.22 19.78l.7-.7M19.08 4.92l.7-.7',
  },
  {
    title: 'Write Daily Gratitude',
    subtitle: 'Reflect on what you\'re thankful for each day',
    svgPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    title: 'Build Your Streak',
    subtitle: 'Stay consistent and grow your gratitude habit',
    svgPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z M9 12l2 2 4-4',
  },
  {
    title: 'Share or Stay Private',
    subtitle: 'Keep reflections private or inspire others',
    svgPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z M8 12h8',
  },
]

export default function WelcomePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1

  const handleNext = () => {
    if (isLastPage) {
      setShowAuth(true)
    } else {
      setCurrentPage((p) => p + 1)
    }
  }

  const handleCredentialAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        })

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Email already in use. Try signing in.')
          } else {
            setError(signUpError.message)
          }
          setIsLoading(false)
          return
        }

        if (data.session) {
          router.push('/feed')
        } else {
          setError('Check your email to confirm your account!')
          setIsLoading(false)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('Invalid email or password.')
          setIsLoading(false)
          return
        }

        router.push('/feed')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError) {
        setError('Guest sign-in failed. Please try again.')
        setIsLoading(false)
        return
      }
      router.push('/feed')
    } catch (err) {
      setIsLoading(false)
      setError(`Error: ${(err as Error).message}`)
    }
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo Header */}
          <div className="text-center mb-10">
            <svg className="w-12 h-12 mx-auto mb-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Simple Linear Design</p>
            <h1 className="text-title text-brand-text-primary tracking-tight">Appreciate</h1>
            <p className="text-subheadline text-brand-text-secondary mt-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="p-6 border border-brand-border rounded-2xl">
            {/* Google Sign-in */}
            <GoogleSignInButton />

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-border" />
              <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">or</span>
              <div className="flex-1 h-px bg-brand-border" />
            </div>

            {/* Email/Password Form */}
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
                <p className="text-caption text-red-500 text-center py-1">
                  {error}
                </p>
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

          {/* Guest Option */}
          <div className="mt-4">
            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl border border-brand-border text-subheadline tracking-wide text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Continue as Guest
            </button>
          </div>

          <p className="text-center text-[10px] tracking-widest uppercase text-brand-text-muted mt-6">
            Private posts are never shared
          </p>
        </div>
      </div>
    )
  }

  // Onboarding pages
  const page = ONBOARDING_PAGES[currentPage]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip Button */}
      {currentPage > 0 && (
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setShowAuth(true)}
            className="text-[10px] tracking-widest uppercase text-brand-text-muted hover:text-brand-primary transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div key={currentPage} className="w-32 h-32 flex items-center justify-center mb-10 animate-fade-in">
          <svg className="w-24 h-24 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d={page.svgPath} />
          </svg>
        </div>

        {/* Text Content */}
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-2">Simple Linear Design</p>
        <h1 className="text-title text-brand-text-primary text-center mb-3 tracking-tight">
          {page.title}
        </h1>
        <p className="text-body text-brand-text-secondary text-center max-w-xs">
          {page.subtitle}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="px-8 pb-12">
        {/* Page Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_PAGES.map((_, i) => (
            <div
              key={i}
              className={`h-px transition-all ${
                i === currentPage ? 'w-8 bg-brand-primary' : 'w-4 bg-brand-border'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-brand-primary text-white font-semibold text-subheadline tracking-widest uppercase transition-all active:scale-[0.98]"
        >
          {isLastPage ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
