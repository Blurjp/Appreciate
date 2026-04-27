'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

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

interface Props {
  user: TreeUser
  posts: TreePost[]
  stats: TreeStats
}

// Category leaf colors — warm editorial palette
const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; glow: string }> = {
  FAMILY: { fill: '#D4917A', stroke: '#C4704B', glow: 'rgba(196,112,75,0.3)' },
  WORK: { fill: '#A85040', stroke: '#8B3A2A', glow: 'rgba(139,58,42,0.3)' },
  SMALL_JOYS: { fill: '#D4B87A', stroke: '#C4A35A', glow: 'rgba(196,163,90,0.3)' },
  NATURE: { fill: '#A3B08F', stroke: '#7D8C6E', glow: 'rgba(125,140,110,0.3)' },
  HEALTH: { fill: '#B5A5BA', stroke: '#9B8AA0', glow: 'rgba(155,138,160,0.3)' },
  OTHER: { fill: '#BBA898', stroke: '#A09080', glow: 'rgba(160,144,128,0.3)' },
}

const DEFAULT_COLOR = CATEGORY_COLORS.OTHER

function getLeafColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

// Seeded random for deterministic leaf placement
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate leaf positions in a tree canopy shape
function generateLeafPositions(count: number) {
  const leaves: { x: number; y: number; size: number; rotation: number; delay: number }[] = []
  const rng = seededRandom(42)

  // Tree center and canopy dimensions
  const cx = 400
  const canopyTop = 80
  const canopyBottom = 380
  const canopyWidth = 320

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(count - 1, 1) // 0..1 top to bottom

    // Y position — spread across canopy
    const y = canopyTop + t * (canopyBottom - canopyTop)

    // Width narrows at top and bottom (elliptical)
    const yNorm = (y - canopyTop) / (canopyBottom - canopyTop)
    const widthAtY = canopyWidth * Math.sin(yNorm * Math.PI) * (0.85 + rng() * 0.3)

    const x = cx + (rng() - 0.5) * widthAtY
    const size = 12 + rng() * 10
    const rotation = rng() * 360
    const delay = rng() * 3

    leaves.push({ x, y, size, rotation, delay })
  }

  return leaves
}

function LeafShape({ x, y, size, rotation, color, isHovered, onClick, delay, index }: {
  x: number; y: number; size: number; rotation: number
  color: { fill: string; stroke: string; glow: string }
  isHovered: boolean; onClick: () => void; delay: number; index: number
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="leaf-group"
    >
      {/* Glow for hovered leaf */}
      {isHovered && (
        <circle r={size * 1.5} fill={color.glow} className="animate-pulse" />
      )}
      {/* Leaf shape */}
      <ellipse
        rx={size * 0.5}
        ry={size * 0.8}
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth={isHovered ? 2 : 0.5}
        opacity={isHovered ? 1 : 0.85}
        className="transition-all duration-300"
        style={{
          filter: isHovered ? `drop-shadow(0 2px 8px ${color.glow})` : 'none',
          animation: `leafSway ${3 + (delay % 2)}s ease-in-out ${delay}s infinite alternate`,
        }}
      />
      {/* Leaf vein */}
      <line
        x1={0} y1={-size * 0.6} x2={0} y2={size * 0.6}
        stroke={color.stroke} strokeWidth={0.5} opacity={0.4}
      />
    </g>
  )
}

