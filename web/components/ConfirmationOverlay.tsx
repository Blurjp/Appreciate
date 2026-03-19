'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  isVisible: boolean
  onDismiss: () => void
  onCreateCard?: () => void
  content?: string
  feeling?: string
}

export default function ConfirmationOverlay({
  message,
  isVisible,
  onDismiss,
  onCreateCard,
}: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(() => setShow(true))
    } else {
      setShow(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-brand-card rounded-2xl p-8 mx-6 max-w-sm w-full text-center shadow-2xl border border-brand-border transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Animated heart icon */}
        <div
          className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center transition-all duration-700 ${
            show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <svg className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Message */}
        <p className="text-title-3 font-semibold text-brand-text-primary mb-6 tracking-tight">{message}</p>

        {/* Create Card Button */}
        {onCreateCard && (
          <button
            onClick={onCreateCard}
            className="w-full py-3.5 rounded-xl border border-brand-border text-brand-text-primary font-semibold text-subheadline tracking-wide transition-all active:scale-[0.98] hover:border-brand-primary hover:text-brand-primary mb-3 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Create Beautiful Card
          </button>
        )}

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold text-subheadline tracking-wide transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
