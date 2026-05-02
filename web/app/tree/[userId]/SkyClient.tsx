'use client'

import { useMemo, useState } from 'react'

interface Post {
  id: string
  content: string
  feeling: string | null
  category: string
  createdAt: string
  heartCount: number
}

interface Props {
  user: { id: string; name: string; avatarUrl: string | null }
  posts: Post[]
  stats: { totalPosts: number; totalHearts: number; currentStreak: number; longestStreak: number }
  isOwner?: boolean
  currentTheme?: string
  embedded?: boolean
  onThemeSaved?: (themeId: string) => void
}

const COLORS: Record<string, string> = {
  FAMILY: '#FFD7BA',
  WORK: '#B8C7FF',
  SMALL_JOYS: '#FFE88A',
  NATURE: '#9EE6C4',
  HEALTH: '#E3C4FF',
  OTHER: '#BFE8FF',
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function SkyClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: Props) {
  const [selected, setSelected] = useState(0)
  const active = posts[selected] || posts[0]

  const { postStars, backgroundStars } = useMemo(() => {
    const rand = seeded(91)
    const postCount = posts.length
    const postStars = Array.from({ length: postCount }, (_, i) => ({
      x: 5 + rand() * 90,
      y: 10 + rand() * 74,
      size: 24 + rand() * 12,
      postIndex: i,
      color: COLORS[posts[i]?.category || 'OTHER'] || COLORS.OTHER,
      delay: rand() * 4,
    }))
    const backgroundStars = Array.from({ length: Math.max(28, Math.min(60, postCount * 2 + 28)) }, () => ({
      x: 4 + rand() * 92,
      y: 8 + rand() * 78,
      size: 1.5 + rand() * 3.5,
      opacity: 0.25 + rand() * 0.5,
      delay: rand() * 4,
    }))
    return { postStars, backgroundStars }
  }, [posts])

  const visualization = (
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#071225] shadow-[0_24px_70px_rgba(5,14,31,0.34)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_82%,rgba(107,83,177,0.35),transparent_32%),radial-gradient(circle_at_72%_22%,rgba(62,145,180,0.24),transparent_28%),radial-gradient(circle_at_52%_62%,rgba(255,214,186,0.12),transparent_24%),linear-gradient(180deg,#06101F_0%,#0B1733_50%,#18204E_100%)]" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {postStars.slice(0, 14).map((s, i, arr) => {
              const next = arr[(i + 3) % arr.length]
              if (!next) return null
              return (
                <path
                  key={`line-${i}`}
                  d={`M${s.x} ${s.y} C${(s.x + next.x) / 2} ${Math.min(s.y, next.y) - 12}, ${(s.x + next.x) / 2} ${Math.max(s.y, next.y) + 8}, ${next.x} ${next.y}`}
                  fill="none"
                  stroke="rgba(210,215,255,0.16)"
                  strokeWidth="0.24"
                />
              )
            })}
          </svg>

          {backgroundStars.map((star, i) => (
            <span
              key={`bg-${i}`}
              className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animation: `skyTwinkle ${3 + (i % 6) * 0.45}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}

          {postStars.map((star, i) => {
            const isActive = star.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                aria-label={`Open gratitude ${star.postIndex + 1}`}
                onClick={() => setSelected(star.postIndex)}
                className="absolute z-30 flex cursor-pointer items-center justify-center rounded-full border border-white/45 bg-white/10 transition-transform duration-300 hover:scale-125 focus:outline-none focus:ring-4 focus:ring-white/30"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  boxShadow: `0 0 ${isActive ? 42 : 24}px ${star.color}`,
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.75 : 1})`,
                  animation: `skyTwinkle ${2.5 + (i % 5) * 0.5}s ease-in-out ${star.delay}s infinite`,
                }}
              >
                <span
                  className="block h-1/2 w-1/2 rotate-45 rounded-[3px] border border-white/80"
                  style={{ background: star.color }}
                />
              </button>
            )
          })}

          {active && (
            <div className="pointer-events-none absolute left-[58%] top-[32%] z-20 max-w-[270px] rounded-lg border border-white/20 bg-black/40 p-4 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-medium text-white/90">
                {new Date(active.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
              <p className="mt-1 text-base leading-snug text-white">{active.content}</p>
              <p className="mt-2 text-xs text-white/60">#{active.category.replace('_', ' ').toLowerCase()}</p>
            </div>
          )}
        </div>
  )

  if (embedded) {
    return (
      <>
        {visualization}
        <SkyTwinkleStyle />
      </>
    )
  }

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        {visualization}
      </section>
      <SkyTwinkleStyle />
    </main>
  )
}

function SkyTwinkleStyle() {
  return (
    <style>{`
      @keyframes skyTwinkle {
        0%, 100% { filter: brightness(0.88); }
        50% { filter: brightness(1.25); }
      }
    `}</style>
  )
}
