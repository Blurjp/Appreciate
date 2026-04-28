'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

// Vivid accent colors per category for glass card borders/glows
const CATEGORY_ACCENTS: Record<string, { color: string; glow: string; label: string }> = {
  FAMILY:     { color: '#FF8FA3', glow: 'rgba(255,143,163,0.25)', label: 'Family' },
  WORK:       { color: '#74B9FF', glow: 'rgba(116,185,255,0.25)', label: 'Work' },
  SMALL_JOYS: { color: '#FFD580', glow: 'rgba(255,213,128,0.25)', label: 'Small Joys' },
  NATURE:     { color: '#55EFC4', glow: 'rgba(85,239,196,0.25)', label: 'Nature' },
  HEALTH:     { color: '#C39BD3', glow: 'rgba(195,155,211,0.25)', label: 'Health' },
  OTHER:      { color: '#74D7FF', glow: 'rgba(116,215,255,0.25)', label: 'Other' },
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Each card gets a subtle float animation offset
function getFloatDelay(idx: number): number {
  const rng = seededRandom(idx * 23 + 11)
  return rng() * 6
}

function getFloatDuration(idx: number): number {
  const rng = seededRandom(idx * 37 + 7)
  return 4 + rng() * 4
}

export default function GlassClient({ user, posts, stats, isOwner, currentTheme }: VisualizationProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showShareTip, setShowShareTip] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)

  const selectedPost = selectedIdx !== null ? posts[selectedIdx] : null

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowShareTip(true)
      setTimeout(() => setShowShareTip(false), 2000)
    } catch {}
  }, [])

  const wallDescription = (() => {
    const n = posts.length
    if (n === 0) return 'An empty sky, waiting for light'
    if (n < 5) return 'The first glimmers of gratitude'
    if (n < 15) return 'A constellation of moments'
    if (n < 30) return 'Luminous fragments of wonder'
    if (n < 60) return 'An ethereal tapestry of light'
    return 'An infinite luminous expanse'
  })()

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E1628 30%, #14203A 60%, #0A0E1A 100%)' }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw',
            top: '-20%', left: '-10%',
            background: 'radial-gradient(circle, rgba(100,60,200,0.18) 0%, transparent 70%)',
            animation: 'glassOrb1 12s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw', height: '50vw',
            bottom: '-15%', right: '-10%',
            background: 'radial-gradient(circle, rgba(40,120,220,0.16) 0%, transparent 70%)',
            animation: 'glassOrb2 15s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '40vw', height: '40vw',
            top: '40%', left: '40%',
            background: 'radial-gradient(circle, rgba(20,180,140,0.10) 0%, transparent 70%)',
            animation: 'glassOrb3 10s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Owner theme switcher */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowThemePicker(true)}
            className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
              color: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
            }}
          >
            Change theme
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: 'rgba(200,210,255,0.35)' }}>
            {wallDescription}
          </p>
          <h1
            className="text-large-title tracking-tight"
            style={{ color: 'rgba(255,255,255,0.90)', textShadow: '0 0 60px rgba(120,100,255,0.2)' }}
          >
            {user.name}&apos;s Wall
          </h1>
          <p className="text-caption mt-1" style={{ color: 'rgba(200,210,255,0.35)' }}>
            Every card is a floating moment of gratitude
          </p>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div
              className="inline-block px-10 py-8 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
              }}
            >
              <p style={{ color: 'rgba(200,210,255,0.35)', fontSize: '14px', fontStyle: 'italic' }}>
                first light awaits...
              </p>
            </div>
          </div>
        )}

        {/* Glass card grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => {
              const accent = CATEGORY_ACCENTS[post.category] || CATEGORY_ACCENTS.OTHER
              const isSelected = selectedIdx === i
              const floatDelay = getFloatDelay(i)
              const floatDuration = getFloatDuration(i)

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  className="relative rounded-2xl p-5 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid rgba(255,255,255,${isSelected ? '0.22' : '0.10'})`,
                    boxShadow: isSelected
                      ? `0 0 0 1px ${accent.color}40, 0 12px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`
                      : `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)`,
                    animation: !isSelected ? `glassFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite alternate` : 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Accent top border */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent.color}60, transparent)` }}
                  />

                  {/* Category label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accent.color, boxShadow: `0 0 8px ${accent.color}` }}
                    />
                    <span className="text-[9px] tracking-[0.22em] uppercase" style={{ color: accent.color, opacity: 0.85 }}>
                      {accent.label}
                    </span>
                  </div>

                  {/* Content */}
                  <p
                    className="text-body leading-relaxed"
                    style={{
                      color: 'rgba(255,255,255,0.82)',
                      maxHeight: '80px',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px]" style={{ color: 'rgba(200,210,255,0.28)' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </p>
                    {post.heartCount > 0 && (
                      <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(200,210,255,0.28)' }}>
                        <span style={{ color: accent.color, opacity: 0.7 }}>♥</span>
                        {post.heartCount}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-12 py-5">
          {[
            { value: stats.totalPosts, label: 'Cards' },
            { value: stats.totalHearts, label: 'Hearts' },
            { value: stats.currentStreak, label: 'Day Streak' },
          ].map(({ value, label }, i) => (
            <div key={label} className="text-center">
              <p
                className="text-title-2"
                style={{ color: 'rgba(255,255,255,0.80)', textShadow: '0 0 20px rgba(120,100,255,0.12)' }}
              >
                {value}
              </p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: 'rgba(200,210,255,0.3)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-full text-subheadline transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {showShareTip ? '✓ Copied!' : '🔗 Share wall'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full text-subheadline font-medium transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(100,80,220,0.5) 0%, rgba(60,100,220,0.5) 100%)',
              border: '1px solid rgba(140,120,255,0.3)',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(100,80,220,0.25)',
            }}
          >
            Light your own
          </a>
        </div>

        {/* Milestones */}
        <div className="mt-10 px-2">
          <p className="text-[10px] tracking-[0.35em] uppercase text-center mb-4" style={{ color: 'rgba(200,210,255,0.2)' }}>
            Luminous milestones
          </p>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div
              className="absolute top-4 left-0 h-px transition-all duration-1000"
              style={{
                width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%`,
                background: 'linear-gradient(90deg, rgba(100,80,220,0.5) 0%, rgba(140,120,255,0.7) 100%)',
                boxShadow: '0 0 8px rgba(140,120,255,0.3)',
              }}
            />
            <div className="flex items-start justify-between relative">
              {[
                { n: 0, label: 'Dark', emoji: '🌑' },
                { n: 5, label: 'Spark', emoji: '✨' },
                { n: 15, label: 'Glow', emoji: '💫' },
                { n: 30, label: 'Bright', emoji: '⭐' },
                { n: 60, label: 'Radiant', emoji: '🌟' },
                { n: 100, label: 'Nova', emoji: '🌠' },
              ].map((m) => {
                const reached = stats.totalPosts >= m.n
                return (
                  <div key={m.n} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${reached ? 'scale-110' : 'opacity-25 grayscale'}`}
                      style={reached
                        ? { background: 'rgba(255,255,255,0.08)', boxShadow: '0 0 14px rgba(140,120,255,0.25)' }
                        : { background: 'rgba(255,255,255,0.03)' }}
                    >
                      {m.emoji}
                    </div>
                    <span
                      className="text-[9px] tracking-wider uppercase"
                      style={{ color: reached ? 'rgba(200,210,255,0.45)' : 'rgba(200,210,255,0.15)' }}
                    >
                      {m.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected post fullscreen modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(5,8,20,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative max-w-md w-full rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(32px)',
              border: `1px solid ${(CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color}40`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
              animation: 'glassReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent top border */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${(CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color}80, transparent)` }}
            />

            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: (CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color,
                  boxShadow: `0 0 10px ${(CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color}`,
                }}
              />
              <span
                className="text-[10px] tracking-[0.22em] uppercase"
                style={{ color: (CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color }}
              >
                {(CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).label}
              </span>
            </div>

            {/* Content */}
            <p
              className="text-body leading-relaxed font-serif italic"
              style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.88)' }}
            >
              &ldquo;{selectedPost.content}&rdquo;
            </p>

            {selectedPost.feeling && (
              <p className="text-footnote mt-3 italic" style={{ color: 'rgba(200,210,255,0.4)' }}>
                Feeling {selectedPost.feeling}
              </p>
            )}

            <div
              className="flex items-center justify-between mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-caption" style={{ color: 'rgba(200,210,255,0.28)' }}>
                {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
              {selectedPost.heartCount > 0 && (
                <p className="text-caption flex items-center gap-1" style={{ color: 'rgba(200,210,255,0.28)' }}>
                  <span style={{ color: (CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color, opacity: 0.7 }}>♥</span>
                  {selectedPost.heartCount}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all"
              style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)' }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Theme Picker overlay */}
      {showThemePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(5,8,20,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{
              background: 'rgba(20,26,50,0.95)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ThemePicker currentTheme={currentTheme || 'glass'} onClose={() => setShowThemePicker(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes glassOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8vw, 6vh) scale(1.15); }
        }
        @keyframes glassOrb2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6vw, -8vh) scale(1.1); }
        }
        @keyframes glassOrb3 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-4vw, 5vh) scale(1.08); }
        }
        @keyframes glassFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-6px); }
        }
        @keyframes glassReveal {
          0% { transform: scale(0.88); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
