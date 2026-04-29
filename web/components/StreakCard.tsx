'use client'

import { StreakData } from '@/types'

interface Props {
  streak: StreakData
  currentTheme?: string
}

export default function StreakCard({ streak, currentTheme = 'starry' }: Props) {
  const totalPosts = streak?.totalPosts ?? 0

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border">
      <ThemeObjectPreview theme={currentTheme} totalPosts={totalPosts} />
    </div>
  )
}

function ThemeObjectPreview({ theme, totalPosts }: { theme: string; totalPosts: number }) {
  const leaves = Math.min(Math.max(totalPosts, 5), 16)
  const stars = Math.min(Math.max(totalPosts, 8), 22)
  const objects = Math.min(Math.max(totalPosts, 4), 12)

  if (theme === 'tree') {
    return (
      <div className="relative h-40 overflow-hidden bg-gradient-to-b from-emerald-50 via-warm-cream-100 to-[#E6D7BE]">
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#D8C8A8] to-transparent" />
        <div className="absolute left-1/2 top-16 h-20 w-4 -translate-x-1/2 rounded-full bg-[#8B5E3C]" />
        <div className="absolute left-1/2 top-28 h-9 w-36 -translate-x-1/2 rounded-[50%] bg-[#D8C8A8]" />
        {Array.from({ length: leaves }).map((_, i) => {
          const angle = (i / leaves) * Math.PI * 2
          const radius = 20 + (i % 4) * 9
          const x = 50 + Math.cos(angle) * radius
          const y = 34 + Math.sin(angle) * radius * 0.56
          return (
            <span
              key={i}
              className="absolute h-6 w-4 rounded-full bg-emerald-500/80 shadow-sm"
              style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${i * 37}deg)` }}
            />
          )
        })}
      </div>
    )
  }

  if (theme === 'zen') {
    return (
      <div className="relative h-40 overflow-hidden bg-gradient-to-r from-[#DCEAD8] from-35% to-[#F2E8D5]">
        <div className="absolute left-9 top-8 h-24 w-24 rounded-full border border-stone-300/40 bg-white/30" />
        <div className="absolute left-12 top-11 h-[4.5rem] w-[4.5rem] rounded-full border border-stone-300/50" />
        <div className="absolute left-16 top-16 h-6 w-10 rounded-full bg-stone-400/80 shadow-sm" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="absolute right-6 h-px w-56 bg-stone-300/60" style={{ top: 20 + i * 13 }} />
        ))}
        {Array.from({ length: objects }).map((_, i) => (
          <span
            key={i}
            className={`absolute ${i % 3 === 0 ? 'h-6 w-1.5 rounded-full bg-emerald-600/70' : 'h-4 w-6 rounded-[50%] bg-stone-400/70'}`}
            style={{ right: `${10 + (i * 13) % 62}%`, top: `${28 + (i * 19) % 48}%`, transform: `rotate(${(i % 5) * 18}deg)` }}
          />
        ))}
      </div>
    )
  }

  if (theme === 'polaroid') {
    return (
      <div className="relative h-40 overflow-hidden bg-[#FFF8EC]">
        {Array.from({ length: objects }).map((_, i) => (
          <div
            key={i}
            className="absolute h-20 w-16 bg-white p-1.5 shadow-sm"
            style={{ left: `${8 + (i * 15) % 78}%`, top: `${10 + (i * 23) % 38}%`, transform: `rotate(${(i % 5) * 5 - 10}deg)` }}
          >
            <div className="h-12 rounded-sm bg-gradient-to-br from-amber-100 via-sky-100 to-rose-100" />
            <div className="mx-auto mt-1.5 h-1 w-9 rounded-full bg-stone-200" />
          </div>
        ))}
      </div>
    )
  }

  if (theme === 'glass') {
    return (
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-sky-50 via-rose-50 to-cyan-50">
        {Array.from({ length: objects }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-xl border border-white/70 bg-white/45 shadow-sm backdrop-blur"
            style={{ width: 54 + (i % 3) * 14, height: 28 + (i % 2) * 10, left: `${8 + (i * 18) % 74}%`, top: `${14 + (i * 17) % 58}%` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative h-40 overflow-hidden bg-gradient-to-b from-[#080A28] via-[#14113B] to-[#221447]">
      {Array.from({ length: stars }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)]"
          style={{
            width: 2 + (i % 4),
            height: 2 + (i % 4),
            left: `${7 + (i * 19) % 86}%`,
            top: `${12 + (i * 29) % 70}%`,
            opacity: 0.5 + (i % 4) * 0.12,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-fuchsia-500/20 to-transparent" />
    </div>
  )
}
