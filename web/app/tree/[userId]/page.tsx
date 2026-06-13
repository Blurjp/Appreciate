import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SkyClient from './SkyClient'
import TreeClient from './TreeClient'
import ZenClient from './ZenClient'
import PolaroidClient from './PolaroidClient'
import StickyNotesClient from './StickyNotesClient'

interface Props {
  params: Promise<{ userId: string }>
}

const THEME_NAMES: Record<string, string> = {
  starry: 'Gratitude Sky',
  tree: 'Gratitude Tree',
  zen: 'Zen Garden',
  polaroid: 'Polaroid Gallery',
  glass: 'Sticky Notes',
  'sticky-notes': 'Sticky Notes',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, wall_theme')
    .eq('id', userId)
    .single()

  const name = profile?.name || 'Someone'
  const theme = profile?.wall_theme || 'starry'
  const themeName = THEME_NAMES[theme] || 'Gratitude Wall'
  return {
    title: `${name}'s ${themeName} — Appreciate`,
    description: `${name}'s ${themeName.toLowerCase()}. Every moment of gratitude, beautifully visualized.`,
    openGraph: {
      title: `${name}'s ${themeName}`,
      description: `A living collection of gratitude — beautifully visualized.`,
      siteName: 'Appreciate',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}'s ${themeName}`,
      description: `A living collection of gratitude — beautifully visualized.`,
    },
  }
}

export default async function VisualizationPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  // Check if current viewer is the owner
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, created_at, wall_theme')
    .eq('id', userId)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6EE 0%, #F5EFE3 100%)' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-warm-cream-300 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warm-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h2 className="text-title-3 text-warm-ink-500 mb-2">Wall not found</h2>
          <p className="text-subheadline text-warm-ink-300">This gratitude wall doesn't exist yet.</p>
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

  const totalHearts = (posts || []).reduce((sum: number, p: { heart_count?: number | null }) => sum + (p.heart_count || 0), 0)
  const isOwner = authUser?.id === userId
  const theme = profile.wall_theme || 'starry'

  const mappedPosts = (posts || []).map((p: { id: string; content: string; feeling?: string | null; category: string; created_at: string; heart_count?: number | null }) => ({
    id: p.id,
    content: p.content,
    feeling: p.feeling ?? null,
    category: p.category,
    createdAt: p.created_at,
    heartCount: p.heart_count || 0,
  }))

  const commonProps = {
    user: {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatar_url,
    },
    posts: mappedPosts,
    stats: {
      totalPosts: posts?.length || 0,
      totalHearts,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
    },
    isOwner,
    currentTheme: theme,
  }

  const client = (() => {
    switch (theme) {
      case 'tree':
        return <TreeClient {...commonProps} />
      case 'zen':
        return <ZenClient {...commonProps} />
      case 'polaroid':
        return <PolaroidClient {...commonProps} />
      case 'sticky-notes':
        return <StickyNotesClient {...commonProps} />
      case 'starry':
      default:
        return <SkyClient {...commonProps} />
    }
  })()

  return <div data-theme={theme}>{client}</div>
}
