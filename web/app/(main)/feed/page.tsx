import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { fetchPosts } from '@/lib/db/posts'
import { FeedClient, FeedHeader } from './feed-client'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initialPosts = await fetchPosts(supabase, { limit: 50, userId: user?.id })

  return (
    <div className="px-4 pt-5">
      <FeedHeader initialPosts={initialPosts} />

      <Suspense fallback={<FeedSkeleton />}>
        <FeedClient initialPosts={initialPosts} />
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
