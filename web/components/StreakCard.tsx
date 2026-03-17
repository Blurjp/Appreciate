'use client'

import { StreakData, getStreakEmoji, getStreakMessage } from '@/types'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  streak: StreakData
}

export default function StreakCard({ streak }: Props) {
  const currentStreak = streak?.currentStreak ?? 0
  const totalPosts = streak?.totalPosts ?? 0
  const longestStreak = streak?.longestStreak ?? 0
  const weekActivity = streak?.weekActivity ?? []
  const emoji = getStreakEmoji(currentStreak)
  const message = getStreakMessage(currentStreak)
  const postedToday = weekActivity[weekActivity.length - 1] ?? false

  return (
    <div className="bg-brand-card rounded-2xl shadow-card p-5 border border-brand-border">
      {/* Streak Header */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-accent-light flex items-center justify-center mb-3">
          <span className="text-[32px]">{emoji}</span>
        </div>
        <p className="text-title-2 text-brand-text-primary">
          {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
        </p>
        <p className="text-subheadline text-brand-text-secondary mt-1">
          {message}
        </p>
      </div>

      {/* Week Activity */}
      <div className="flex justify-center gap-2 mb-5">
        {weekActivity.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-caption font-medium transition-all ${
                active
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-surface text-brand-text-muted border border-brand-border'
              }`}
            >
              {active ? '✓' : DAY_LABELS[i]}
            </div>
            <span className="text-[10px] text-brand-text-muted font-medium">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex justify-around pt-4 border-t border-brand-border">
        <StatItem label="Total Posts" value={totalPosts.toString()} />
        <StatItem label="Best Streak" value={`${longestStreak}d`} />
        <StatItem
          label="Today"
          value={postedToday ? 'Done' : 'Pending'}
          highlight={postedToday}
        />
      </div>
    </div>
  )
}

function StatItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-headline font-semibold ${highlight ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
        {value}
      </p>
      <p className="text-caption text-brand-text-secondary mt-0.5">{label}</p>
    </div>
  )
}
