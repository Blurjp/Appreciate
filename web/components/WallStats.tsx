'use client'

import { useMemo } from 'react'
import { StreakData } from '@/types'

interface Props {
  streak?: StreakData
  posts: { createdAt: string }[]
}

function countInWindow(posts: { createdAt: string }[], days: number): number {
  const cutoff = Date.now() - days * 86_400_000
  return posts.filter((p) => new Date(p.createdAt).getTime() >= cutoff).length
}

export default function WallStats({ streak, posts }: Props) {
  const stats = useMemo(
    () => ({
      total: posts.length,
      week: countInWindow(posts, 7),
      month: countInWindow(posts, 30),
      year: countInWindow(posts, 365),
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
    }),
    [posts, streak]
  )

  const tiles = [
    { key: 'streak', label: 'Day streak', value: stats.current, accent: true },
    { key: 'longest', label: 'Longest', value: stats.longest },
    { key: 'total', label: 'Total', value: stats.total },
    { key: 'week', label: 'This week', value: stats.week },
    { key: 'month', label: 'This month', value: stats.month },
    { key: 'year', label: 'This year', value: stats.year },
  ]

  return (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {tiles.map((t) => (
        <div
          key={t.key}
          className={`rounded-2xl border px-3 py-3 text-center ${t.accent ? 'border-brand-primary/40 bg-brand-primary/10' : 'glass-chip border-brand-border'}`}
        >
          <p className={`text-2xl font-semibold leading-none ${t.accent ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
            {t.value}
          </p>
          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-brand-text-muted">{t.label}</p>
        </div>
      ))}
    </div>
  )
}
