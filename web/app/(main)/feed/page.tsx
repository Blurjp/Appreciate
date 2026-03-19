'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudeCategory, GratitudePost } from '@/types'
import { formatDate } from '@/lib/utils'
import GratitudePostCard from '@/components/GratitudePostCard'
import CategoryFilterBar from '@/components/CategoryFilterBar'

export default function FeedPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<GratitudeCategory | null>(null)
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading } = useQuery<GratitudePost[]>({
    queryKey: ['feed', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartToggle: true }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const todayCount = posts.filter((p) => {
    const postDate = new Date(p.createdAt)
    const today = new Date()
    return postDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">{formatDate(new Date())}</p>
        <h1 className="text-title text-brand-text-primary tracking-tight">Today&apos;s Feed</h1>
        <p className="text-subheadline text-brand-text-secondary mt-1">
          {todayCount} appreciation{todayCount !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-5">
        <CategoryFilterBar
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="text-center py-16">
          <svg className="w-10 h-10 mx-auto text-brand-border animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-brand-border mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-headline text-brand-text-primary">No appreciations yet</p>
          <p className="text-subheadline text-brand-text-secondary mt-2 max-w-xs mx-auto">
            {selectedCategory ? 'Try clearing the filter or be the first to post!' : 'Be the first to share your gratitude!'}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 text-[10px] tracking-widest uppercase text-brand-text-muted hover:text-brand-primary transition-colors"
            >
              Clear filter
            </button>
          )}
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
    </div>
  )
}
