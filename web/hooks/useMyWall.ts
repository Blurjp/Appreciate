'use client'

import { useQuery } from '@tanstack/react-query'
import { GratitudePost } from '@/types'

export function useMyWall(visibility?: string) {
  return useQuery<GratitudePost[]>({
    queryKey: ['my-wall', visibility],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (visibility) params.set('visibility', visibility)
      const res = await fetch(`/api/my-wall?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch my wall')
      return res.json()
    },
  })
}
