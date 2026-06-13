'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const PRO_FEATURES = [
  { icon: '✦', text: 'AI-generated background images' },
  { icon: '✦', text: 'Unlimited card exports' },
  { icon: '✦', text: 'Priority support' },
]

export default function UpgradeModal({ onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start checkout')
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch {
      setError('Could not start checkout — please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-8 border border-brand-border shadow-2xl">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center">
          <svg className="w-7 h-7 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-widest uppercase text-brand-text-muted mb-1">Appreciate Pro</p>
          <h2 className="text-title-3 font-semibold text-brand-text-primary tracking-tight">Unlock AI features</h2>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {PRO_FEATURES.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-brand-primary text-xs">✦</span>
              <span className="text-body text-brand-text-primary">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-brand-border mb-6" />

        {/* Buttons */}
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold text-subheadline tracking-wide transition-all active:scale-[0.98] disabled:opacity-40 mb-3"
        >
          {isLoading ? 'Redirecting...' : 'Upgrade to Pro'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl border border-brand-border text-subheadline tracking-wide text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98]"
        >
          Maybe later
        </button>
        {error && (
          <p className="mt-3 text-center text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
