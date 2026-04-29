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

interface User {
  id: string
  name: string
  avatarUrl: string | null
}

interface Stats {
  totalPosts: number
  totalHearts: number
  currentStreak: number
  longestStreak: number
}

export interface VisualizationProps {
  user: User
  posts: Post[]
  stats: Stats
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

export default function ZenClient({ posts, isOwner, currentTheme }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]

  const objects = useMemo(() => {
    const rand = seeded(42)
    const count = Math.max(7, Math.min(24, posts.length + 7))
    return Array.from({ length: count }, (_, i) => ({
      x: 43 + rand() * 50,
      y: 20 + rand() * 58,
      kind: i % 3,
      postIndex: i < posts.length ? i : -1,
      rotate: -14 + rand() * 28,
    }))
  }, [posts.length])

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#F1E6D4] shadow-[0_24px_70px_rgba(88,74,52,0.22)]">
          <div className="absolute inset-y-0 left-0 w-[38%] bg-[#DDEAD8]" />
          <h1 className="absolute left-7 top-7 z-10 text-[34px] font-semibold tracking-tight text-[#8D7A57] sm:text-[42px]">
            Today&apos;s Garden
          </h1>

          <div className="absolute left-[10%] top-[25%] h-44 w-44 rounded-full bg-white/24">
            {[42, 58, 74, 90].map((r) => (
              <div
                key={r}
                className="absolute rounded-full border border-[#BBAA8D]/35"
                style={{ inset: `${88 - r}px` }}
              />
            ))}
            <div className="absolute inset-2 rounded-full border-[14px] border-[#D7EBD9]" />
            <div className="absolute inset-2 rounded-full border-[14px] border-transparent border-t-[#C58E5E] rotate-45" />
            <div className="absolute -bottom-2 left-2 h-16 w-40 rounded-[50%] border-b-[12px] border-[#9BD4DA]/70 rotate-[-8deg]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-12 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[#9D9B87] shadow-lg" />
          </div>

          <svg className="absolute inset-y-0 right-0 h-full w-[65%]" viewBox="0 0 650 520" preserveAspectRatio="none">
            {Array.from({ length: 13 }).map((_, i) => (
              <path
                key={i}
                d={`M40 ${30 + i * 38} C160 ${-8 + i * 38}, 255 ${70 + i * 38}, 390 ${30 + i * 38} S560 ${-6 + i * 38}, 650 ${24 + i * 38}`}
                fill="none"
                stroke="rgba(177,158,129,0.36)"
                strokeWidth="2"
              />
            ))}
            {[{ x: 582, y: 28, r: 54 }, { x: 96, y: 470, r: 38 }, { x: 618, y: 438, r: 44 }].map((stone, i) => (
              <ellipse key={i} cx={stone.x} cy={stone.y} rx={stone.r} ry={stone.r * 0.72} fill="#9AAB8C" opacity="0.72" />
            ))}
          </svg>

          {objects.map((obj, i) => {
            const isPost = obj.postIndex >= 0
            const isSelected = obj.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => isPost && setSelected(obj.postIndex)}
                className="absolute z-10 transition-transform duration-300"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: `translate(-50%, -50%) rotate(${obj.rotate}deg) scale(${isSelected ? 1.18 : 1})`,
                }}
                aria-label={isPost ? `Open garden moment ${obj.postIndex + 1}` : undefined}
              >
                {obj.kind === 0 ? <Plant /> : <Stone selected={isSelected} />}
              </button>
            )
          })}

          {active && (
            <div className="absolute right-[10%] top-[34%] z-20 max-w-[300px] rounded-2xl border border-white/65 bg-white/72 px-5 py-4 text-[#30302A] shadow-xl backdrop-blur-xl">
              <p className="text-lg font-semibold leading-snug">{active.content}</p>
              <div className="absolute -bottom-3 left-12 h-6 w-6 rotate-45 border-b border-r border-white/65 bg-white/72" />
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[#C89562] text-4xl font-light text-[#4B3320] shadow-xl"
              aria-label="Change theme"
            >
              +
            </button>
          )}
        </div>
      </section>

      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'zen'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
      )}
    </main>
  )
}

function Plant() {
  return (
    <span className="relative block h-14 w-12">
      <span className="absolute bottom-1 left-1/2 h-10 w-1 -translate-x-1/2 rounded-full bg-[#789B75]" />
      <span className="absolute bottom-6 left-1 h-4 w-8 rounded-[50%] bg-[#789B75] rotate-[-30deg]" />
      <span className="absolute bottom-7 right-1 h-4 w-8 rounded-[50%] bg-[#8AAA83] rotate-[30deg]" />
      <span className="absolute bottom-10 left-4 h-4 w-7 rounded-[50%] bg-[#6F926A]" />
    </span>
  )
}

function Stone({ selected }: { selected: boolean }) {
  return (
    <span className={`block h-10 w-14 rounded-[50%] bg-[#B9B09D] shadow-md ${selected ? 'ring-8 ring-[#9BD4DA]/30' : ''}`} />
  )
}
