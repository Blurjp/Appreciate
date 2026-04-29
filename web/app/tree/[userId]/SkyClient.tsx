'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ThemePicker = dynamic(() => import('@/components/ThemePicker'), { ssr: false })

interface StarPost {
  id: string
  content: string
  feeling: string | null
  category: string
  createdAt: string
  heartCount: number
}

interface StarUser {
  id: string
  name: string
  avatarUrl: string | null
}

interface StarStats {
  totalPosts: number
  totalHearts: number
  currentStreak: number
  longestStreak: number
}

interface Props {
  user: StarUser
  posts: StarPost[]
  stats: StarStats
  isOwner?: boolean
  currentTheme?: string
}

// Star colors by category — warm celestial palette
const STAR_COLORS: Record<string, { core: string; glow: string; halo: string }> = {
  FAMILY: { core: '#FFD4A8', glow: 'rgba(255,180,120,0.6)', halo: 'rgba(255,160,90,0.15)' },
  WORK: { core: '#FFB8B8', glow: 'rgba(255,150,150,0.6)', halo: 'rgba(255,120,120,0.15)' },
  SMALL_JOYS: { core: '#FFF4B8', glow: 'rgba(255,230,130,0.6)', halo: 'rgba(255,220,80,0.15)' },
  NATURE: { core: '#B8FFD4', glow: 'rgba(130,255,170,0.5)', halo: 'rgba(100,230,140,0.15)' },
  HEALTH: { core: '#D4B8FF', glow: 'rgba(180,150,255,0.6)', halo: 'rgba(150,120,230,0.15)' },
  OTHER: { core: '#B8D4FF', glow: 'rgba(150,180,255,0.5)', halo: 'rgba(120,160,230,0.15)' },
}

const DEFAULT_STAR = STAR_COLORS.OTHER

function getStarColor(category: string) {
  return STAR_COLORS[category] || DEFAULT_STAR
}

// Deterministic random
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Place stars across the sky, forming constellation clusters by category
function generateStarPositions(posts: StarPost[]) {
  if (posts.length === 0) return []

  const stars: {
    x: number; y: number; size: number; brightness: number; delay: number
  }[] = []

  const rng = seededRandom(42)
  const W = 1200
  const H = 800

  // Group posts by category for constellation clusters
  const categoryGroups: Record<string, number[]> = {}
  posts.forEach((p, i) => {
    const cat = p.category || 'OTHER'
    if (!categoryGroups[cat]) categoryGroups[cat] = []
    categoryGroups[cat].push(i)
  })

  // Define cluster centers for each category — spread across sky
  const clusterCenters: Record<string, { cx: number; cy: number }> = {
    FAMILY: { cx: 300, cy: 250 },
    WORK: { cx: 900, cy: 300 },
    SMALL_JOYS: { cx: 600, cy: 180 },
    NATURE: { cx: 200, cy: 500 },
    HEALTH: { cx: 800, cy: 550 },
    OTHER: { cx: 500, cy: 450 },
  }

  // Place each post's star near its category cluster center
  posts.forEach((post, i) => {
    const cat = post.category || 'OTHER'
    const center = clusterCenters[cat] || clusterCenters.OTHER

    // Spread around center with some randomness
    const spread = 200 + rng() * 100
    const angle = rng() * Math.PI * 2
    const dist = rng() * spread

    const x = Math.max(60, Math.min(W - 60, center.cx + Math.cos(angle) * dist))
    const y = Math.max(60, Math.min(H - 60, center.cy + Math.sin(angle) * dist))

    stars.push({
      x,
      y,
      size: 3 + rng() * 5,
      brightness: 0.6 + rng() * 0.4,
      delay: rng() * 5,
    })
  })

  return stars
}

