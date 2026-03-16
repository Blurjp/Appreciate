'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import GoogleSignInButton from '@/components/GoogleSignInButton'

const ONBOARDING_PAGES = [
  {
    emoji: '🙏',
    title: 'Welcome to Appreciate',
    subtitle: 'A place to practice gratitude and spread positivity',
  },
  {
    emoji: '📝',
    title: 'Write Daily Gratitude',
    subtitle: 'Take a moment each day to reflect on what you\'re thankful for',
  },
  {
    emoji: '🔥',
    title: 'Build Your Streak',
    subtitle: 'Stay consistent and watch your gratitude habit grow',
  },
  {
    emoji: '🔒',
    title: 'Share or Stay Private',
    subtitle: 'Keep your reflections private, or inspire others by sharing',
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
        // Sign up with email and password
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

        // If email confirmation is disabled, user is logged in automatically
        if (data.session) {
          router.push('/feed')
        } else {
          setError('Check your email to confirm your account!')
          setIsLoading(false)
        }
      } else {
        // Sign in with email and password
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

    console.log('Starting guest sign in...')

    try {
      const result = await signIn('guest', { redirect: false })

      console.log('Sign in result:', result)

      if (result?.error) {
        console.error('Guest sign in error:', result.error)
        setIsLoading(false)
        setError(`Failed: ${result.error}`)
      } else if (result?.ok) {
        console.log('Guest sign in successful, redirecting...')
        router.push('/feed')
      } else {
        console.log('Sign in result:', result)
        setIsLoading(false)
        setError('Unexpected response. Please try again.')
      }
    } catch (err) {
      console.error('Guest sign in error:', err)
      setIsLoading(false)
      setError(`Error: ${(err as Error).message}`)
    }
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-[48px]">🙏</span>
            <h1 className="text-title text-brand-text-primary mt-2">Appreciate</h1>
            <p className="text-subheadline text-brand-text-secondary mt-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Google Sign-in Button */}
          <GoogleSignInButton />

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-caption text-brand-text-muted">or</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleCredentialAuth} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display Name"
                className="w-full px-4 py-3 bg-white rounded-md text-body text-brand-text-primary placeholder:text-brand-text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-brand-accent/50 border border-brand-border"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white rounded-md text-body text-brand-text-primary placeholder:text-brand-text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-brand-accent/50 border border-brand-border"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full px-4 py-3 bg-white rounded-md text-body text-brand-text-primary placeholder:text-brand-text-muted shadow-card focus:outline-none focus:ring-2 focus:ring-brand-accent/50 border border-brand-border"
              required
              minLength={6}
            />

            {error && (
              <p className="text-subheadline text-red-500 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-md bg-gradient-primary text-white font-semibold text-headline transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading
                ? 'Loading...'
                : isSignUp
                ? 'Sign Up with Email'
                : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="w-full text-center mt-3 text-subheadline text-brand-accent"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : 'New here? Create Account'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-caption text-brand-text-muted">or</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full py-3.5 rounded-md border border-brand-border text-headline text-brand-text-primary transition-transform active:scale-95 disabled:opacity-50"
          >
            Continue as Guest
          </button>

          <p className="text-center text-caption text-brand-text-secondary mt-6">
            Your privacy matters. Your private posts are never shared.
          </p>
        </div>
      </div>
    )
  }

  // Onboarding pages
  const page = ONBOARDING_PAGES[currentPage]

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center px-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        {/* Animated emoji */}
        <span
          key={currentPage}
          className="text-[80px] animate-confetti"
        >
          {page.emoji}
        </span>

        <h1 className="text-title text-brand-text-primary mt-6 text-center">
          {page.title}
        </h1>
        <p className="text-body text-brand-text-secondary mt-3 text-center">
          {page.subtitle}
        </p>
      </div>

      {/* Page dots */}
      <div className="flex gap-2 mb-6">
        {ONBOARDING_PAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPage
                ? 'w-6 bg-brand-accent'
                : 'bg-brand-border'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm pb-12 space-y-3">
        {!isLastPage && currentPage > 0 && (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full text-center text-subheadline text-brand-text-secondary mb-2"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-md bg-gradient-primary text-white font-semibold text-headline transition-transform active:scale-95"
        >
          {isLastPage ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  )
}
