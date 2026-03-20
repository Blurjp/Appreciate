import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { fetchPosts } from '@/lib/db/posts'
import { formatDate } from '@/lib/utils'
import { FeedClient } from './feed-client'

interface FeedPageProps {
  searchParams: { category?: string }
}

// Server Component - fetches initial data on the server
export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = createClient()
  const category = searchParams.category

  // Fetch initial posts on the server for instant display
  const initialPosts = await fetchPosts(supabase, {
    category,
    limit: 50,
  })

  const todayCount = initialPosts.filter((p) => {
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

      {/* Client Component for interactions */}
      <Suspense fallback={<FeedSkeleton />}>
        <FeedClient initialPosts={initialPosts} initialCategory={category} />
      </Suspense>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 pb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-brand-card rounded-2xl p-5 border border-brand-border animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-border" />
            <div className="flex-1">
              <div className="h-4 bg-brand-border rounded w-24 mb-2" />
              <div className="h-3 bg-brand-border rounded w-16" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-brand-border rounded w-full" />
            <div className="h-4 bg-brand-border rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
