'use client'

import { useMemo, useState } from 'react'
import type { VisualizationProps } from './ZenClient'

const NOTE_COLORS = [
  '#FFF9B1', '#FFD6A5', '#CAFFBF', '#A0C4FF', '#BDB2FF',
  '#FFC6FF', '#FDFFB6', '#9BF6FF', '#FFADAD', '#CAFFBF',
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function StickyNotesClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const active = posts[selected] || posts[0]

  const notes = useMemo(() => {
    const rand = seeded(42)
    return posts.map((post, i) => ({
      post,
      color: NOTE_COLORS[i % NOTE_COLORS.length],
      rotate: (rand() - 0.5) * 8,
      offsetY: rand() * 6,
    }))
  }, [posts])

  const canvasHeight = posts.length === 1 ? 'h-[48vh] min-h-[400px]' : 'h-[70vh] min-h-[520px]'

  const visualization = (
    <div className={`relative ${canvasHeight} overflow-hidden rounded-2xl bg-[#F5F0E8] shadow-[0_24px_70px_rgba(80,62,40,0.15)]`}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F7F2EA_0%,#EDE5D8_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(200,190,170,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(200,190,170,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {active && (
        <div className="pointer-events-none absolute right-6 top-6 z-20 max-w-[260px] rounded-xl border border-[#D4C8B0] bg-white/90 px-5 py-4 text-[#3D2E26] shadow-lg">
          <p className="text-lg leading-snug font-medium">{active.content}</p>
          <p className="mt-2 text-xs text-[#8B7B68]">
            {new Date(active.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}

      <div className="absolute bottom-6 left-6 right-6 top-[45%] overflow-y-auto">
        <div className="flex flex-wrap gap-3 justify-center pb-4">
          {notes.map((note, i) => {
            const isSelected = i === selected
            return (
              <button
                key={note.post.id}
                type="button"
                onClick={() => setSelected(i)}
                className={`relative w-[140px] min-h-[100px] rounded-sm p-3 text-left shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#9B4D30]/40 ${isSelected ? 'scale-105 shadow-xl z-10 ring-2 ring-[#9B4D30]/50' : ''}`}
                style={{
                  background: note.color,
                  transform: `rotate(${note.rotate}deg) translateY(${note.offsetY}px)${isSelected ? ' scale(1.05)' : ''}`,
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D4C8B0] shadow-sm" />
                <p className="text-[13px] leading-snug text-[#3D2E26] line-clamp-4 mt-1">{note.post.content}</p>
              </button>
            )
          })}
        </div>
      </div>
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
