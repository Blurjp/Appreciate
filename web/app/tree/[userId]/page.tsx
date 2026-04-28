import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SkyClient from './SkyClient'

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
    title: `${name}'s Gratitude Sky — Appreciate`,
    description: `${name}'s constellation of gratitude. Every star is a moment of appreciation, forming constellations in the night sky.`,
    openGraph: {
      title: `${name}'s Gratitude Sky`,
      description: `A constellation of gratitude — every star is a moment of appreciation.`,
      siteName: 'Appreciate',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}'s Gratitude Sky`,
      description: `A constellation of gratitude — every star is a moment of appreciation.`,
    },
  }
}

export default async function SkyPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, created_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1040 50%, #0d0d30 100%)' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <svg className="w-8 h-8 text-indigo-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h2 className="text-title-3 text-indigo-200/60 mb-2">Sky not found</h2>
          <p className="text-subheadline text-indigo-300/40">This gratitude sky doesn't exist yet.</p>
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
    <SkyClient
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
