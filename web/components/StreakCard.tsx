'use client'

import { StreakData, getStreakMessage } from '@/types'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  streak: StreakData
}

export default function StreakCard({ streak }: Props) {
  const currentStreak = streak?.currentStreak ?? 0
  const totalPosts = streak?.totalPosts ?? 0
  const longestStreak = streak?.longestStreak ?? 0
  const weekActivity = streak?.weekActivity ?? []
  const message = getStreakMessage(currentStreak)
  const postedToday = weekActivity[weekActivity.length - 1] ?? false

  return (
    <div className="rounded-2xl p-5 border border-brand-border">
      {/* Streak Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Current Streak</p>
          <p className="text-title-2 text-brand-text-primary tracking-tight">
            {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
          </p>
          <p className="text-subheadline text-brand-text-secondary mt-0.5">{message}</p>
        </div>
        <svg className="w-12 h-12 text-brand-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      {/* Week Activity */}
      <div className="flex justify-between mb-5">
        {weekActivity.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-caption font-medium transition-all border ${
                active
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-brand-text-muted border-brand-border'
              }`}
            >
              {active ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : DAY_LABELS[i]}
            </div>
            <span className="text-[9px] tracking-widest uppercase text-brand-text-muted">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex justify-around pt-4 border-t border-brand-border">
        <StatItem label="Total" value={totalPosts.toString()} />
        <StatItem label="Best" value={`${longestStreak}d`} />
        <StatItem label="Today" value={postedToday ? 'Done' : 'Pending'} highlight={postedToday} />
      </div>
    </div>
  )
}

function StatItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-headline font-semibold tracking-tight ${highlight ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
        {value}
      </p>
      <p className="text-[9px] tracking-widest uppercase text-brand-text-muted mt-0.5">{label}</p>
    </div>
  )
}
