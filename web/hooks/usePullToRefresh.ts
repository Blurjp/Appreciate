'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  enabled?: boolean
}

export function usePullToRefresh({ onRefresh, threshold = 70, enabled = true }: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return
      startY.current = e.touches[0].clientY
      pulling.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current || isRefreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0) {
        setPullDistance(Math.min(delta * 0.4, threshold * 1.5))
      }
    }

    const handleTouchEnd = async () => {
      if (!pulling.current) return
      pulling.current = false
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        setPullDistance(threshold)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, isRefreshing, onRefresh, pullDistance, threshold])

  const progress = Math.min(1, pullDistance / threshold)

  return { pullDistance, isRefreshing, progress }
}
