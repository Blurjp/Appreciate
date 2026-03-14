'use client'

import { useEffect } from 'react'

interface Props {
  message: string
  icon?: string
  isError?: boolean
  isVisible: boolean
  onDismiss: () => void
}

export default function Toast({
  message,
  icon = '✓',
  isError = false,
  isVisible,
  onDismiss,
}: Props) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onDismiss, 2500)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-ios-md shadow-lg text-white text-headline ${
          isError ? 'bg-red-500' : 'bg-brand-charcoal'
        }`}
      >
        <span>{icon}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
