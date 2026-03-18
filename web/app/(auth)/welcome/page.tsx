'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'

const ONBOARDING_PAGES = [
  {
    title: 'Welcome to Appreciate',
    subtitle: 'Practice daily gratitude and spread positivity',
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
  const router = useRouter()

  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1

  const handleNext = () => {
    if (isLastPage) {
      setShowAuth(true)
    } else {
      setCurrentPage((p) => p + 1)
    }
  }

  const handleGuestSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('guest', {
        callbackUrl: '/feed',
        redirect: false,
      })
      
      if (result?.error) {
        console.error('Guest sign-in error:', result.error)
        alert('Failed to sign in as guest. Please try again.')
        setIsLoading(false)
      } else {
        router.push('/feed')
      }
    } catch (error) {
      console.error('Guest sign-in error:', error)
      alert('Failed to sign in as guest. Please try again.')
      setIsLoading(false)
    }
  }

  // Auth page
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
              Create your account
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

            {/* Guest Sign-in */}
            <button
              onClick={handleGuestSignIn}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl border border-brand-border text-subheadline tracking-wide text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? 'Loading...' : 'Continue as Guest'}
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center max-w-xs">
          <svg className="w-16 h-16 mx-auto mb-6 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={page.svgPath} />
          </svg>

          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-2">Simple Linear Design</p>
          <h1 className="text-title text-brand-text-primary tracking-tight mb-2">
            {page.title}
          </h1>
          <p className="text-subheadline text-brand-text-secondary">
            {page.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-12">
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold text-subheadline tracking-wide transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
