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

export default function ZenClient({ posts, isOwner, currentTheme, embedded, onThemeSaved }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const active = posts[selected] || posts[0]

  const { postObjects, decorativeObjects } = useMemo(() => {
    const rand = seeded(42)
    const postObjects = Array.from({ length: posts.length }, (_, i) => ({
      x: 43 + rand() * 50,
      y: 20 + rand() * 58,
      kind: i % 3,
      postIndex: i,
      rotate: -14 + rand() * 28,
    }))
    const decorativeObjects = Array.from({ length: Math.max(7, Math.min(18, posts.length + 7)) }, (_, i) => ({
      x: 43 + rand() * 50,
      y: 20 + rand() * 58,
      kind: i % 3,
      rotate: -14 + rand() * 28,
    }))
    return { postObjects, decorativeObjects }
  }, [posts])

  const visualization = (
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#EFE2CC] shadow-[0_24px_70px_rgba(78,63,42,0.20)]">
          <div className="absolute inset-y-0 left-0 w-[38%] bg-[#D8E6D2]" />

          <div className="absolute left-[10%] top-[25%] h-44 w-44 rounded-full bg-white/24">
            {[42, 58, 74, 90].map((r) => (
              <div
                key={r}
                className="absolute rounded-full border border-[#BBAA8D]/35"
                style={{ inset: `${88 - r}px` }}
              />
            ))}
            <div className="absolute inset-2 rounded-full border-[14px] border-[#CFE3D0]" />
            <div className="absolute inset-2 rounded-full border-[14px] border-transparent border-t-[#B98154] rotate-45" />
            <div className="absolute -bottom-2 left-2 h-16 w-40 rounded-[50%] border-b-[12px] border-[#8EC7CF]/70 rotate-[-8deg]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-12 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[#8F927C] shadow-lg" />
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
              <ellipse key={i} cx={stone.x} cy={stone.y} rx={stone.r} ry={stone.r * 0.72} fill="#8CA282" opacity="0.58" />
            ))}
          </svg>

          {decorativeObjects.map((obj, i) => (
            <span
              key={`decor-${i}`}
              className="absolute z-10 opacity-45"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                transform: `translate(-50%, -50%) rotate(${obj.rotate}deg)`,
              }}
            >
              {obj.kind === 0 ? <Plant /> : <Stone />}
            </span>
          ))}

          {postObjects.map((obj, i) => {
            const isSelected = obj.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(obj.postIndex)}
                className="absolute z-30 cursor-pointer rounded-full transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#8EC7CF]/35"
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: `translate(-50%, -50%) rotate(${obj.rotate}deg) scale(${isSelected ? 1.22 : 1})`,
                }}
                aria-label={`Open garden moment ${obj.postIndex + 1}`}
              >
                <span className={`block rounded-full p-2 ${isSelected ? 'bg-[#8EC7CF]/30 ring-8 ring-[#8EC7CF]/25' : 'bg-white/38 ring-2 ring-white/70'}`}>
                  {obj.kind === 0 ? <Plant selected /> : <Stone selected />}
                </span>
              </button>
            )
          })}

          {active && (
            <div className="pointer-events-none absolute right-[10%] top-[34%] z-20 max-w-[300px] rounded-2xl border border-white/65 bg-white/72 px-5 py-4 text-[#30302A] shadow-xl backdrop-blur-xl">
              <p className="text-lg font-semibold leading-snug">{active.content}</p>
              <div className="absolute -bottom-3 left-12 h-6 w-6 rotate-45 border-b border-r border-white/65 bg-white/72" />
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

function Plant({ selected = false }: { selected?: boolean }) {
  return (
    <span className="relative block h-14 w-12">
      <span className={`absolute bottom-1 left-1/2 h-10 w-1 -translate-x-1/2 rounded-full ${selected ? 'bg-[#4F7B5E]' : 'bg-[#789B75]'}`} />
      <span className={`absolute bottom-6 left-1 h-4 w-8 rounded-[50%] rotate-[-30deg] ${selected ? 'bg-[#4F7B5E]' : 'bg-[#789B75]'}`} />
      <span className={`absolute bottom-7 right-1 h-4 w-8 rounded-[50%] rotate-[30deg] ${selected ? 'bg-[#6E9C75]' : 'bg-[#8AAA83]'}`} />
      <span className={`absolute bottom-10 left-4 h-4 w-7 rounded-[50%] ${selected ? 'bg-[#416F50]' : 'bg-[#6F926A]'}`} />
    </span>
  )
}

function Stone({ selected = false }: { selected?: boolean }) {
  return (
    <span className="relative block h-10 w-12">
      <span className={`absolute bottom-0 left-1 h-8 w-10 rounded-[50%] ${selected ? 'bg-[#8B9A82]' : 'bg-[#A0B09A]'}`} />
      <span className={`absolute bottom-2 right-0 h-6 w-7 rounded-[50%] ${selected ? 'bg-[#9AAB92]' : 'bg-[#B0BFB0]'}`} />
    </span>
  )
}
