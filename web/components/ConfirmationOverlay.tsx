'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  isVisible: boolean
  onDismiss: () => void
}

export default function ConfirmationOverlay({
  message,
  isVisible,
  onDismiss,
}: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Trigger entrance animation
      requestAnimationFrame(() => setShow(true))
    } else {
      setShow(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-white rounded-ios-xl p-8 mx-6 max-w-sm w-full text-center shadow-2xl transition-all duration-500 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Animated heart circle */}
        <div
          className={`w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-primary flex items-center justify-center transition-all duration-700 ${
            show ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="text-[36px]">❤️</span>
        </div>

        {/* Message */}
        <p className="text-title-2 text-brand-charcoal mb-6">{message}</p>

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-ios-md bg-gradient-primary text-white font-semibold text-headline transition-transform active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