// Generate constellation lines connecting stars of the same category
function generateConstellationLines(posts: StarPost[], stars: { x: number; y: number }[]) {
  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = []

  // Group indices by category
  const groups: Record<string, number[]> = {}
  posts.forEach((p, i) => {
    const cat = p.category || 'OTHER'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(i)
  })

  // Connect nearby stars within each category (minimum spanning tree-ish)
  Object.values(groups).forEach((indices) => {
    if (indices.length < 2) return

    // Simple approach: connect each star to its nearest neighbor not yet connected
    const connected = new Set<number>([indices[0]])
    const remaining = new Set(indices.slice(1))

    while (remaining.size > 0) {
      let bestDist = Infinity
      let bestFrom = -1
      let bestTo = -1

      const connectedArr = Array.from(connected)
      const remainingArr = Array.from(remaining)

      for (const from of connectedArr) {
        for (const to of remainingArr) {
          const dx = stars[from].x - stars[to].x
          const dy = stars[from].y - stars[to].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < bestDist) {
            bestDist = dist
            bestFrom = from
            bestTo = to
          }
        }
      }

      if (bestTo >= 0) {
        // Only draw line if stars are reasonably close
        if (bestDist < 350) {
          lines.push({
            x1: stars[bestFrom].x,
            y1: stars[bestFrom].y,
            x2: stars[bestTo].x,
            y2: stars[bestTo].y,
            opacity: Math.max(0.05, 0.2 - bestDist / 2000),
          })
        }
        connected.add(bestTo)
        remaining.delete(bestTo)
      } else {
        break
      }
    }

    // Add a few extra connections for visual richness if group has 3+
    if (indices.length >= 3) {
      for (let i = 0; i < indices.length - 1; i++) {
        const a = indices[i]
        const b = indices[i + 1]
        const dx = stars[a].x - stars[b].x
        const dy = stars[a].y - stars[b].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 250 && !lines.some(l =>
          (l.x1 === stars[a].x && l.y1 === stars[a].y && l.x2 === stars[b].x && l.y2 === stars[b].y) ||
          (l.x1 === stars[b].x && l.y1 === stars[b].y && l.x2 === stars[a].x && l.y2 === stars[a].y)
        )) {
          lines.push({
            x1: stars[a].x,
            y1: stars[a].y,
            x2: stars[b].x,
            y2: stars[b].y,
            opacity: 0.08,
          })
        }
      }
    }
  })

  return lines
}

// Generate background stars (tiny, non-interactive)
function generateBackgroundStars(count: number) {
  const rng = seededRandom(99)
  return Array.from({ length: count }, (_, i) => ({
    x: rng() * 1200,
    y: rng() * 800,
    size: 0.5 + rng() * 1.5,
    opacity: 0.2 + rng() * 0.5,
    delay: rng() * 8,
    twinkleSpeed: 2 + rng() * 4,
  }))
}

// Category labels for the legend
const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  FAMILY: { label: 'Family', color: '#FFB478' },
  WORK: { label: 'Work', color: '#FF9696' },
  SMALL_JOYS: { label: 'Small Joys', color: '#FFE650' },
  NATURE: { label: 'Nature', color: '#82FFAA' },
  HEALTH: { label: 'Health', color: '#B496FF' },
  OTHER: { label: 'Other', color: '#96B4FF' },
}

