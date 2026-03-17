'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import GoogleSignInButton from '@/components/GoogleSignInButton'

const ONBOARDING_PAGES = [
  {
    icon: '✨',
    title: 'Welcome to Appreciate',
    subtitle: 'Practice daily gratitude and spread positivity',
    bgColor: 'bg-brand-accent-light',
  },
  {
    icon: '📝',
    title: 'Write Daily Gratitude',
    subtitle: 'Reflect on what you\'re thankful for each day',
    bgColor: 'bg-brand-accent',
  },
  {
    icon: '🔥',
    title: 'Build Your Streak',
    subtitle: 'Stay consistent and grow your gratitude habit',
    bgColor: 'bg-brand-primary',
  },
  {
    icon: '🌍',
    title: 'Share or Stay Private',
    subtitle: 'Keep reflections private or inspire others',
    bgColor: 'bg-brand-accent-dark',
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
      // Use Supabase anonymous auth
      const { data, error: signInError } = await supabase.auth.signInAnonymously()

      if (signInError) {
        setIsLoading(false)
        setError(`Failed: ${signInError.message}`)
        return
      }

      if (data?.user) {
        // Create user record in database
        const { error: dbError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email || `guest_${data.user.id.slice(0, 8)}@appreciate.app`,
            name: `Guest_${data.user.id.slice(0, 4)}`,
            created_at: new Date().toISOString(),
          })

        if (dbError && dbError.code !== '23505') { // Ignore duplicate key errors
          console.error('Failed to create user record:', dbError)
        }

        router.push('/feed')
      } else {
        setIsLoading(false)
        setError('Unexpected response. Please try again.')
      }
    } catch (err) {
      setIsLoading(false)
      setError(`Error: ${(err as Error).message}`)
    }
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-primary flex items-center justify-center mb-4 shadow-lg">
              <span className="text-[40px]">🙏</span>
            </div>
            <h1 className="text-title text-brand-text-primary">Appreciate</h1>
            <p className="text-subheadline text-brand-text-secondary mt-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-brand-card rounded-2xl shadow-card p-6 border border-brand-border">
            {/* Google Sign-in */}
            <GoogleSignInButton />

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-border" />
              <span className="text-caption text-brand-text-muted">or</span>
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
                  className="w-full px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
                  required
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
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
                className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold text-headline transition-all active:scale-[0.98] disabled:opacity-50 shadow-button"
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
              className="w-full text-center mt-4 text-subheadline text-brand-primary font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : 'New here? Create Account'}
            </button>
          </div>

          {/* Guest Option */}
          <div className="mt-6">
            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl border-2 border-brand-border text-headline text-brand-text-primary transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Continue as Guest
            </button>
          </div>

          <p className="text-center text-caption text-brand-text-secondary mt-6">
            Your privacy matters. Private posts are never shared.
          </p>
        </div>
      </div>
    )
  }

  // Onboarding pages
  const page = ONBOARDING_PAGES[currentPage]

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Skip Button */}
      {currentPage > 0 && (
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setShowAuth(true)}
            className="text-subheadline text-brand-text-secondary font-medium"
          >
            Skip
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon Container */}
        <div
          key={currentPage}
          className={`w-32 h-32 rounded-3xl ${page.bgColor} flex items-center justify-center mb-8 shadow-lg animate-fade-in`}
        >
          <span className="text-[56px]">{page.icon}</span>
        </div>

        {/* Text Content */}
        <h1 className="text-title text-brand-text-primary text-center mb-3">
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
              className={`h-2 rounded-full transition-all ${
                i === currentPage
                  ? 'w-8 bg-brand-primary'
                  : 'w-2 bg-brand-border'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-brand-primary text-white font-semibold text-headline transition-all active:scale-[0.98] shadow-button"
        >
          {isLastPage ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
