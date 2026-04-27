import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TreeClient from './TreeClient'

interface Props {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  const name = profile?.name || 'Someone'
  return {
    title: `${name}'s Gratitude Tree — Appreciate`,
    description: `Watch ${name}'s gratitude grow into a beautiful tree. Each leaf is a moment of appreciation.`,
    openGraph: {
      title: `${name}'s Gratitude Tree`,
      description: `A living tree of gratitude — every leaf is a moment of appreciation.`,
      siteName: 'Appreciate',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}'s Gratitude Tree`,
      description: `A living tree of gratitude — every leaf is a moment of appreciation.`,
    },
  }
}

export default async function TreePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-cream-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-warm-cream-300 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warm-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-2.686-9-6v-3c0-3.314 4.03-6 9-6s9 2.686 9 6v3c0 3.314-4.03 6-9 6z" />
            </svg>
          </div>
          <h2 className="text-title-3 text-warm-ink-500 mb-2">Tree not found</h2>
          <p className="text-subheadline text-warm-ink-300">This gratitude tree doesn't exist yet.</p>
        </div>
      </div>
    )
  }

  const { data: posts } = await supabase
    .from('gratitude_posts')
    .select('id, content, feeling, category, visibility, photo_url, created_at, heart_count')
    .eq('author_id', userId)
    .in('visibility', ['PUBLIC', 'ANONYMOUS'])
    .order('created_at', { ascending: true })

  const { data: streak } = await supabase
    .from('streak_data')
    .select('current_streak, longest_streak, total_posts')
    .eq('user_id', userId)
    .single()

  const totalHearts = (posts || []).reduce((sum: number, p: any) => sum + (p.heart_count || 0), 0)

  return (
    <TreeClient
      user={{
        id: profile.id,
        name: profile.name,
        avatarUrl: profile.avatar_url,
      }}
      posts={(posts || []).map((p: any) => ({
        id: p.id,
        content: p.content,
        feeling: p.feeling,
        category: p.category,
        createdAt: p.created_at,
        heartCount: p.heart_count || 0,
      }))}
      stats={{
        totalPosts: posts?.length || 0,
        totalHearts,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
      }}
    />
  )
}
