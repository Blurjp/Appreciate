'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

// Soft accent colors per category for airy glass card borders/glows
const CATEGORY_ACCENTS: Record<string, { color: string; glow: string; label: string }> = {
  FAMILY:     { color: '#D97992', glow: 'rgba(217,121,146,0.18)', label: 'Family' },
  WORK:       { color: '#4E8FCC', glow: 'rgba(78,143,204,0.18)', label: 'Work' },
  SMALL_JOYS: { color: '#D7A84F', glow: 'rgba(215,168,79,0.18)', label: 'Small Joys' },
  NATURE:     { color: '#4D9B7F', glow: 'rgba(77,155,127,0.18)', label: 'Nature' },
  HEALTH:     { color: '#9C7BC0', glow: 'rgba(156,123,192,0.18)', label: 'Health' },
  OTHER:      { color: '#4B9FC2', glow: 'rgba(75,159,194,0.18)', label: 'Other' },
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
    } catch {}
  }, [])

  useEffect(() => {
    if (!showShareTip) return
    const timer = setTimeout(() => setShowShareTip(false), 2000)
    return () => clearTimeout(timer)
  }, [showShareTip])

  const wallDescription = (() => {
    const n = posts.length
    if (n === 0) return 'A quiet canvas, waiting for light'
    if (n < 5) return 'The first glass notes of gratitude'
    if (n < 15) return 'Soft fragments begin to gather'
    if (n < 30) return 'A luminous gratitude journey'
    if (n < 60) return 'An ethereal wall of remembered light'
    return 'An expansive field of gratitude'
  })()

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ECF8FF 0%, #F9F2FA 36%, #E2F7F8 68%, #DDEBFF 100%)' }}
    >
      {/* Soft prismatic wash */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: 'absolute',
            inset: '-20%',
            background:
              'linear-gradient(120deg, rgba(120,205,232,0.24), transparent 34%, rgba(255,192,214,0.22) 58%, transparent 78%), linear-gradient(25deg, transparent 10%, rgba(178,223,196,0.20) 38%, transparent 65%)',
            filter: 'blur(30px)',
            animation: 'glassDrift 18s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 16%, black 82%, transparent 100%)',
            opacity: 0.38,
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
              border: '1px solid rgba(255,255,255,0.55)',
              color: '#4C6E7F',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(82,123,145,0.12)',
            }}
          >
            Change theme
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: 'rgba(68,101,116,0.52)' }}>
            {wallDescription}
          </p>
          <h1
            className="text-large-title tracking-tight"
            style={{ color: '#172D3A', textShadow: '0 20px 60px rgba(255,255,255,0.8)' }}
          >
            {user.name}&apos;s Gratitude Journey
          </h1>
          <p className="text-caption mt-1 max-w-md" style={{ color: 'rgba(52,82,96,0.58)' }}>
            Frosted notes floating over a soft field of remembered moments
          </p>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div
              className="inline-block px-10 py-8 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.46)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.58)',
                boxShadow: '0 20px 60px rgba(82,123,145,0.18)',
              }}
            >
              <p style={{ color: 'rgba(52,82,96,0.55)', fontSize: '14px', fontStyle: 'italic' }}>
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
                    background: 'rgba(255,255,255,0.40)',
                    backdropFilter: 'blur(22px) saturate(1.15)',
                    border: `1px solid rgba(255,255,255,${isSelected ? '0.82' : '0.54'})`,
                    boxShadow: isSelected
                      ? `0 0 0 1px ${accent.color}45, 0 22px 60px rgba(82,123,145,0.24), inset 0 1px 0 rgba(255,255,255,0.85)`
                      : `0 12px 36px rgba(82,123,145,0.15), inset 0 1px 0 rgba(255,255,255,0.70)`,
                    animation: !isSelected ? `glassFloat ${floatDuration}s ease-in-out ${floatDelay}s infinite alternate` : 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Accent top border */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent.color}80, transparent)` }}
                  />

                  {/* Category label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accent.color, boxShadow: `0 0 8px ${accent.color}` }}
                    />
                    <span className="text-[9px] tracking-[0.22em] uppercase" style={{ color: accent.color, opacity: 0.95 }}>
                      {accent.label}
                    </span>
                  </div>

                  {/* Content */}
                  <p
                    className="text-body leading-relaxed"
                    style={{
                      color: '#244050',
                      maxHeight: '80px',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(86,120,138,0.10)' }}>
                    <p className="text-[10px]" style={{ color: 'rgba(52,82,96,0.42)' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </p>
                    {post.heartCount > 0 && (
                      <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(52,82,96,0.42)' }}>
                        <span style={{ color: accent.color, opacity: 0.85 }}>♥</span>
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
                style={{ color: '#203A48', textShadow: '0 10px 30px rgba(255,255,255,0.75)' }}
              >
                {value}
              </p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: 'rgba(52,82,96,0.42)' }}>
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
              background: 'rgba(255,255,255,0.42)',
              border: '1px solid rgba(255,255,255,0.60)',
              color: '#45687A',
              backdropFilter: 'blur(12px)',
            }}
          >
            {showShareTip ? '✓ Copied!' : '🔗 Share wall'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full text-subheadline font-medium transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(63,148,183,0.78) 0%, rgba(164,121,189,0.64) 100%)',
              border: '1px solid rgba(255,255,255,0.48)',
              color: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(82,123,145,0.22)',
            }}
          >
            Light your own
          </a>
        </div>

        {/* Milestones */}
        <div className="mt-10 px-2">
          <p className="text-[10px] tracking-[0.35em] uppercase text-center mb-4" style={{ color: 'rgba(52,82,96,0.34)' }}>
            Luminous milestones
          </p>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'rgba(52,82,96,0.10)' }} />
            <div
              className="absolute top-4 left-0 h-px transition-all duration-1000"
              style={{
                width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%`,
                background: 'linear-gradient(90deg, rgba(63,148,183,0.55) 0%, rgba(164,121,189,0.68) 100%)',
                boxShadow: '0 0 10px rgba(63,148,183,0.18)',
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
                        ? { background: 'rgba(255,255,255,0.54)', boxShadow: '0 8px 20px rgba(82,123,145,0.16)' }
                        : { background: 'rgba(255,255,255,0.24)' }}
                    >
                      {m.emoji}
                    </div>
                    <span
                      className="text-[9px] tracking-wider uppercase"
                      style={{ color: reached ? 'rgba(52,82,96,0.55)' : 'rgba(52,82,96,0.20)' }}
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
          style={{ background: 'rgba(204,224,235,0.62)', backdropFilter: 'blur(10px)' }}
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative max-w-md w-full rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.56)',
              backdropFilter: 'blur(32px) saturate(1.15)',
              border: `1px solid ${(CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color}40`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.50), 0 24px 80px rgba(82,123,145,0.28), inset 0 1px 0 rgba(255,255,255,0.82)`,
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
              style={{ fontFamily: 'Georgia, serif', color: '#203A48' }}
            >
              &ldquo;{selectedPost.content}&rdquo;
            </p>

            {selectedPost.feeling && (
              <p className="text-footnote mt-3 italic" style={{ color: 'rgba(52,82,96,0.52)' }}>
                Feeling {selectedPost.feeling}
              </p>
            )}

            <div
              className="flex items-center justify-between mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(52,82,96,0.10)' }}
            >
              <p className="text-caption" style={{ color: 'rgba(52,82,96,0.46)' }}>
                {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
              {selectedPost.heartCount > 0 && (
                <p className="text-caption flex items-center gap-1" style={{ color: 'rgba(52,82,96,0.46)' }}>
                  <span style={{ color: (CATEGORY_ACCENTS[selectedPost.category] || CATEGORY_ACCENTS.OTHER).color, opacity: 0.7 }}>♥</span>
                  {selectedPost.heartCount}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all"
              style={{ color: 'rgba(52,82,96,0.42)', background: 'rgba(255,255,255,0.50)' }}
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
          style={{ background: 'rgba(204,224,235,0.62)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{
              background: 'rgba(248,252,255,0.92)',
              border: '1px solid rgba(255,255,255,0.62)',
              backdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ThemePicker currentTheme={currentTheme || 'glass'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes glassDrift {
          0% { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d(3%, 2%, 0) scale(1.04); }
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
