'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudePost } from '@/types'
import GratitudePostCard from '@/components/GratitudePostCard'

interface FeedClientProps {
  initialPosts: GratitudePost[]
}

export function FeedClient({ initialPosts }: FeedClientProps) {
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading } = useQuery<GratitudePost[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    initialData: initialPosts,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartToggle: true }),
      })
      if (!res.ok) throw new Error('Failed to toggle heart')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  if (isLoading && posts.length === 0) {
    return null
  }

  return (
    <>
      {posts.length === 0 ? (
        <div className="concept-panel px-6 py-14 text-center">
          <svg className="w-16 h-16 mx-auto text-brand-border mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-headline text-brand-text-primary">No appreciations yet</p>
          <p className="text-subheadline text-brand-text-secondary mt-2 max-w-xs mx-auto">
            Be the first to share your gratitude!
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {posts.map((post) => (
            <GratitudePostCard
              key={post.id}
              post={post}
              onHeart={(id) => heartMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
