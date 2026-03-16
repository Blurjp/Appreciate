'use client'

import { StreakData, getStreakEmoji, getStreakMessage } from '@/types'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  streak: StreakData
}

export default function StreakCard({ streak }: Props) {
  const emoji = getStreakEmoji(streak.currentStreak)
  const message = getStreakMessage(streak.currentStreak)
  const postedToday = streak.weekActivity[streak.weekActivity.length - 1]

  return (
    <div className="bg-brand-card rounded-lg shadow-card p-md border border-brand-border">
      {/* Streak Header */}
      <div className="text-center mb-4">
        <span className="text-[48px] leading-none">{emoji}</span>
        <p className="text-title text-brand-text-primary mt-1">
          {streak.currentStreak} Day{streak.currentStreak !== 1 ? 's' : ''}{' '}
          {streak.currentStreak > 0 ? '🔥' : ''}
        </p>
        <p className="text-subheadline text-brand-text-secondary mt-1">
          {message}
        </p>
      </div>

      {/* Week Activity */}
      <div className="flex justify-center gap-2 mb-4">
        {streak.weekActivity.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-caption font-medium transition-colors ${
                active
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-surface text-brand-text-secondary'
              }`}
            >
              {active ? '✓' : DAY_LABELS[i]}
            </div>
            <span className="text-[10px] text-brand-text-secondary">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex justify-around pt-3 border-t border-brand-border">
        <StatItem label="Total Posts" value={streak.totalPosts.toString()} />
        <StatItem label="Best Streak" value={`${streak.longestStreak} days`} />
        <StatItem
          label="Today"
          value={postedToday ? '✅ Done' : '⏳ Pending'}
        />
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-headline text-brand-text-primary">{value}</p>
      <p className="text-caption text-brand-text-secondary">{label}</p>
    </div>
  )
}
