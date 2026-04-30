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

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const LEAF_COLORS: Record<string, string> = {
  FAMILY: '#D18B73',
  WORK: '#9A7DB8',
  SMALL_JOYS: '#D7B85C',
  NATURE: '#6F9B69',
  HEALTH: '#77A7A8',
  OTHER: '#B99A75',
}

export default function TreeClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: Props) {
  const [selected, setSelected] = useState(0)
  const active = posts[selected] || posts[0]

  const { postLeaves, backgroundLeaves } = useMemo(() => {
    const rand = seeded(24)
    const postLeaves = Array.from({ length: posts.length }, (_, i) => {
      const angle = rand() * Math.PI * 2
      const radius = Math.sqrt(rand()) * 34
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 36 + Math.sin(angle) * radius * 0.62,
        rotate: rand() * 360,
        postIndex: i,
        color: LEAF_COLORS[posts[i]?.category || 'OTHER'] || LEAF_COLORS.OTHER,
      }
    })
    const backgroundLeaves = Array.from({ length: Math.max(18, Math.min(56, posts.length * 2 + 18)) }, () => {
      const angle = rand() * Math.PI * 2
      const radius = Math.sqrt(rand()) * 36
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 36 + Math.sin(angle) * radius * 0.62,
        rotate: rand() * 360,
        color: '#86A777',
      }
    })
    return { postLeaves, backgroundLeaves }
  }, [posts])

  const visualization = (
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#F0E7D4] shadow-[0_24px_70px_rgba(80,62,40,0.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(194,214,172,0.55),transparent_34%),linear-gradient(180deg,#F7F0E2_0%,#E7D8BD_100%)]" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M49 94 C48 77 48 64 50 48" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M50 55 C37 45 29 40 22 29" stroke="#8B5E3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M50 51 C63 41 72 34 82 22" stroke="#8B5E3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M50 45 C43 33 42 26 39 16" stroke="#8B5E3C" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="94" rx="31" ry="7" fill="#D8C8A8" opacity="0.8" />
          </svg>

          {backgroundLeaves.map((leaf, i) => (
            <span
              key={`leaf-bg-${i}`}
              className="absolute z-10 h-6 w-4 rounded-[80%_0_80%_0] shadow-sm"
              style={{
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                background: leaf.color,
                transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg)`,
                opacity: 0.42,
              }}
            />
          ))}

          {postLeaves.map((leaf, i) => {
            const isSelected = leaf.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(leaf.postIndex)}
                className="absolute z-20 h-9 w-6 cursor-pointer rounded-[80%_0_80%_0] border border-white/70 shadow-md transition-transform duration-300 hover:scale-125 focus:outline-none focus:ring-4 focus:ring-[#D7B85C]/35"
                style={{
                  left: `${leaf.x}%`,
                  top: `${leaf.y}%`,
                  background: leaf.color,
                  transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg) scale(${isSelected ? 1.45 : 1})`,
                  boxShadow: isSelected ? `0 0 0 10px ${leaf.color}33, 0 10px 24px rgba(61,46,32,0.18)` : '0 8px 18px rgba(61,46,32,0.16)',
                }}
                aria-label={`Open leaf ${leaf.postIndex + 1}`}
              />
            )
          })}

          {active && (
            <div className="absolute right-7 top-[32%] z-20 max-w-[300px] rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-[#3D2E26] shadow-xl backdrop-blur-xl">
              <p className="text-lg leading-snug">{active.content}</p>
            </div>
          )}
        </div>
  )

  if (embedded) {
    return <>{visualization}</>
  }

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        {visualization}
      </section>
    </main>
  )
}
