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
      <div className="mb-5">
        <h1 className="text-title text-brand-text-primary">
          Today&apos;s Feed
        </h1>
        <p className="text-subheadline text-brand-text-secondary mt-1">
          {formatDate(new Date())} — {todayCount} appreciation{todayCount !== 1 ? 's' : ''} today
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
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-accent-light flex items-center justify-center animate-pulse">
            <span className="text-[28px]">🙏</span>
          </div>
          <p className="text-subheadline text-brand-text-secondary mt-4">
            Loading appreciations...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-accent-light flex items-center justify-center">
            <span className="text-[36px]">🌱</span>
          </div>
          <p className="text-headline text-brand-text-primary mt-4">
            No appreciations yet
          </p>
          <p className="text-subheadline text-brand-text-secondary mt-2 max-w-xs mx-auto">
            {selectedCategory
              ? 'Try clearing the filter or be the first to post!'
              : 'Be the first to share your gratitude!'}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 text-subheadline text-brand-primary font-medium"
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