export default function SkyClient({ user, posts, stats, isOwner, currentTheme }: Props) {
  const [selectedStar, setSelectedStar] = useState<number | null>(null)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [showShareTip, setShowShareTip] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const starPositions = useMemo(() => generateStarPositions(posts), [posts])
  const constellationLines = useMemo(() => generateConstellationLines(posts, starPositions), [posts, starPositions])
  const bgStars = useMemo(() => generateBackgroundStars(Math.max(80, 40 + posts.length * 3)), [posts.length])
  const selectedPost = selectedStar !== null ? posts[selectedStar] : null

  // Get unique categories present
  const presentCategories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category))
    return Array.from(cats).filter(c => CATEGORY_LABELS[c])
  }, [posts])

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

  // Sky description based on count
  const skyDescription = useMemo(() => {
    const n = posts.length
    if (n === 0) return 'An empty sky, waiting for its first star'
    if (n < 5) return 'The first stars appear in the darkness'
    if (n < 15) return 'Constellations begin to take shape'
    if (n < 30) return 'A shimmering tapestry of gratitude'
    if (n < 60) return 'The sky fills with constellations'
    if (n < 100) return 'A brilliant celestial map of moments'
    return 'An infinite sky of gratitude'
  }, [posts.length])

  return (
    <div className="min-h-screen relative overflow-hidden select-none" style={{ background: 'linear-gradient(180deg, #040414 0%, #080A28 24%, #14113B 58%, #221447 100%)' }}>
      {/* Owner theme switcher */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowThemePicker(true)}
            className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(12px)',
            }}
          >
            Change theme
          </button>
        </div>
      )}

      {/* Ambient nebula glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #6B3FA0 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #3F60A0 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #8040A0 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12 relative z-10">
        {/* Header */}
        <div className="mb-4">
          <p className="text-[10px] tracking-[0.4em] uppercase text-indigo-300/40 mb-2">
            {skyDescription}
          </p>
          <h1 className="text-large-title tracking-tight text-white/90" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 40px rgba(180,160,255,0.15)' }}>
            My Gratitude Sky
          </h1>
          <p className="text-caption mt-1 max-w-md text-indigo-100/35">
            {user.name}&apos;s moments are mapped as constellations of joy, connection, and care
          </p>
        </div>

        {/* Sky container */}
        <div className="relative rounded-2xl overflow-hidden" style={{
          background: 'radial-gradient(circle at 32% 78%, rgba(108,64,128,0.32) 0%, transparent 32%), linear-gradient(180deg, #070824 0%, #11153F 42%, #17114B 72%, #0A0A2B 100%)',
          boxShadow: '0 22px 70px rgba(5,5,22,0.45), 0 0 80px rgba(125,110,220,0.10), inset 0 0 90px rgba(190,175,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <svg
            viewBox="0 0 1200 800"
            className="w-full"
            style={{ minHeight: 500 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Star glow filter */}
              <filter id="starGlow" x="-300%" y="-300%" width="700%" height="700%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Selected star glow — bigger */}
              <filter id="starGlowBig" x="-400%" y="-400%" width="900%" height="900%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="blur3" />
                <feMerge>
                  <feMergeNode in="blur3" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Moon glow */}
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(220,210,255,0.12)" />
                <stop offset="40%" stopColor="rgba(180,170,220,0.04)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              <style>{`
                @keyframes twinkle {
                  0%, 100% { opacity: var(--star-opacity, 0.6); }
                  50% { opacity: var(--star-opacity-high, 1); }
                }
                @keyframes pulse-glow {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.15); opacity: 0.85; }
                }
                @keyframes shooting-star {
                  0% { transform: translateX(0) translateY(0); opacity: 1; }
                  70% { opacity: 1; }
                  100% { transform: translateX(200px) translateY(120px); opacity: 0; }
                }
                @keyframes constellation-pulse {
                  0%, 100% { opacity: 0.08; }
                  50% { opacity: 0.18; }
                }
              `}</style>
            </defs>

            {/* Moon */}
            <circle cx="1000" cy="100" r="80" fill="url(#moonGlow)" />
            <circle cx="1000" cy="100" r="25" fill="rgba(220,215,245,0.08)" />
            <circle cx="1000" cy="100" r="18" fill="rgba(230,225,250,0.05)" />

            {/* Background stars — tiny twinkling dots */}
            {bgStars.map((star, i) => (
              <circle
                key={`bg-${i}`}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="white"
                opacity={star.opacity}
                style={{
                  animation: `twinkle ${star.twinkleSpeed}s ease-in-out ${star.delay}s infinite`,
                  '--star-opacity': star.opacity * 0.5,
                  '--star-opacity-high': Math.min(1, star.opacity * 1.5),
                } as any}
              />
            ))}

            {/* Constellation lines */}
            {constellationLines.map((line, i) => (
              <line
                key={`line-${i}`}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="rgba(180,170,255,0.15)"
                strokeWidth={0.8}
                opacity={line.opacity}
                style={{
                  animation: 'constellation-pulse 6s ease-in-out infinite',
                  animationDelay: `${i * 0.3}s`,
                }}
                strokeDasharray="4 8"
              />
            ))}

            {/* Gratitude stars */}
            {mounted && starPositions.map((pos, i) => {
              const post = posts[i]
              if (!post) return null
              const color = getStarColor(post.category)
              const isSelected = selectedStar === i
              const isHovered = hoveredStar === i

              return (
                <g
                  key={post.id}
                  onClick={() => setSelectedStar(isSelected ? null : i)}
                  onMouseEnter={() => setHoveredStar(i)}
                  onMouseLeave={() => setHoveredStar(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer halo */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={pos.size * 8}
                      fill={color.halo}
                      style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
                    />
                  )}
                  {/* Glow layer */}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isSelected ? pos.size * 4 : isHovered ? pos.size * 3 : pos.size * 1.8}
                    fill={color.glow}
                    filter={isSelected ? 'url(#starGlowBig)' : isHovered ? 'url(#starGlowBig)' : 'url(#starGlow)'}
                    opacity={isSelected ? 1 : isHovered ? 0.9 : pos.brightness}
                    style={{
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      animation: !isSelected && !isHovered ? `twinkle ${3 + pos.delay}s ease-in-out ${pos.delay}s infinite` : 'none',
                      '--star-opacity': pos.brightness * 0.7,
                      '--star-opacity-high': Math.min(1, pos.brightness * 1.2),
                    } as any}
                  />
                  {/* Core star */}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isSelected ? pos.size * 1.2 : isHovered ? pos.size * 1.1 : pos.size * 0.5}
                    fill={color.core}
                    opacity={isSelected || isHovered ? 1 : pos.brightness}
                    style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                  {/* Cross sparkle on selected */}
                  {isSelected && (
                    <>
                      <line x1={pos.x - pos.size * 6} y1={pos.y} x2={pos.x + pos.size * 6} y2={pos.y}
                        stroke={color.core} strokeWidth="0.5" opacity="0.4" />
                      <line x1={pos.x} y1={pos.y - pos.size * 6} x2={pos.x} y2={pos.y + pos.size * 6}
                        stroke={color.core} strokeWidth="0.5" opacity="0.4" />
                    </>
                  )}
                </g>
              )
            })}

            {/* Star count badge */}
            <g transform="translate(1100, 45)">
              <rect x="-50" y="-16" width="100" height="32" rx="16"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <text textAnchor="middle" y="5" fontSize="13" fill="rgba(255,255,255,0.5)" fontFamily="Georgia, serif">
                ✦ {posts.length}
              </text>
            </g>
          </svg>

          {/* Selected star detail — translucent glass panel */}
          {selectedPost && (
            <div
              className="absolute bottom-6 left-6 right-6 rounded-2xl p-6"
              style={{
                background: 'rgba(20,15,50,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStarColor(selectedPost.category).core, boxShadow: `0 0 8px ${getStarColor(selectedPost.category).glow}` }} />
                  <span className="text-[10px] tracking-[0.25em] uppercase text-indigo-300/50 font-medium">
                    {selectedPost.category.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStar(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-sm"
                >
                  ×
                </button>
              </div>
              <p className="text-body text-white/85 leading-relaxed font-serif italic" style={{ fontFamily: 'Georgia, serif' }}>
                &ldquo;{selectedPost.content}&rdquo;
              </p>
              {selectedPost.feeling && (
                <p className="text-footnote text-indigo-300/40 mt-2 italic">
                  Feeling {selectedPost.feeling}
                </p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-caption text-white/25">
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
                {selectedPost.heartCount > 0 && (
                  <p className="text-caption text-white/25 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#FFB478" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {selectedPost.heartCount}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend toggle */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-[10px] tracking-[0.2em] uppercase text-indigo-300/30 hover:text-indigo-300/50 transition-colors"
          >
            {showLegend ? 'Hide legend' : 'Show constellation legend'}
          </button>
        </div>

        {/* Constellation legend */}
        {showLegend && (
          <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
            {presentCategories.map((cat) => {
              const meta = CATEGORY_LABELS[cat]
              if (!meta) return null
              const count = posts.filter(p => p.category === cat).length
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}40` }} />
                  <span className="text-[10px] tracking-wider text-white/30">{meta.label}</span>
                  <span className="text-[9px] text-white/15">({count})</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 py-5">
          <div className="text-center">
            <p className="text-title-2 text-white/80" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(180,160,255,0.1)' }}>{stats.totalPosts}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 mt-1">Stars</p>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="text-center">
            <p className="text-title-2 text-white/80" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(180,160,255,0.1)' }}>{stats.totalHearts}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 mt-1">Hearts</p>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="text-center">
            <p className="text-title-2 text-white/80" style={{ fontFamily: 'Georgia, serif', textShadow: '0 0 20px rgba(180,160,255,0.1)' }}>{stats.currentStreak}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 mt-1">Day Streak</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-full text-subheadline text-white/40 hover:text-white/60 transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {showShareTip ? '✓ Copied!' : '🔗 Share sky'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full text-subheadline font-medium text-white/80 hover:text-white transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, rgba(100,80,200,0.3) 0%, rgba(80,60,160,0.3) 100%)',
              border: '1px solid rgba(140,120,220,0.2)',
              boxShadow: '0 4px 20px rgba(100,80,200,0.15)',
            }}
          >
            Light your own sky
          </a>
        </div>

        {/* Growth stages */}
        <div className="mt-10 px-2">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/15 text-center mb-4">
            Celestial milestones
          </p>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div
              className="absolute top-4 left-0 h-px transition-all duration-1000"
              style={{
                width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%`,
                background: 'linear-gradient(90deg, rgba(180,160,255,0.3) 0%, rgba(140,120,220,0.5) 100%)',
                boxShadow: '0 0 8px rgba(140,120,220,0.2)',
              }}
            />
            <div className="flex items-start justify-between relative">
              {[
                { n: 0, label: 'Dark', emoji: '🌑' },
                { n: 5, label: 'Dawn', emoji: '🌅' },
                { n: 15, label: 'Twilight', emoji: '🌆' },
                { n: 30, label: 'Starlight', emoji: '✨' },
                { n: 60, label: 'Galaxy', emoji: '🌌' },
                { n: 100, label: 'Infinite', emoji: '🌠' },
              ].map((milestone) => {
                const reached = stats.totalPosts >= milestone.n
                return (
                  <div key={milestone.n} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${reached ? 'scale-110' : 'opacity-30 grayscale'}`}
                      style={reached ? {
                        background: 'rgba(255,255,255,0.06)',
                        boxShadow: '0 0 12px rgba(140,120,220,0.2)',
                      } : { background: 'rgba(255,255,255,0.03)' }}
                    >
                      {milestone.emoji}
                    </div>
                    <span className={`text-[9px] tracking-wider uppercase ${reached ? 'text-white/40 font-medium' : 'text-white/15'}`}>
                      {milestone.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Theme Picker overlay */}
      {showThemePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(5,5,20,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowThemePicker(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6"
            style={{
              background: 'rgba(20,20,50,0.95)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ThemePicker currentTheme={currentTheme || 'starry'} onClose={() => setShowThemePicker(false)} onSaved={() => window.location.reload()} />
          </div>
        </div>
      )}
    </div>
  )
}
