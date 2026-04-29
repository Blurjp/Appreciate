'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

const HAND = '"Comic Sans MS", "Bradley Hand", "Segoe Print", cursive'
const GRADIENTS = [
  'from-amber-100 via-stone-100 to-sky-100',
  'from-sky-100 via-cyan-100 to-emerald-100',
  'from-rose-100 via-orange-100 to-violet-100',
  'from-lime-100 via-stone-100 to-amber-100',
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function PolaroidClient({ user, posts, isOwner, currentTheme }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]

  const cards = useMemo(() => {
    const rand = seeded(12)
    const count = Math.max(8, Math.min(22, posts.length + 8))
    return Array.from({ length: count }, (_, i) => ({
      x: 7 + rand() * 82,
      y: 11 + rand() * 70,
      rotate: -9 + rand() * 18,
      scale: 0.82 + rand() * 0.28,
      postIndex: i < posts.length ? i : -1,
    }))
  }, [posts.length])

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#FFF9ED] shadow-[0_24px_70px_rgba(91,72,48,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(128,105,74,0.045)_1px,transparent_1px),radial-gradient(circle,rgba(91,72,48,0.06)_1px,transparent_1px)] bg-[size:92px_92px,18px_18px]" />
          <h1 className="absolute left-7 top-8 z-20 max-w-[260px] text-[38px] leading-[0.92] text-[#17120E] sm:text-[50px]" style={{ fontFamily: HAND }}>
            Moments of Gratitude
          </h1>

          {cards.map((card, i) => {
            const isPost = card.postIndex >= 0
            const post = posts[card.postIndex]
            const isSelected = card.postIndex === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => isPost && setSelected(card.postIndex)}
                className="absolute z-10 bg-white p-2 text-left shadow-[0_10px_24px_rgba(45,36,24,0.18)] transition-transform duration-300"
                style={{
                  left: `${card.x}%`,
                  top: `${card.y}%`,
                  width: isSelected ? 142 : 116,
                  transform: `translate(-50%, -50%) rotate(${isSelected ? card.rotate * 0.3 : card.rotate}deg) scale(${isSelected ? 1.08 : card.scale})`,
                }}
                aria-label={isPost ? `Open memory ${card.postIndex + 1}` : undefined}
              >
                <div className={`h-24 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                  <span className="text-4xl opacity-70">{i % 4 === 0 ? '☕' : i % 4 === 1 ? '☀️' : i % 4 === 2 ? '🌧️' : '✨'}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-[#2F281F]" style={{ fontFamily: HAND }}>
                  {post?.content || 'A small quiet moment.'}
                </p>
              </button>
            )
          })}

          {active && (
            <div className="absolute right-7 top-8 z-30 rotate-3 bg-[#F5EDCF] px-4 py-3 text-lg leading-tight text-[#2F281F] shadow" style={{ fontFamily: HAND, maxWidth: 185 }}>
              {active.content}
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute bottom-7 right-7 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl font-light text-[#6D5438] shadow-xl"
              aria-label="Change theme"
            >
              +
            </button>
          )}
        </div>
      </section>

      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'polaroid'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
      )}
    </main>
  )
}
