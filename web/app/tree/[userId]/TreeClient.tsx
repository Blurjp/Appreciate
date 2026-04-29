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

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const LEAF_COLORS: Record<string, string> = {
  FAMILY: '#D4917A',
  WORK: '#BE6858',
  SMALL_JOYS: '#D8BC69',
  NATURE: '#7FA06B',
  HEALTH: '#9F8BB0',
  OTHER: '#BBA898',
}

export default function TreeClient({ user, posts, isOwner, currentTheme }: Props) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]

  const leaves = useMemo(() => {
    const rand = seeded(24)
    const count = Math.max(14, Math.min(54, posts.length * 2 + 14))
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2
      const radius = Math.sqrt(rand()) * 34
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 36 + Math.sin(angle) * radius * 0.62,
        rotate: rand() * 360,
        postIndex: i < posts.length ? i : -1,
        color: LEAF_COLORS[posts[i]?.category || 'OTHER'] || LEAF_COLORS.OTHER,
      }
    })
  }, [posts])

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#F5EFE3] shadow-[0_24px_70px_rgba(91,72,48,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#F9F4E9_0%,#EDE3D2_100%)]" />
          <h1 className="absolute left-7 top-7 z-10 text-[34px] font-semibold tracking-tight text-[#4A3A2A] sm:text-[44px]">
            {user.name}&apos;s Gratitude Tree
          </h1>

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M49 94 C48 77 48 64 50 48" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M50 55 C37 45 29 40 22 29" stroke="#8B5E3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M50 51 C63 41 72 34 82 22" stroke="#8B5E3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M50 45 C43 33 42 26 39 16" stroke="#8B5E3C" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="94" rx="31" ry="7" fill="#D8C8A8" opacity="0.8" />
          </svg>

          {leaves.map((leaf, i) => {
            const isPost = leaf.postIndex >= 0
            const isSelected = leaf.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => isPost && setSelected(leaf.postIndex)}
                className="absolute z-10 h-7 w-4 rounded-[80%_0_80%_0] shadow-sm transition-transform duration-300"
                style={{
                  left: `${leaf.x}%`,
                  top: `${leaf.y}%`,
                  background: leaf.color,
                  transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg) scale(${isSelected ? 1.45 : 1})`,
                  opacity: isPost ? 0.96 : 0.45,
                }}
                aria-label={isPost ? `Open leaf ${leaf.postIndex + 1}` : undefined}
              />
            )
          })}

          {active && (
            <div className="absolute right-7 top-[32%] z-20 max-w-[300px] rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-[#3D2E26] shadow-xl backdrop-blur-xl">
              <p className="text-lg leading-snug">{active.content}</p>
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[#D8B56A] text-4xl font-light text-[#4A3A2A] shadow-xl"
              aria-label="Change theme"
            >
              +
            </button>
          )}
        </div>
      </section>

      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'tree'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
      )}
    </main>
  )
}
