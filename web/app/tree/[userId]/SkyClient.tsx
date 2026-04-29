'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

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
}

const COLORS: Record<string, string> = {
  FAMILY: '#FFD6A5',
  WORK: '#FFB7C3',
  SMALL_JOYS: '#FFF1A6',
  NATURE: '#B9F8D3',
  HEALTH: '#D8C4FF',
  OTHER: '#C4D9FF',
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function SkyClient({ user, posts, isOwner, currentTheme }: Props) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]

  const stars = useMemo(() => {
    const rand = seeded(91)
    const count = Math.max(18, Math.min(48, posts.length * 3 + 18))
    return Array.from({ length: count }, (_, i) => ({
      x: 5 + rand() * 90,
      y: 10 + rand() * 74,
      size: i < posts.length ? 10 + rand() * 12 : 2 + rand() * 4,
      postIndex: i < posts.length ? i : -1,
      color: COLORS[posts[i]?.category || 'OTHER'] || COLORS.OTHER,
      delay: rand() * 4,
    }))
  }, [posts])

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#080B24] shadow-[0_24px_70px_rgba(12,16,45,0.32)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_86%,rgba(155,77,151,0.42),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(98,116,214,0.18),transparent_26%),linear-gradient(180deg,#080B24_0%,#10143B_52%,#1B1549_100%)]" />
          <h1 className="absolute left-7 top-7 z-10 text-[34px] font-light tracking-tight text-white/82 sm:text-[44px]" style={{ fontFamily: 'Georgia, serif' }}>
            My Gratitude Sky
          </h1>

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {stars.filter((s) => s.postIndex >= 0).slice(0, 14).map((s, i, arr) => {
              const next = arr[(i + 3) % arr.length]
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

          {stars.map((star, i) => {
            const isPost = star.postIndex >= 0
            const isActive = star.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                aria-label={isPost ? `Open gratitude ${star.postIndex + 1}` : undefined}
                onClick={() => isPost && setSelected(star.postIndex)}
                className="absolute rounded-full transition-transform duration-300"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  background: star.color,
                  opacity: isPost ? 1 : 0.68,
                  boxShadow: `0 0 ${isActive ? 34 : 16}px ${star.color}`,
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.75 : 1})`,
                  animation: `skyTwinkle ${2.5 + (i % 5) * 0.5}s ease-in-out ${star.delay}s infinite`,
                }}
              />
            )
          })}

          {active && (
            <div className="absolute left-[58%] top-[32%] z-20 max-w-[270px] rounded-lg border border-white/12 bg-white/14 p-4 text-white/86 shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-medium text-white/70">
                {new Date(active.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
              <p className="mt-1 text-base leading-snug">{active.content}</p>
              <p className="mt-2 text-xs text-white/45">#{active.category.replace('_', ' ').toLowerCase()}</p>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute bottom-7 right-7 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-white/10 text-4xl font-light text-white/70 shadow-[0_0_28px_rgba(255,255,255,0.20)] backdrop-blur-xl"
              aria-label="Change theme"
            >
              +
            </button>
          )}
        </div>
      </section>

      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'starry'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
      )}

      <style>{`
        @keyframes skyTwinkle {
          0%, 100% { filter: brightness(0.88); }
          50% { filter: brightness(1.25); }
        }
      `}</style>
    </main>
  )
}
