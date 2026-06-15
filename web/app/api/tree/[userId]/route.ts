import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, created_at, wall_theme, wall_hidden')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Wall-level privacy: only the owner can view a hidden wall
  const isOwner = authUser?.id === userId
  if (profile.wall_hidden && !isOwner) {
    return NextResponse.json({ error: 'Wall is private' }, { status: 404 })
  }

  // Fetch public + anonymous posts (not private)
  const { data: posts, error: postsError } = await supabase
    .from('gratitude_posts')
    .select('id, content, feeling, category, visibility, photo_url, created_at, heart_count')
    .eq('author_id', userId)
    .in('visibility', ['PUBLIC', 'ANONYMOUS'])
    .order('created_at', { ascending: true })

  if (postsError) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  // Fetch streak data via SECURITY DEFINER RPC (RLS blocks non-owner reads)
  const { data: streakData } = await supabase
    .rpc('public_streak_stats', { p_user_id: userId })
  const streak = Array.isArray(streakData) ? streakData[0] : null

  // Count hearts received
  const totalHearts = (posts || []).reduce((sum: number, p: any) => sum + (p.heart_count || 0), 0)

  return NextResponse.json({
    user: {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      joinedAt: profile.created_at,
      wallTheme: profile.wall_theme || 'starry',
    },
    posts: (posts || []).map((p: any) => ({
      id: p.id,
      content: p.content,
      feeling: p.feeling,
      category: p.category,
      visibility: p.visibility,
      photoUrl: p.photo_url,
      createdAt: p.created_at,
      heartCount: p.heart_count || 0,
    })),
    stats: {
      totalPosts: posts?.length || 0,
      totalHearts,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
    },
  })
}
