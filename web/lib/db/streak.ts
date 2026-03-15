import { SupabaseClient } from '@supabase/supabase-js'
import { StreakData } from '@/types'

/// Fetches streak data from the Supabase streak_data table.
/// The streak is auto-updated by a database trigger when posts are created,
/// so no manual calculation is needed.
export async function fetchStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakData> {
  const { data, error } = await supabase
    .from('streak_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalPosts: 0,
      lastPostDate: null,
      weekActivity: [false, false, false, false, false, false, false],
    }
  }

  // Calculate week activity from recent posts
  const weekActivity = await fetchWeekActivity(supabase, userId)

  return {
    currentStreak: data.current_streak ?? 0,
    longestStreak: data.longest_streak ?? 0,
    totalPosts: data.total_posts ?? 0,
    lastPostDate: data.last_post_date,
    weekActivity,
  }
}

async function fetchWeekActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)

  const { data: posts } = await supabase
    .from('gratitude_posts')
    .select('created_at')
    .eq('author_id', userId)
    .gte('created_at', weekAgo.toISOString())

  const postingDays = new Set<number>()
  for (const post of posts ?? []) {
    const d = new Date(post.created_at)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((d.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff < 7) {
      postingDays.add(diff)
    }
  }

  return Array.from({ length: 7 }, (_, i) => postingDays.has(i))
}
