'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

export default function GlassClient({ user, posts, isOwner, currentTheme }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const active = posts[selected] || posts[0]
  const visiblePosts = posts.length > 0 ? posts.slice(0, 8) : []

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-2xl bg-[#EAF8FF] shadow-[0_24px_70px_rgba(71,105,123,0.20)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.95),transparent_26%),radial-gradient(circle_at_72%_70%,rgba(91,203,226,0.46),transparent_34%),radial-gradient(circle_at_22%_92%,rgba(255,168,196,0.40),transparent_28%),linear-gradient(135deg,#ECF9FF_0%,#F8F2FA_48%,#DFF7FF_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[size:86px_86px]" />

          <h1 className="absolute left-7 top-8 z-10 max-w-[340px] text-[38px] font-light leading-tight tracking-tight text-[#111C24] sm:text-[52px]">
            Your Gratitude Journey
          </h1>

          {active && (
            <button
              type="button"
              onClick={() => setSelected(0)}
              className="absolute right-[16%] top-[10%] z-20 max-w-[285px] rounded-2xl border border-white/70 bg-white/38 px-6 py-5 text-left text-[#243544] shadow-xl backdrop-blur-2xl"
            >
              {active.content}
            </button>
          )}

          <div className="absolute bottom-[18%] left-7 right-24 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {(visiblePosts.length ? visiblePosts : [{ id: 'empty-1', content: 'A simple cup of coffee in the quiet sun.' }, { id: 'empty-2', content: 'The smell of fresh rain this morning.' }] as any).slice(0, 4).map((post: any, i: number) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelected(i)}
                className="min-h-[84px] rounded-2xl border border-white/68 bg-white/34 px-5 py-4 text-left text-lg leading-snug text-[#243544] shadow-lg backdrop-blur-2xl transition-transform active:scale-[0.98]"
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
      </section>

      {showThemePicker && (
        <ThemePicker currentTheme={currentTheme || 'glass'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
      )}
    </main>
  )
}
