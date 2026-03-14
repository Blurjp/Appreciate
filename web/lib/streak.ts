import { prisma } from './db'
import { StreakData } from '@/types'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function calculateStreak(userId: string): Promise<StreakData> {
  const posts = await prisma.gratitudePost.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (posts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalPosts: 0,
      lastPostDate: null,
      weekActivity: [false, false, false, false, false, false, false],
    }
  }

  // Unique posting days
  const postingDaysSet = new Set<string>()
  for (const post of posts) {
    postingDaysSet.add(startOfDay(post.createdAt).toISOString())
  }
  const postingDays = Array.from(postingDaysSet)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())

  // Current streak
  const today = startOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let currentStreak = 0
  const mostRecent = postingDays[0]

  if (
    mostRecent.getTime() === today.getTime() ||
    mostRecent.getTime() === yesterday.getTime()
  ) {
    currentStreak = 1
    let checkDate = new Date(mostRecent)
    checkDate.setDate(checkDate.getDate() - 1)

    for (let i = 1; i < postingDays.length; i++) {
      if (postingDays[i].getTime() === checkDate.getTime()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Longest streak
  let longestStreak = 1
  let streak = 1
  for (let i = 1; i < postingDays.length; i++) {
    const diff =
      (postingDays[i - 1].getTime() - postingDays[i].getTime()) /
      (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 1
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak)

  // Week activity
  const weekActivity: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    weekActivity.push(
      postingDays.some((d) => d.getTime() === day.getTime())
    )
  }

  return {
    currentStreak,
    longestStreak,
    totalPosts: posts.length,
    lastPostDate: posts[0].createdAt.toISOString(),
    weekActivity,
  }
}

export async function updateStreakData(userId: string) {
  const streak = await calculateStreak(userId)
  await prisma.streakData.upsert({
    where: { userId },
    update: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalPosts: streak.totalPosts,
      lastPostDate: streak.lastPostDate ? new Date(streak.lastPostDate) : null,
    },
    create: {
      userId,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalPosts: streak.totalPosts,
      lastPostDate: streak.lastPostDate ? new Date(streak.lastPostDate) : null,
    },
  })
  return streak
}
