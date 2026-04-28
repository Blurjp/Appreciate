'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

interface TreePost {
  id: string
  content: string
  feeling: string | null
  category: string
  createdAt: string
  heartCount: number
}

interface TreeUser {
  id: string
  name: string
  avatarUrl: string | null
}

interface TreeStats {
  totalPosts: number
  totalHearts: number
  currentStreak: number
  longestStreak: number
}

export interface VisualizationProps {
  user: TreeUser
  posts: TreePost[]
  stats: TreeStats
  isOwner?: boolean
  currentTheme?: string
}

// Category → zen element type and colors
const ZEN_ELEMENTS: Record<string, { type: 'stone' | 'plant' | 'flower'; color: string; altColor: string }> = {
  FAMILY:     { type: 'flower', color: '#D4A5A5', altColor: '#E8C4B8' },
  WORK:       { type: 'stone',  color: '#8B9FAA', altColor: '#A0B2BC' },
  SMALL_JOYS: { type: 'flower', color: '#E0C070', altColor: '#F0DDAA' },
  NATURE:     { type: 'plant',  color: '#6B8F5E', altColor: '#8BAD7A' },
  HEALTH:     { type: 'plant',  color: '#7A9E8F', altColor: '#96B8A8' },
  OTHER:      { type: 'stone',  color: '#A0967A', altColor: '#BCB090' },
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateZenPositions(posts: TreePost[]) {
  const rng = seededRandom(42)
  return posts.map((post) => {
    const elem = ZEN_ELEMENTS[post.category] || ZEN_ELEMENTS.OTHER
    // Stones lean right, plants/flowers lean left, but with overlap for natural feel
    const isRightBias = elem.type === 'stone'
    const x = isRightBias
      ? 600 + rng() * 500
      : 80 + rng() * 650
    const y = 70 + rng() * 540
    const size = elem.type === 'stone' ? 16 + rng() * 22 : 10 + rng() * 14
    const rotation = (rng() - 0.5) * 28
    const delay = rng() * 5
    return { x, y, size, rotation, elem, delay }
  })
}

export default function ZenClient({ user, posts, stats, isOwner, currentTheme }: VisualizationProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showShareTip, setShowShareTip] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)

  const zenPositions = useMemo(() => generateZenPositions(posts), [posts])
  const selectedPost = selectedIdx !== null ? posts[selectedIdx] : null

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowShareTip(true)
      setTimeout(() => setShowShareTip(false), 2000)
    } catch {}
  }, [])

  const gardenDescription = useMemo(() => {
    const n = posts.length
    if (n === 0) return 'An empty garden, waiting to bloom'
    if (n < 5) return 'First seeds of gratitude'
    if (n < 15) return 'A garden taking shape'
    if (n < 30) return 'A peaceful sanctuary grows'
    if (n < 60) return 'A lush zen retreat'
    return 'A garden of infinite peace'
  }, [posts.length])

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F5F0E8 0%, #EDE8DC 40%, #E4DDD0 100%)' }}
    >
      {/* Floating pollen particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => {
          const rng = seededRandom(i * 77 + 3)
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 3 + rng() * 4,
                height: 3 + rng() * 4,
                left: `${rng() * 100}%`,
                top: `${rng() * 100}%`,
                backgroundColor: ['#8BAD7A', '#6B8F5E', '#A0967A', '#8B9FAA', '#D4A5A5'][i % 5],
                opacity: 0.1 + rng() * 0.15,
                animation: `zenFloat ${12 + rng() * 10}s ease-in-out ${rng() * 6}s infinite alternate`,
              }}
            />
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: '#8B7B6A' }}>
            {gardenDescription}
          </p>
          <h1
            className="text-large-title tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: '#3D2E26' }}
          >
            {user.name}&apos;s Zen Garden
          </h1>
          <p className="text-caption mt-1" style={{ color: '#9E8E7A' }}>
            Each stone and flower is a moment of peace
          </p>
        </div>

        {/* Garden SVG */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: '#EDE4D0',
            boxShadow: '0 8px 40px rgba(58,46,36,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
            border: '1px solid rgba(160,140,120,0.25)',
          }}
        >
          {/* Owner theme switcher */}
          {isOwner && (
            <button
              onClick={() => setShowThemePicker(true)}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(160,140,120,0.3)',
                color: '#7A6A5A',
                backdropFilter: 'blur(8px)',
              }}
            >
              Change theme
            </button>
          )}

          <svg
            viewBox="0 0 1200 700"
            className="w-full"
            style={{ minHeight: 460 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="zenSandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2E8D5" />
                <stop offset="100%" stopColor="#E4D8C0" />
              </linearGradient>
              <radialGradient id="zenStoneHighlight" cx="30%" cy="30%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              <style>{`
                @keyframes zenFloat {
                  0% { transform: translateY(0) rotate(0deg); }
                  100% { transform: translateY(-14px) rotate(8deg); }
                }
                @keyframes zenRipple {
                  0% { r: 6; opacity: 0.45; }
                  100% { r: 32; opacity: 0; }
                }
                @keyframes zenPulse {
                  0%, 100% { opacity: 0.25; }
                  50% { opacity: 0.5; }
                }
              `}</style>
            </defs>

            {/* Sand base */}
            <rect x="0" y="0" width="1200" height="700" fill="url(#zenSandGrad)" />

            {/* Raked sand lines — gentle horizontal waves */}
            {Array.from({ length: 22 }).map((_, i) => {
              const y = 30 + i * 30
              const waveAmp = 5 + Math.sin(i * 0.8) * 4
              const waveFreq = 0.004 + Math.sin(i * 0.3) * 0.001
              const d = `M40 ${y} ` +
                Array.from({ length: 24 }, (_, j) => {
                  const px = 40 + j * 50
                  const py = y + Math.sin(px * waveFreq + i * 0.5) * waveAmp
                  return `L${px} ${py}`
                }).join(' ') +
                ` L1160 ${y}`
              return (
                <path
                  key={`rake-${i}`}
                  d={d}
                  stroke="rgba(200,185,160,0.5)"
                  strokeWidth="0.8"
                  fill="none"
                  opacity={0.4 + Math.sin(i * 0.4) * 0.15}
                />
              )
            })}

            {/* Corner decorative boulders */}
            <ellipse cx="55" cy="55" rx="42" ry="34" fill="#A09080" opacity="0.35" />
            <ellipse cx="55" cy="55" rx="42" ry="34" fill="url(#zenStoneHighlight)" opacity="0.4" />
            <ellipse cx="1145" cy="55" rx="38" ry="30" fill="#A09080" opacity="0.30" />
            <ellipse cx="1145" cy="55" rx="38" ry="30" fill="url(#zenStoneHighlight)" opacity="0.4" />
            <ellipse cx="55" cy="645" rx="40" ry="32" fill="#A09080" opacity="0.30" />
            <ellipse cx="1145" cy="645" rx="36" ry="28" fill="#A09080" opacity="0.28" />

            {/* Water feature — upper right */}
            <ellipse cx="980" cy="140" rx="110" ry="72" fill="rgba(140,175,195,0.12)" stroke="rgba(140,175,195,0.22)" strokeWidth="1" />
            <ellipse cx="980" cy="140" rx="70" ry="46" fill="rgba(160,195,215,0.08)" />
            <circle cx="980" cy="140" r="10" fill="none" stroke="rgba(160,200,220,0.35)" strokeWidth="1">
              <animate attributeName="r" values="10;40" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="980" cy="140" r="6" fill="none" stroke="rgba(160,200,220,0.28)" strokeWidth="1">
              <animate attributeName="r" values="6;28" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
            </circle>
            <text x="980" y="144" textAnchor="middle" fontSize="10" fill="rgba(160,200,220,0.5)" fontFamily="Georgia, serif" fontStyle="italic">池</text>

            {/* Bamboo grove — right edge */}
            {[0, 1, 2, 3].map((i) => {
              const bx = 1085 + i * 25
              return (
                <g key={`bamboo-${i}`} opacity={0.35 - i * 0.04}>
                  <line x1={bx} y1="700" x2={bx + (i % 2 === 0 ? 3 : -3)} y2="320" stroke="#6B8F5E" strokeWidth={5 - i * 0.8} />
                  {[340, 400, 460, 520, 580, 640].map((by, j) => (
                    <ellipse key={j} cx={bx + (j % 2 === 0 ? 8 : -8)} cy={by} rx={14 - i * 1.5} ry={5} fill="#8BAD7A" opacity="0.55" />
                  ))}
                  {/* Node marks */}
                  {[360, 430, 500, 570, 640].map((by) => (
                    <line key={by} x1={bx - 4} y1={by} x2={bx + 4} y2={by} stroke="#558040" strokeWidth="1.5" opacity="0.5" />
                  ))}
                </g>
              )
            })}

            {/* Path divider — very subtle */}
            <line x1="700" y1="40" x2="700" y2="660" stroke="rgba(190,170,140,0.18)" strokeWidth="1.5" strokeDasharray="10 16" />

            {/* Empty garden hint */}
            {posts.length === 0 && (
              <g>
                <ellipse cx="560" cy="370" rx="90" ry="60" fill="none" stroke="rgba(160,140,110,0.25)" strokeWidth="1.5" strokeDasharray="8 14" />
                <text x="560" y="365" textAnchor="middle" fill="rgba(140,120,95,0.4)" fontSize="16" fontFamily="Georgia, serif" fontStyle="italic">first moment</text>
                <text x="560" y="385" textAnchor="middle" fill="rgba(140,120,95,0.3)" fontSize="13" fontFamily="Georgia, serif" fontStyle="italic">awaits</text>
              </g>
            )}

            {/* Zen elements — stones, plants, flowers */}
            {zenPositions.map((pos, i) => {
              const post = posts[i]
              if (!post) return null
              const isSelected = selectedIdx === i
              const { elem } = pos
              const activeScale = isSelected ? 1.35 : 1

              if (elem.type === 'stone') {
                return (
                  <g
                    key={post.id}
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation}) scale(${activeScale})`}
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                  >
                    {isSelected && (
                      <ellipse rx={pos.size * 1.9} ry={pos.size * 1.35} fill={elem.color} opacity="0.18">
                        <animate attributeName="rx" values={`${pos.size * 1.7};${pos.size * 2.1};${pos.size * 1.7}`} dur="2s" repeatCount="indefinite" />
                      </ellipse>
                    )}
                    {/* Shadow */}
                    <ellipse cx="2" cy={pos.size * 0.55} rx={pos.size * 0.9} ry={pos.size * 0.25} fill="rgba(0,0,0,0.08)" />
                    {/* Stone body */}
                    <ellipse rx={pos.size} ry={pos.size * 0.68} fill={elem.color} stroke="rgba(80,60,40,0.08)" strokeWidth="0.5" />
                    <ellipse rx={pos.size} ry={pos.size * 0.68} fill="url(#zenStoneHighlight)" opacity="0.55" />
                    {/* Stone texture line */}
                    <path
                      d={`M${-pos.size * 0.5} ${-pos.size * 0.1} Q0 ${pos.size * 0.05} ${pos.size * 0.4} ${pos.size * 0.1}`}
                      stroke="rgba(0,0,0,0.08)"
                      strokeWidth="0.7"
                      fill="none"
                    />
                  </g>
                )
              }

              if (elem.type === 'plant') {
                return (
                  <g
                    key={post.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <circle r={pos.size * 2.2} fill={elem.color} opacity="0.12">
                        <animate attributeName="r" values={`${pos.size * 1.8};${pos.size * 2.5};${pos.size * 1.8}`} dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Stem */}
                    <path
                      d={`M0 0 Q${pos.size * 0.22} ${-pos.size * 0.55} 0 ${-pos.size * 1.3}`}
                      stroke={elem.color}
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Left leaf */}
                    <ellipse
                      cx={-pos.size * 0.45}
                      cy={-pos.size * 0.65}
                      rx={pos.size * 0.52}
                      ry={pos.size * 0.22}
                      fill={elem.color}
                      transform={`rotate(-35, ${-pos.size * 0.45}, ${-pos.size * 0.65})`}
                      opacity="0.9"
                    />
                    {/* Right leaf */}
                    <ellipse
                      cx={pos.size * 0.42}
                      cy={-pos.size * 0.85}
                      rx={pos.size * 0.5}
                      ry={pos.size * 0.22}
                      fill={elem.altColor}
                      transform={`rotate(35, ${pos.size * 0.42}, ${-pos.size * 0.85})`}
                      opacity="0.85"
                    />
                    {/* Top leaf */}
                    <ellipse
                      cx="0"
                      cy={-pos.size * 1.28}
                      rx={pos.size * 0.38}
                      ry={pos.size * 0.22}
                      fill={elem.color}
                      opacity="0.95"
                    />
                  </g>
                )
              }

              // flower
              return (
                <g
                  key={post.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && (
                    <circle r={pos.size * 2.8} fill={elem.color} opacity="0.14">
                      <animate attributeName="r" values={`${pos.size * 2.2};${pos.size * 3.2};${pos.size * 2.2}`} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Stem */}
                  <path
                    d={`M0 0 Q${pos.size * 0.2} ${-pos.size * 0.65} 0 ${-pos.size * 1.55}`}
                    stroke="#6B8F5E"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Small stem leaf */}
                  <ellipse
                    cx={pos.size * 0.35}
                    cy={-pos.size * 0.7}
                    rx={pos.size * 0.32}
                    ry={pos.size * 0.14}
                    fill="#6B8F5E"
                    transform={`rotate(25, ${pos.size * 0.35}, ${-pos.size * 0.7})`}
                    opacity="0.7"
                  />
                  {/* Petals */}
                  {[0, 60, 120, 180, 240, 300].map((angle) => {
                    const rad = (angle * Math.PI) / 180
                    const px = Math.cos(rad) * pos.size * 0.72
                    const py = -pos.size * 1.55 + Math.sin(rad) * pos.size * 0.72
                    return (
                      <ellipse
                        key={angle}
                        cx={px}
                        cy={py}
                        rx={pos.size * 0.38}
                        ry={pos.size * 0.52}
                        fill={elem.color}
                        transform={`rotate(${angle}, ${px}, ${py})`}
                        opacity="0.82"
                      />
                    )
                  })}
                  {/* Center */}
                  <circle cx="0" cy={-pos.size * 1.55} r={pos.size * 0.32} fill="#F0D080" />
                  <circle cx="0" cy={-pos.size * 1.55} r={pos.size * 0.16} fill="#E0B040" />
                </g>
              )
            })}

            {/* Count badge */}
            <g transform="translate(1120, 42)">
              <rect x="-48" y="-16" width="96" height="32" rx="16" fill="rgba(255,255,255,0.72)" stroke="rgba(160,140,120,0.22)" strokeWidth="0.5" />
              <text textAnchor="middle" y="5" fontSize="13" fill="#7A6A5A" fontFamily="Georgia, serif">
                🪨 {posts.length}
              </text>
            </g>
          </svg>

          {/* Selected element detail panel */}
          {selectedPost && (
            <div
              className="absolute bottom-4 left-4 right-4 rounded-2xl p-5"
              style={{
                background: 'rgba(250,246,240,0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(160,140,120,0.28)',
                boxShadow: '0 6px 30px rgba(58,46,36,0.12)',
                animation: 'zenSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: '#8B7B6A' }}>
                  {selectedPost.category.replace('_', ' ').toLowerCase()}
                </span>
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-sm"
                  style={{ color: '#9E8E7A', background: 'rgba(0,0,0,0.05)' }}
                >
                  ×
                </button>
              </div>
              <p
                className="text-body leading-relaxed italic"
                style={{ fontFamily: 'Georgia, serif', color: '#3D2E26' }}
              >
                &ldquo;{selectedPost.content}&rdquo;
              </p>
              {selectedPost.feeling && (
                <p className="text-footnote mt-2 italic" style={{ color: '#9E8E7A' }}>
                  Feeling {selectedPost.feeling}
                </p>
              )}
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(160,140,120,0.2)' }}
              >
                <p className="text-caption" style={{ color: '#B0A090' }}>
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
                {selectedPost.heartCount > 0 && (
                  <p className="text-caption flex items-center gap-1" style={{ color: '#B0A090' }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#C4704B" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {selectedPost.heartCount}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 py-5">
          {[
            { value: stats.totalPosts, label: 'Elements' },
            { value: stats.totalHearts, label: 'Hearts' },
            { value: stats.currentStreak, label: 'Day Streak' },
          ].map(({ value, label }, i) => (
            <div key={label} className="text-center">
              {i > 0 && <div className="hidden" />}
              <p className="text-title-2" style={{ fontFamily: 'Georgia, serif', color: '#4A3A2A' }}>{value}</p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-1" style={{ color: '#9E8E7A' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-full text-subheadline transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(160,140,120,0.28)',
              color: '#7A6A5A',
            }}
          >
            {showShareTip ? '✓ Copied!' : '🔗 Share garden'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full text-subheadline font-medium text-white transition-all active:scale-[0.97]"
            style={{ background: '#8B7B6A', boxShadow: '0 4px 16px rgba(139,123,106,0.3)' }}
          >
            Tend your own
          </a>
        </div>

        {/* Milestones */}
        <div className="mt-10 px-2">
          <p className="text-[10px] tracking-[0.35em] uppercase text-center mb-4" style={{ color: '#B0A090' }}>
            Garden seasons
          </p>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'rgba(160,140,120,0.22)' }} />
            <div
              className="absolute top-4 left-0 h-px transition-all duration-1000"
              style={{
                width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%`,
                background: 'linear-gradient(90deg, #A09080 0%, #8B7B6A 100%)',
              }}
            />
            <div className="flex items-start justify-between relative">
              {[
                { n: 0, label: 'Bare', emoji: '🏜️' },
                { n: 5, label: 'Sprout', emoji: '🌱' },
                { n: 15, label: 'Garden', emoji: '🌿' },
                { n: 30, label: 'Blooming', emoji: '🌸' },
                { n: 60, label: 'Oasis', emoji: '🌴' },
                { n: 100, label: 'Paradise', emoji: '🌺' },
              ].map((m) => {
                const reached = stats.totalPosts >= m.n
                return (
                  <div key={m.n} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${reached ? 'scale-110' : 'opacity-30 grayscale'}`}
                      style={reached
                        ? { background: 'rgba(255,255,255,0.82)', boxShadow: '0 2px 10px rgba(139,123,106,0.22)' }
                        : { background: 'rgba(255,255,255,0.32)' }}
                    >
                      {m.emoji}
                    </div>
                    <span
                      className="text-[9px] tracking-wider uppercase"
                      style={{ color: reached ? '#7A6A5A' : '#C0B0A0' }}
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

      {/* Theme Picker overlay */}
      {showThemePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(30,20,10,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ background: '#FAF6F0', border: '1px solid rgba(160,140,120,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ThemePicker currentTheme={currentTheme || 'zen'} onClose={() => setShowThemePicker(false)} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes zenSlideUp {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
