'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

export default function GlassClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]
  const visiblePosts = posts.length > 0 ? posts.slice(0, 8) : []

  const visualization = (
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#EAF6F8] shadow-[0_24px_70px_rgba(71,105,123,0.20)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.95),transparent_26%),radial-gradient(circle_at_72%_70%,rgba(104,194,204,0.40),transparent_34%),radial-gradient(circle_at_20%_92%,rgba(226,176,190,0.34),transparent_28%),linear-gradient(135deg,#ECF8FA_0%,#F7F0F4_48%,#DFF4F0_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[size:86px_86px]" />

          {active && (
            <button
              type="button"
              onClick={() => setSelected(0)}
              className="absolute right-[10%] top-[10%] z-20 max-w-[285px] rounded-2xl border border-white/75 bg-white/46 px-6 py-5 text-left text-[#243544] shadow-xl backdrop-blur-2xl ring-2 ring-[#68C2CC]/30"
            >
              {active.content}
            </button>
          )}

          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`glass-bg-${i}`}
              className="absolute rounded-2xl border border-white/55 bg-white/22 shadow-lg backdrop-blur-2xl"
              style={{
                width: 120 + (i % 3) * 34,
                height: 58 + (i % 2) * 18,
                left: `${8 + (i * 17) % 74}%`,
                top: `${18 + (i * 23) % 58}%`,
                opacity: 0.42,
              }}
            />
          ))}

          <div className="absolute bottom-[18%] left-7 right-24 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {visiblePosts.slice(0, 4).map((post, i) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelected(i)}
                className={`min-h-[84px] rounded-2xl border px-5 py-4 text-left text-lg leading-snug text-[#243544] shadow-lg backdrop-blur-2xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#68C2CC]/30 active:scale-[0.98] ${
                  i === selected
                    ? 'border-[#68C2CC]/70 bg-white/58 ring-2 ring-[#68C2CC]/35'
                    : 'border-white/70 bg-white/38'
                }`}
              >
                {post.content}
              </button>
            ))}
          </div>

          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full border border-white/72 bg-white/38 text-4xl font-light text-[#425F70] shadow-xl backdrop-blur-2xl"
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
          <ThemePicker currentTheme={currentTheme || 'glass'} onClose={() => setShowThemePicker(false)} onSaved={handleThemeSaved} />
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
        <ThemePicker currentTheme={currentTheme || 'glass'} onClose={() => setShowThemePicker(false)} onSaved={handleThemeSaved} />
      )}
    </main>
  )
}
