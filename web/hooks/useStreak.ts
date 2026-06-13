'use client'

import { useQuery } from '@tanstack/react-query'
import { StreakData } from '@/types'

export function useStreak() {
  return useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await fetch(`/api/streak?tz=${encodeURIComponent(tz)}`)
      if (!res.ok) throw new Error('Failed to fetch streak')
      return res.json()
    },
  })
}
