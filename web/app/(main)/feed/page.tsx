import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { fetchPosts } from '@/lib/db/posts'
import { formatDate } from '@/lib/utils'
import { FeedClient, FeedHeader } from './feed-client'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initialPosts = await fetchPosts(supabase, { limit: 50, userId: user?.id })

  return (
    <div className="px-4 pt-5">
      <FeedHeader initialPosts={initialPosts} />

      <GratitudeSkyPanel posts={initialPosts} />

      <Suspense fallback={<FeedSkeleton />}>
        <FeedClient initialPosts={initialPosts} />
      </Suspense>
    </div>
  )
}

function GratitudeSkyPanel({
  posts,
}: {
  posts: Awaited<ReturnType<typeof fetchPosts>>
}) {
  const featured = posts[0]

  return (
    <section className="concept-panel mb-5 min-h-[245px] p-6 text-brand-text-primary overflow-hidden"
      style={{ background: 'var(--theme-page-bg)' }}
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_12%_20%,var(--color-brand-accent-light),transparent_34%),radial-gradient(circle_at_86%_28%,var(--color-brand-accent-light),transparent_28%),radial-gradient(circle_at_48%_74%,var(--color-brand-surface),transparent_34%)]" />
      <div className="absolute inset-0 z-0 opacity-50">
        <svg className="h-full w-full" viewBox="0 0 760 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M75 205 C185 90 270 265 390 148 S555 42 685 112" fill="none" stroke="var(--color-brand-border)" strokeWidth="2" />
          <path d="M130 92 C230 160 320 102 420 128 S570 218 660 78" fill="none" stroke="var(--color-brand-border)" strokeWidth="2" />
        </svg>
      </div>
      <div className="relative z-10 max-w-[360px]">
        <p className="text-[10px] font-medium uppercase text-brand-text-muted">My Gratitude Sky</p>
        <h2 className="mt-3 text-[32px] font-light leading-tight text-brand-text-primary sm:text-[40px]">
          Every small note becomes a point of light.
        </h2>
      </div>
      <div className="absolute bottom-5 right-5 z-10 rounded-2xl border border-brand-border bg-brand-card/80 px-5 py-4 shadow-xl backdrop-blur-xl">
        <p className="text-[10px] font-medium uppercase text-brand-text-muted">Latest moment</p>
        <p className="mt-2 max-w-[230px] text-sm leading-5 text-brand-text-secondary">
          {featured?.content || 'Share one thing you noticed today.'}
        </p>
      </div>
      <div className="absolute bottom-5 left-6 z-10 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-2xl shadow-warm backdrop-blur-xl text-brand-primary">
          +
        </span>
        <span className="text-sm text-brand-text-secondary">New lights today</span>
      </div>
    </section>
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
