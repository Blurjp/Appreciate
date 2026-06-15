'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudePost } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import GratitudePostCard from '@/components/GratitudePostCard'

interface FeedClientProps {
  initialPosts: GratitudePost[]
}

function useTodayCount(posts: GratitudePost[]) {
  return posts.filter((p) => {
    const postDate = new Date(p.createdAt)
    const today = new Date()
    return postDate.toDateString() === today.toDateString()
  }).length
}

export function FeedHeader({ initialPosts }: { initialPosts: GratitudePost[] }) {
  const { data: posts = initialPosts } = useQuery<GratitudePost[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    initialData: initialPosts,
    staleTime: 30_000,
  })
  const todayCount = useTodayCount(posts)

  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[10px] uppercase text-brand-text-muted">{formatDate(new Date())}</p>
        <h1 className="text-title text-brand-text-primary">Gratitude Sky</h1>
      </div>
      <div className="glass-chip rounded-2xl px-4 py-3 text-right">
        <p className="text-2xl font-semibold leading-none text-brand-text-primary">{todayCount}</p>
        <p className="mt-1 text-[10px] font-medium uppercase text-brand-text-muted">today</p>
      </div>
    </div>
  )
}

export function FeedClient({ initialPosts }: FeedClientProps) {
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading, refetch } = useQuery<GratitudePost[]>({
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

  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: async () => { await refetch() },
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
    onMutate: async (postId: string) => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10)
      await queryClient.cancelQueries({ queryKey: ['feed'] })
      const prev = queryClient.getQueryData<GratitudePost[]>(['feed'])
      queryClient.setQueryData<GratitudePost[]>(['feed'], (old) =>
        (old ?? []).map((p) => {
          if (p.id !== postId) return p
          const wasHearted = p.isHeartedByMe ?? false
          return {
            ...p,
            isHeartedByMe: !wasHearted,
            heartCount: Math.max(0, p.heartCount + (wasHearted ? -1 : 1)),
          }
        })
      )
      return { prev }
    },
    onError: (_err, _postId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['feed'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  if (isLoading && posts.length === 0) {
    return null
  }

  return (
    <>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center py-2 transition-opacity"
          style={{ height: isRefreshing ? 40 : pullDistance, opacity: progress }}
        >
          <svg
            className={cn('h-5 w-5 text-brand-text-muted', isRefreshing && 'animate-spin')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      )}
      {posts.length === 0 ? (
        <div className="concept-panel px-6 py-16 text-center" style={{ background: 'var(--theme-page-bg)' }}>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-brand-border bg-brand-surface shadow-warm">
            <svg className="w-9 h-9 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="text-headline text-brand-text-primary">No appreciations yet</p>
          <p className="text-subheadline text-brand-text-secondary mt-2 max-w-xs mx-auto mb-5">
            Be the first to share your gratitude with the community.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-subheadline font-semibold text-white transition-all active:scale-95"
          >
            Share your gratitude
          </a>
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
