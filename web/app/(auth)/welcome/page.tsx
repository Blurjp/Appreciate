'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

    const result = await signIn('credentials', {
      email,
      password,
      name: isSignUp ? name : undefined,
      action: isSignUp ? 'signup' : 'signin',
      redirect: false,
    })

    if (result?.error) {
      setError(
        isSignUp
          ? 'Email already in use. Try signing in.'
          : 'Invalid email or password.'
      )
      setIsLoading(false)
    } else {
      router.push('/feed')
    }
  }

  const handleGuestSignIn = async () => {
    setIsLoading(true)
    const result = await signIn('guest', { redirect: false })
    if (result?.ok) {
      router.push('/feed')
    }
    setIsLoading(false)
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-[48px]">🙏</span>
            <h1 className="text-title text-brand-charcoal mt-2">Appreciate</h1>
            <p className="text-subheadline text-brand-medium-gray mt-1">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleCredentialAuth} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display Name"
                className="w-full px-4 py-3 bg-white rounded-ios-md text-body text-brand-charcoal placeholder:text-brand-medium-gray shadow-card focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white rounded-ios-md text-body text-brand-charcoal placeholder:text-brand-medium-gray shadow-card focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white rounded-ios-md text-body text-brand-charcoal placeholder:text-brand-medium-gray shadow-card focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
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
              className="w-full py-3.5 rounded-ios-md bg-gradient-primary text-white font-semibold text-headline transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading
                ? 'Loading...'
                : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="w-full text-center mt-3 text-subheadline text-brand-gold"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : 'New here? Create Account'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-light-gray" />
            <span className="text-caption text-brand-medium-gray">or</span>
            <div className="flex-1 h-px bg-brand-light-gray" />
          </div>

          <button
            onClick={handleGuestSignIn}
            disabled={isLoading}
            className="w-full py-3.5 rounded-ios-md border border-brand-light-gray text-headline text-brand-charcoal transition-transform active:scale-95 disabled:opacity-50"
          >
            Continue as Guest
          </button>

          <p className="text-center text-caption text-brand-medium-gray mt-6">
            Your privacy matters. Your private posts are never shared.
          </p>
        </div>
      </div>
    )
  }

  // Onboarding pages
  const page = ONBOARDING_PAGES[currentPage]

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center px-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm">
        {/* Animated emoji */}
        <span
          key={currentPage}
          className="text-[80px] animate-confetti"
        >
          {page.emoji}
        </span>

        <h1 className="text-title text-brand-charcoal mt-6 text-center">
          {page.title}
        </h1>
        <p className="text-body text-brand-medium-gray mt-3 text-center">
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
                ? 'w-6 bg-brand-gold'
                : 'bg-brand-light-gray'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm pb-12 space-y-3">
        {!isLastPage && currentPage > 0 && (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full text-center text-subheadline text-brand-medium-gray mb-2"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-ios-md bg-gradient-primary text-white font-semibold text-headline transition-transform active:scale-95"
        >
          {isLastPage ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  )
}
