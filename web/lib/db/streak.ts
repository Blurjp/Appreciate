import { SupabaseClient } from '@supabase/supabase-js'
import { StreakData } from '@/types'

function todayInTz(tz?: string): Date {
  if (!tz) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }
  const parts = new Date().toLocaleDateString('en-US', { timeZone: tz }).split('/')
  return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]))
}

export async function fetchStreak(
  supabase: SupabaseClient,
  userId: string,
  tz?: string
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

  const weekActivity = await fetchWeekActivity(supabase, userId, tz)

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
  userId: string,
  tz?: string
): Promise<boolean[]> {
  const today = todayInTz(tz)
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
    const localParts = d.toLocaleDateString('en-US', { timeZone: tz }).split('/')
    const localDate = new Date(Number(localParts[2]), Number(localParts[0]) - 1, Number(localParts[1]))
    const diff = Math.round((localDate.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff < 7) {
      postingDays.add(diff)
    }
  }

  return Array.from({ length: 7 }, (_, i) => postingDays.has(i))
}
