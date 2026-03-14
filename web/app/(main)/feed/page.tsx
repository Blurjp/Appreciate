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
      return res.json()
    },
  })

  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartIncrement: true }),
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
      <div className="mb-4">
        <h1 className="text-title text-brand-charcoal flex items-center gap-2">
          🌟 Today&apos;s Appreciation Feed
        </h1>
        <p className="text-subheadline text-brand-medium-gray mt-1">
          {formatDate(new Date())} — {todayCount} appreciation
          {todayCount !== 1 ? 's' : ''} today
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-5">
        <CategoryFilterBar
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Section header */}
      <h2 className="text-title-3 text-brand-charcoal mb-3">
        🏆 Trending Appreciations
      </h2>

      {/* Posts */}
      {isLoading ? (
        <div className="text-center py-12">
          <span className="text-[32px] animate-pulse">🙏</span>
          <p className="text-subheadline text-brand-medium-gray mt-2">
            Loading...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-[48px]">🌱</span>
          <p className="text-headline text-brand-charcoal mt-3">
            No appreciations yet
          </p>
          <p className="text-subheadline text-brand-medium-gray mt-1">
            {selectedCategory
              ? 'Try clearing the filter or be the first to post!'
              : 'Be the first to share your gratitude!'}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-3 text-subheadline text-brand-gold"
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