export default function TreeClient({ user, posts, stats }: Props) {
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null)
  const [hoveredLeaf, setHoveredLeaf] = useState<number | null>(null)
  const [showShareTip, setShowShareTip] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const leafPositions = useMemo(() => generateLeafPositions(posts.length), [posts.length])

  const selectedPost = selectedLeaf !== null ? posts[selectedLeaf] : null

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowShareTip(true)
      setTimeout(() => setShowShareTip(false), 2000)
    } catch {}
  }, [])

  // Determine tree growth stage
  const treeStage = useMemo(() => {
    const n = posts.length
    if (n === 0) return 'seed'
    if (n < 5) return 'sprout'
    if (n < 15) return 'sapling'
    if (n < 30) return 'young'
    if (n < 60) return 'growing'
    if (n < 100) return 'mature'
    return 'ancient'
  }, [posts.length])

  const treeStageLabel = useMemo(() => {
    const labels: Record<string, string> = {
      seed: 'A seed of gratitude',
      sprout: 'Taking root',
      sapling: 'Growing strong',
      young: 'Branching out',
      growing: 'A flourishing tree',
      mature: 'A grand canopy',
      ancient: 'A living monument',
    }
    return labels[treeStage]
  }, [treeStage])

  // Trunk height varies by stage
  const trunkHeight = useMemo(() => {
    const heights: Record<string, number> = {
      seed: 30, sprout: 60, sapling: 90, young: 110, growing: 120, mature: 130, ancient: 140,
    }
    return heights[treeStage]
  }, [treeStage])

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-cream-50 via-warm-cream-100 to-warm-cream-200 relative overflow-hidden">
      {/* Ambient background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {posts.length > 0 && Array.from({ length: Math.min(posts.length, 20) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: 4 + (i % 5) * 2,
              height: 4 + (i % 5) * 2,
              left: `${10 + (i * 37) % 80}%`,
              top: `${5 + (i * 53) % 90}%`,
              backgroundColor: ['#C4704B', '#7D8C6E', '#C4A35A', '#9B8AA0', '#A09080'][i % 5],
              animation: `float ${8 + (i % 4) * 3}s ease-in-out ${i * 0.5}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 relative z-10" ref={containerRef}>
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-warm-ink-300 mb-1">
            {treeStageLabel}
          </p>
          <h1 className="text-title font-serif text-warm-ink-500 tracking-tight">
            {user.name}&apos;s Tree
          </h1>
        </div>

        {/* Tree SVG */}
        <div className="relative bg-white/50 rounded-3xl border border-brand-border shadow-warm overflow-hidden">
          <svg
            viewBox="0 0 800 600"
            className="w-full"
            style={{ minHeight: 400 }}
          >
            <defs>
              <radialGradient id="canopyGlow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="rgba(125,140,110,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B7355" />
                <stop offset="30%" stopColor="#A08060" />
                <stop offset="70%" stopColor="#8B7355" />
                <stop offset="100%" stopColor="#6B5340" />
              </linearGradient>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(125,140,110,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Leaf animation */}
              <style>{`
                @keyframes leafSway {
                  0% { transform: rotate(0deg) translateX(0px); }
                  100% { transform: rotate(3deg) translateX(1px); }
                }
                @keyframes float {
                  0% { transform: translateY(0px); }
                  100% { transform: translateY(-10px); }
                }
                .leaf-group { transition: all 0.3s ease; }
                .leaf-group:hover { transform: scale(1.3); }
              `}</style>
            </defs>

            {/* Sky background glow */}
            <rect x="0" y="0" width="800" height="600" fill="url(#canopyGlow)" />

            {/* Ground */}
            <ellipse cx="400" cy={480 + (800 - trunkHeight) * 0.05} rx="250" ry="20" fill="url(#groundGrad)" />

            {/* Roots */}
            {posts.length > 0 && (
              <g opacity="0.6">
                <path d={`M370 ${480 - trunkHeight + 380} Q340 ${490} 320 ${510}`} stroke="#6B5340" strokeWidth="3" fill="none" />
                <path d={`M430 ${480 - trunkHeight + 380} Q460 ${490} 480 ${508}`} stroke="#6B5340" strokeWidth="3" fill="none" />
                <path d={`M390 ${480 - trunkHeight + 380} Q360 ${495} 340 ${515}`} stroke="#8B7355" strokeWidth="2" fill="none" />
              </g>
            )}

            {/* Trunk */}
            {posts.length > 0 && (
              <g>
                <path
                  d={`M385 ${460} Q380 ${400} 378 ${300 - (100 - trunkHeight)}
                     Q400 ${280 - (100 - trunkHeight)} 422 ${300 - (100 - trunkHeight)}
                     Q420 ${400} 415 ${460} Z`}
                  fill="url(#trunkGrad)"
                  stroke="#6B5340"
                  strokeWidth="1"
                />
                {/* Trunk texture lines */}
                <path d={`M395 ${450} Q393 ${400} 392 ${340}`} stroke="#6B5340" strokeWidth="0.5" fill="none" opacity="0.3" />
                <path d={`M405 ${455} Q407 ${390} 408 ${330}`} stroke="#6B5340" strokeWidth="0.5" fill="none" opacity="0.3" />

                {/* Branches */}
                {posts.length >= 5 && (
                  <>
                    <path d={`M385 ${260} Q350 ${240} 310 ${200}`} stroke="#8B7355" strokeWidth="4" fill="none" opacity="0.7" />
                    <path d={`M415 ${260} Q450 ${240} 490 ${200}`} stroke="#8B7355" strokeWidth="4" fill="none" opacity="0.7" />
                  </>
                )}
                {posts.length >= 30 && (
                  <>
                    <path d={`M380 ${280} Q340 ${260} 280 ${240}`} stroke="#8B7355" strokeWidth="3" fill="none" opacity="0.5" />
                    <path d={`M420 ${280} Q460 ${260} 520 ${240}`} stroke="#8B7355" strokeWidth="3" fill="none" opacity="0.5" />
                  </>
                )}
              </g>
            )}

            {/* Seed / Sprout for 0 posts */}
            {posts.length === 0 && (
              <g transform="translate(400, 440)">
                <ellipse cx={0} cy={0} rx="12" ry="8" fill="#A08060" stroke="#6B5340" strokeWidth="1" />
                <path d="M0 -8 Q-5 -30 -3 -50" stroke="#7D8C6E" strokeWidth="2" fill="none" />
                <ellipse cx={-5} cy={-48} rx="8" ry="12" fill="#A3B08F" opacity="0.7" />
              </g>
            )}

            {/* Leaves */}
            {leafPositions.map((pos, i) => {
              const post = posts[i]
              if (!post) return null
              const color = getLeafColor(post.category)
              const isHovered = hoveredLeaf === i
              return (
                <LeafShape
                  key={post.id}
                  x={pos.x}
                  y={pos.y}
                  size={pos.size}
                  rotation={pos.rotation}
                  color={color}
                  isHovered={isHovered}
                  delay={pos.delay}
                  index={i}
                  onClick={() => setSelectedLeaf(selectedLeaf === i ? null : i)}
                />
              )
            })}

            {/* Leaf count badge */}
            <g transform="translate(700, 40)">
              <rect x="-30" y="-14" width="60" height="28" rx="14" fill="white" fillOpacity="0.8" stroke="#E2D8CE" strokeWidth="1" />
              <text textAnchor="middle" y="5" fontSize="13" fill="#6B5E57" fontFamily="system-ui" fontWeight="500">
                🍃 {posts.length}
              </text>
            </g>
          </svg>

          {/* Selected leaf detail card */}
          {selectedPost && (
            <div
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-brand-border shadow-warm-lg p-5 animate-slide-up"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-warm-ink-300">
                  {selectedPost.category.replace('_', ' ').toLowerCase()}
                </span>
                <button
                  onClick={() => setSelectedLeaf(null)}
                  className="text-warm-ink-300 hover:text-warm-ink-500 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-callout text-warm-ink-500 leading-relaxed font-serif italic">
                &ldquo;{selectedPost.content}&rdquo;
              </p>
              {selectedPost.feeling && (
                <p className="text-footnote text-warm-ink-300 mt-2">
                  Feeling {selectedPost.feeling}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border">
                <p className="text-caption text-warm-ink-300">
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
                {selectedPost.heartCount > 0 && (
                  <p className="text-caption text-warm-ink-300 flex items-center gap-1">
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

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 mt-5 py-4">
          <div className="text-center">
            <p className="text-headline font-serif text-warm-ink-500">{stats.totalPosts}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-ink-300">leaves</p>
          </div>
          <div className="w-px h-8 bg-brand-border" />
          <div className="text-center">
            <p className="text-headline font-serif text-warm-ink-500">{stats.totalHearts}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-ink-300">hearts</p>
          </div>
          <div className="w-px h-8 bg-brand-border" />
          <div className="text-center">
            <p className="text-headline font-serif text-warm-ink-500">{stats.currentStreak}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-ink-300">day streak</p>
          </div>
        </div>

        {/* Share / Copy link */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 rounded-full bg-white border border-brand-border text-subheadline text-warm-ink-400 hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98]"
          >
            {showShareTip ? '✓ Copied!' : 'Copy tree link'}
          </button>
          <a
            href={`https://appreciate.live`}
            className="px-5 py-3 rounded-full bg-brand-primary text-white text-subheadline font-medium hover:bg-brand-accent-dark transition-all active:scale-[0.98]"
          >
            Grow your own
          </a>
        </div>

        {/* Growth milestones */}
        <div className="mt-8 px-2">
          <p className="text-[10px] tracking-[0.3em] uppercase text-warm-ink-300 text-center mb-3">
            Growth milestones
          </p>
          <div className="flex items-center justify-between gap-1">
            {[
              { n: 0, label: 'Seed', emoji: '🌱' },
              { n: 5, label: 'Sprout', emoji: '🌿' },
              { n: 15, label: 'Sapling', emoji: '🌳' },
              { n: 30, label: 'Young', emoji: '🌲' },
              { n: 60, label: 'Growing', emoji: '🏡' },
              { n: 100, label: 'Grand', emoji: '🏔️' },
            ].map((milestone) => {
              const reached = stats.totalPosts >= milestone.n
              return (
                <div key={milestone.n} className="flex flex-col items-center gap-1">
                  <span className={`text-lg ${reached ? '' : 'opacity-30 grayscale'}`}>
                    {milestone.emoji}
                  </span>
                  <span className={`text-[9px] tracking-wider uppercase ${reached ? 'text-warm-ink-400' : 'text-warm-ink-300 opacity-50'}`}>
                    {milestone.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
