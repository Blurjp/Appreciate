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
        {/* Animated heart circle */}
        <div
          className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-primary flex items-center justify-center transition-all duration-700 ${
            show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="text-[36px]">❤️</span>
        </div>

        {/* Message */}
        <p className="text-title-2 text-brand-text-primary mb-6 font-semibold">{message}</p>

        {/* Create Card Button */}
        {onCreateCard && (
          <button
            onClick={onCreateCard}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-headline transition-all active:scale-[0.98] mb-3 flex items-center justify-center gap-2"
          >
            <span className="text-xl">✨</span>
            Create Beautiful Card
          </button>
        )}

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="w-full py-4 rounded-xl bg-brand-primary text-white font-semibold text-headline transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
