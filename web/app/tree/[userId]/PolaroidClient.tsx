'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

const HAND = '"Comic Sans MS", "Bradley Hand", "Segoe Print", cursive'
const GRADIENTS = [
  'from-[#F7D8A8] via-[#F6E8D2] to-[#BFD6D8]',
  'from-[#B9D7E6] via-[#DCEBE7] to-[#BFD7B8]',
  'from-[#E8B7B0] via-[#F3D4B7] to-[#C7B7D8]',
  'from-[#C9D8A8] via-[#EFE1C7] to-[#D7B85C]',
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function PolaroidClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: VisualizationProps) {
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

  const visualization = (
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#FBF4E7] shadow-[0_24px_70px_rgba(80,62,40,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(128,105,74,0.04)_1px,transparent_1px),radial-gradient(circle,rgba(91,72,48,0.055)_1px,transparent_1px)] bg-[size:92px_92px,18px_18px]" />

          {cards.map((card, i) => {
            const isPost = card.postIndex >= 0
            const post = posts[card.postIndex]
            const isSelected = card.postIndex === selected
            const style = {
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: isSelected ? 150 : 122,
              transform: `translate(-50%, -50%) rotate(${isSelected ? card.rotate * 0.3 : card.rotate}deg) scale(${isSelected ? 1.08 : card.scale})`,
            }

            return isPost ? (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(card.postIndex)}
                className="absolute z-20 bg-white p-2 text-left shadow-[0_14px_30px_rgba(45,36,24,0.20)] ring-2 ring-[#D7B85C]/55 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#D7B85C]/45"
                style={style}
                aria-label={`Open memory ${card.postIndex + 1}`}
              >
                <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full border border-white bg-[#B98154] shadow" />
                <div className={`h-24 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                  <span className="text-4xl opacity-70">{i % 4 === 0 ? '☕' : i % 4 === 1 ? '☀️' : i % 4 === 2 ? '🌧️' : '✨'}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-[#2F281F]" style={{ fontFamily: HAND }}>
                  {post.content}
                </p>
              </button>
            ) : (
              <div
                key={i}
                className="absolute z-10 bg-white/70 p-2 text-left opacity-55 shadow-[0_8px_18px_rgba(45,36,24,0.12)]"
                style={style}
              >
                <div className={`h-24 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`} />
                <div className="mt-2 h-2 w-16 rounded-full bg-stone-200" />
                <div className="mt-1 h-2 w-10 rounded-full bg-stone-200" />
              </div>
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
  )

  const handleThemeSaved = (themeId: string) => {
    if (embedded && onThemeSaved) {
      onThemeSaved(themeId)
    } else {
      window.location.reload()
    }
  }

  if (embedded) {
    return (
      <>
        {visualization}
        {showThemePicker && (
          <ThemePicker currentTheme={currentTheme || 'polaroid'} onClose={() => setShowThemePicker(false)} onSaved={handleThemeSaved} />
        )}
      </>
    )
  }

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        {visualization}
      </section>
      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'polaroid'} onClose={() => setShowThemePicker(false)} onSaved={handleThemeSaved} />
      )}
    </main>
  )
}
