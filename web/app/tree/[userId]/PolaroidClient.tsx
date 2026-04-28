'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationProps } from './ZenClient'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

// Category color gradients for the "photo" area of each polaroid
const CATEGORY_GRADIENTS: Record<string, string> = {
  FAMILY:     'linear-gradient(135deg, #E8C8B8 0%, #D4907A 50%, #C07860 100%)',
  WORK:       'linear-gradient(135deg, #C0CCDC 0%, #8098B8 50%, #5878A0 100%)',
  SMALL_JOYS: 'linear-gradient(135deg, #F0E4B0 0%, #D8C060 50%, #C0A040 100%)',
  NATURE:     'linear-gradient(135deg, #C0D4B8 0%, #80AC70 50%, #507840 100%)',
  HEALTH:     'linear-gradient(135deg, #D0C0DC 0%, #A080C4 50%, #8060A8 100%)',
  OTHER:      'linear-gradient(135deg, #DCD4C8 0%, #B8A898 50%, #988878 100%)',
}

// Category emojis for the photo area
const CATEGORY_EMOJIS: Record<string, string> = {
  FAMILY: '👨‍👩‍👧', WORK: '✨', SMALL_JOYS: '💛', NATURE: '🌿', HEALTH: '💫', OTHER: '🤍',
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function getPolaroidTransform(idx: number) {
  const rng = seededRandom(idx * 31 + 17)
  const rotation = (rng() - 0.5) * 10 // −5° to +5°
  return rotation
}

export default function PolaroidClient({ user, posts, stats, isOwner, currentTheme }: VisualizationProps) {
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

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #F0E8D8 0%, #E8DEC8 40%, #DDD4C0 100%)' }}
    >
      {/* Subtle cork/linen texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #7A6040 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Owner theme switcher */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowThemePicker(true)}
            className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all"
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(160,140,120,0.3)',
              color: '#7A6A5A',
              backdropFilter: 'blur(8px)',
            }}
          >
            Change theme
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="text-[10px] tracking-[0.4em] uppercase mb-2"
            style={{ color: '#9E8E7A', fontFamily: 'Georgia, serif' }}
          >
            {posts.length === 0 ? 'An empty gallery' : `${posts.length} ${posts.length === 1 ? 'memory' : 'memories'}`}
          </p>
          <h1
            className="text-large-title tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: '#3D2E26' }}
          >
            {user.name}&apos;s Gallery
          </h1>
          <p
            className="text-caption mt-1"
            style={{ color: '#B0A090', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
          >
            Every photo is a moment of gratitude
          </p>
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div
              className="inline-block px-8 py-10 bg-white shadow-md"
              style={{
                transform: 'rotate(-2.5deg)',
                boxShadow: '0 4px 18px rgba(58,46,36,0.14)',
                border: '1px solid rgba(200,190,175,0.5)',
              }}
            >
              <div className="w-32 h-28 bg-warm-cream-200 mx-auto mb-4 rounded-sm" style={{ background: 'linear-gradient(135deg, #E8DCC8 0%, #D4C8B0 100%)' }} />
              <p style={{ fontFamily: 'Georgia, serif', color: '#B0A090', fontSize: '13px', fontStyle: 'italic' }}>
                first memory awaits...
              </p>
            </div>
          </div>
        )}

        {/* Polaroid masonry grid */}
        {posts.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-5">
            {posts.map((post, i) => {
              const rotation = getPolaroidTransform(i)
              const gradient = CATEGORY_GRADIENTS[post.category] || CATEGORY_GRADIENTS.OTHER
              const isSelected = selectedIdx === i

              return (
                <div
                  key={post.id}
                  className="break-inside-avoid mb-5 inline-block w-full"
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  style={{
                    transform: `rotate(${isSelected ? rotation * 0.3 : rotation}deg) scale(${isSelected ? 1.04 : 1})`,
                    cursor: 'pointer',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformOrigin: 'center bottom',
                  }}
                >
                  <div
                    className="bg-white p-3"
                    style={{
                      boxShadow: isSelected
                        ? '0 14px 50px rgba(58,46,36,0.28), 0 4px 16px rgba(0,0,0,0.14)'
                        : '0 4px 18px rgba(58,46,36,0.16), 0 2px 6px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(200,188,172,0.5)',
                      paddingBottom: '2rem',
                    }}
                  >
                    {/* Photo area */}
                    <div
                      className="w-full relative overflow-hidden"
                      style={{
                        aspectRatio: '1',
                        background: gradient,
                        borderRadius: '1px',
                      }}
                    >
                      {/* Abstract SVG pattern overlay */}
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" style={{ opacity: 0.22 }}>
                        <circle
                          cx={25 + (i * 13) % 40}
                          cy={20 + (i * 7) % 35}
                          r={18 + (i * 3) % 12}
                          fill="rgba(255,255,255,0.5)"
                        />
                        <circle
                          cx={70 - (i * 11) % 30}
                          cy={72 + (i * 5) % 20}
                          r={22 + (i * 4) % 14}
                          fill="rgba(0,0,0,0.15)"
                        />
                        <rect
                          x={38 + (i * 6) % 18}
                          y={38 + (i * 5) % 20}
                          width="24"
                          height="18"
                          rx="3"
                          fill="rgba(255,255,255,0.25)"
                          transform={`rotate(${(i * 22) % 45}, 50, 47)`}
                        />
                      </svg>
                      {/* Category emoji */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: `${1.4 + (i % 3) * 0.3}rem`, opacity: 0.55, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }}>
                          {CATEGORY_EMOJIS[post.category] || '🤍'}
                        </span>
                      </div>
                    </div>

                    {/* Caption */}
                    <p
                      className="text-center mt-2 leading-relaxed"
                      style={{
                        fontFamily: 'Georgia, serif',
                        color: '#5A4A3A',
                        fontSize: '11px',
                        maxHeight: '48px',
                        overflow: 'hidden',
                      }}
                    >
                      {post.content}
                    </p>
                    <p
                      className="text-center mt-1"
                      style={{ fontFamily: 'Georgia, serif', color: '#B0A090', fontSize: '9px', fontStyle: 'italic' }}
                    >
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-12 py-5">
          {[
            { value: stats.totalPosts, label: 'Photos' },
            { value: stats.totalHearts, label: 'Hearts' },
            { value: stats.currentStreak, label: 'Day Streak' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-title-2" style={{ fontFamily: 'Georgia, serif', color: '#4A3A2A' }}>{value}</p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: '#9E8E7A' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-full text-subheadline transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(160,140,120,0.3)',
              color: '#7A6A5A',
              fontFamily: 'Georgia, serif',
            }}
          >
            {showShareTip ? '✓ Copied!' : '🔗 Share gallery'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full text-subheadline font-medium text-white transition-all active:scale-[0.97]"
            style={{ background: '#C4704B', boxShadow: '0 4px 16px rgba(196,112,75,0.3)', fontFamily: 'Georgia, serif' }}
          >
            Make your own
          </a>
        </div>

        {/* Milestones */}
        <div className="mt-10 px-2">
          <p className="text-[10px] tracking-[0.35em] uppercase text-center mb-4" style={{ color: '#B0A090', fontFamily: 'Georgia, serif' }}>
            The collection grows
          </p>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'rgba(160,140,120,0.22)' }} />
            <div
              className="absolute top-4 left-0 h-px transition-all duration-1000"
              style={{ width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%`, background: '#C4704B' }}
            />
            <div className="flex items-start justify-between relative">
              {[
                { n: 0, label: 'Empty', emoji: '📷' },
                { n: 5, label: 'First roll', emoji: '🎞️' },
                { n: 15, label: 'Album', emoji: '📸' },
                { n: 30, label: 'Gallery', emoji: '🖼️' },
                { n: 60, label: 'Archive', emoji: '📚' },
                { n: 100, label: 'Museum', emoji: '🏛️' },
              ].map((m) => {
                const reached = stats.totalPosts >= m.n
                return (
                  <div key={m.n} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${reached ? 'scale-110' : 'opacity-30 grayscale'}`}
                      style={reached
                        ? { background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 12px rgba(196,112,75,0.2)' }
                        : { background: 'rgba(255,255,255,0.32)' }}
                    >
                      {m.emoji}
                    </div>
                    <span
                      className="text-[9px] tracking-wider uppercase"
                      style={{ color: reached ? '#7A6A5A' : '#C0B0A0', fontFamily: 'Georgia, serif' }}
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

      {/* Full-screen selected post modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(30,20,10,0.72)', backdropFilter: 'blur(5px)' }}
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative max-w-xs w-full bg-white p-4"
            style={{
              boxShadow: '0 28px 90px rgba(0,0,0,0.32)',
              paddingBottom: '3.5rem',
              transform: `rotate(${getPolaroidTransform(selectedIdx!) * 0.3}deg)`,
              animation: 'polaroidReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo area */}
            <div
              className="w-full relative overflow-hidden"
              style={{
                aspectRatio: '1',
                background: CATEGORY_GRADIENTS[selectedPost.category] || CATEGORY_GRADIENTS.OTHER,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: '3rem', opacity: 0.5 }}>
                  {CATEGORY_EMOJIS[selectedPost.category] || '🤍'}
                </span>
              </div>
            </div>

            {/* Caption area */}
            <div className="mt-3 text-center">
              <p
                className="text-body leading-relaxed italic"
                style={{ fontFamily: 'Georgia, serif', color: '#3D2E26' }}
              >
                &ldquo;{selectedPost.content}&rdquo;
              </p>
              {selectedPost.feeling && (
                <p className="text-footnote mt-2 italic" style={{ color: '#9E8E7A', fontFamily: 'Georgia, serif' }}>
                  Feeling {selectedPost.feeling}
                </p>
              )}
              <div
                className="flex items-center justify-between mt-3 pt-2"
                style={{ borderTop: '1px solid rgba(200,188,172,0.4)' }}
              >
                <p className="text-caption" style={{ color: '#B0A090', fontFamily: 'Georgia, serif' }}>
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
                {selectedPost.heartCount > 0 && (
                  <p className="text-caption" style={{ color: '#B0A090' }}>♥ {selectedPost.heartCount}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-sm"
              style={{ color: '#9E8E7A', background: 'rgba(0,0,0,0.07)' }}
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
          style={{ background: 'rgba(30,20,10,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ background: '#FAF6F0', border: '1px solid rgba(160,140,120,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ThemePicker currentTheme={currentTheme || 'polaroid'} onClose={() => setShowThemePicker(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes polaroidReveal {
          0% { transform: scale(0.82) rotate(-6deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
