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
  isOwner?: boolean
  currentTheme?: string
}

// Warm palette leaf colors with richer gradients
const CATEGORY_COLORS: Record<string, { fill: string; fill2: string; stroke: string; glow: string; vein: string }> = {
  FAMILY: { fill: '#D4917A', fill2: '#E8A88E', stroke: '#C4704B', glow: 'rgba(196,112,75,0.4)', vein: '#B8604A' },
  WORK: { fill: '#A85040', fill2: '#BE6858', stroke: '#8B3A2A', glow: 'rgba(139,58,42,0.4)', vein: '#7A2E20' },
  SMALL_JOYS: { fill: '#D4B87A', fill2: '#E2CA96', stroke: '#C4A35A', glow: 'rgba(196,163,90,0.4)', vein: '#B0904A' },
  NATURE: { fill: '#A3B08F', fill2: '#B8C4A5', stroke: '#7D8C6E', glow: 'rgba(125,140,110,0.4)', vein: '#6A7A5C' },
  HEALTH: { fill: '#B5A5BA', fill2: '#CAB9CF', stroke: '#9B8AA0', glow: 'rgba(155,138,160,0.4)', vein: '#887890' },
  OTHER: { fill: '#BBA898', fill2: '#D0BFB2', stroke: '#A09080', glow: 'rgba(160,144,128,0.4)', vein: '#907868' },
}

const DEFAULT_COLOR = CATEGORY_COLORS.OTHER

function getLeafColor(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

// Deterministic random
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate leaf positions in a grand canopy — multiple layers for fullness
function generateLeafPositions(count: number) {
  const leaves: { x: number; y: number; size: number; rotation: number; delay: number; layer: number; curve: number }[] = []
  const rng = seededRandom(42)

  const cx = 600
  const canopyTop = 60
  const canopyBottom = 500
  const maxRadius = 420

  // Create 3 overlapping cloud clusters for a lush canopy
  const clusters = [
    { cx: cx - 120, cy: 220, rx: 280, ry: 200 },
    { cx: cx + 100, cy: 180, rx: 300, ry: 220 },
    { cx: cx, cy: 320, rx: 340, ry: 180 },
  ]

  for (let i = 0; i < count; i++) {
    const cluster = clusters[i % clusters.length]
    const rngVal = rng()

    // Distribute within ellipse
    const angle = rng() * Math.PI * 2
    const r = Math.sqrt(rng()) // sqrt for uniform distribution in circle

    const x = cluster.cx + Math.cos(angle) * cluster.rx * r
    const y = cluster.cy + Math.sin(angle) * cluster.ry * r

    const size = 14 + rng() * 14
    const rotation = rng() * 360
    const delay = rng() * 4
    const layer = Math.floor(rng() * 3)
    const curve = (rng() - 0.5) * 0.6

    leaves.push({ x, y, size, rotation, delay, layer, curve })
  }

  // Sort by layer then y for depth ordering
  leaves.sort((a, b) => a.layer - b.layer || a.y - b.y)

  return leaves
}

// Leaf shape with gradient fill
function LeafShape({ x, y, size, rotation, color, isHovered, isSelected, onClick, delay, curve }: {
  x: number; y: number; size: number; rotation: number; curve: number
  color: { fill: string; fill2: string; stroke: string; glow: string; vein: string }
  isHovered: boolean; isSelected: boolean; onClick: () => void; delay: number
}) {
  const id = `leaf-${x.toFixed(0)}-${y.toFixed(0)}`
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${isHovered ? 1.4 : isSelected ? 1.3 : 1})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Ambient glow */}
      {(isHovered || isSelected) && (
        <circle r={size * 2} fill={color.glow} opacity={0.6}>
          <animate attributeName="r" values={`${size * 1.8};${size * 2.2};${size * 1.8}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Leaf body — teardrop shape */}
      <path
        d={`M0 ${-size * 0.9} Q${size * 0.5 * (1 + curve)} ${-size * 0.3} ${size * 0.35} ${size * 0.5} Q0 ${size * 0.9} ${-size * 0.35} ${size * 0.5} Q${-size * 0.5 * (1 + curve)} ${-size * 0.3} 0 ${-size * 0.9}Z`}
        fill={color.fill}
        stroke={color.stroke}
        strokeWidth={isHovered || isSelected ? 1.5 : 0.5}
        opacity={isHovered || isSelected ? 1 : 0.88}
        style={{
          filter: isHovered || isSelected ? `drop-shadow(0 2px 12px ${color.glow})` : 'none',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Highlight sheen */}
      <ellipse
        cx={-size * 0.1}
        cy={-size * 0.2}
        rx={size * 0.15}
        ry={size * 0.35}
        fill="white"
        opacity={0.18}
        transform={`rotate(${-15})`}
      />
      {/* Central vein */}
      <line
        x1={0} y1={-size * 0.75} x2={0} y2={size * 0.7}
        stroke={color.vein} strokeWidth={0.7} opacity={0.35}
      />
      {/* Side veins */}
      <line x1={0} y1={-size * 0.3} x2={size * 0.2} y2={-size * 0.1}
        stroke={color.vein} strokeWidth={0.4} opacity={0.25} />
      <line x1={0} y1={-size * 0.3} x2={-size * 0.2} y2={-size * 0.1}
        stroke={color.vein} strokeWidth={0.4} opacity={0.25} />
      <line x1={0} y1={0} x2={size * 0.18} y2={size * 0.2}
        stroke={color.vein} strokeWidth={0.4} opacity={0.25} />
      <line x1={0} y1={0} x2={-size * 0.18} y2={size * 0.2}
        stroke={color.vein} strokeWidth={0.4} opacity={0.25} />
    </g>
  )
}

export default function TreeClient({ user, posts, stats, isOwner, currentTheme }: Props) {
  const [selectedLeaf, setSelectedLeaf] = useState<number | null>(null)
  const [hoveredLeaf, setHoveredLeaf] = useState<number | null>(null)
  const [showShareTip, setShowShareTip] = useState(false)

  const leafPositions = useMemo(() => generateLeafPositions(posts.length), [posts.length])
  const selectedPost = selectedLeaf !== null ? posts[selectedLeaf] : null

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowShareTip(true)
      setTimeout(() => setShowShareTip(false), 2000)
    } catch {}
  }, [])

  // Tree growth stage
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

  // Branch complexity based on stage
  const branchLevel = useMemo(() => {
    const levels: Record<string, number> = {
      seed: 0, sprout: 1, sapling: 2, young: 3, growing: 4, mature: 5, ancient: 6,
    }
    return levels[treeStage]
  }, [treeStage])

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F5EFE3 0%, #EDE8DF 30%, #E2D8CE 100%)' }}>
      {/* Floating particles — golden motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {posts.length > 0 && Array.from({ length: Math.min(Math.max(posts.length * 2, 15), 50) }).map((_, i) => {
          const rng = seededRandom(i * 127 + 7)
          return (
            <div
              key={`mote-${i}`}
              className="absolute rounded-full"
              style={{
                width: 2 + rng() * 4,
                height: 2 + rng() * 4,
                left: `${rng() * 100}%`,
                top: `${rng() * 100}%`,
                backgroundColor: ['#C4A35A', '#D4B87A', '#C4704B', '#D4917A', '#A3B08F'][i % 5],
                opacity: 0.15 + rng() * 0.2,
                animation: `goldenFloat ${10 + rng() * 15}s ease-in-out ${rng() * 5}s infinite alternate`,
              }}
            />
          )
        })}
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-[10px] tracking-[0.35em] uppercase text-warm-ink-300 mb-1">
            {treeStageLabel}
          </p>
          <h1 className="text-large-title font-serif text-warm-ink-500 tracking-tight" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {user.name}&apos;s Tree
          </h1>
          <p className="text-caption text-warm-ink-300 mt-1">Every leaf is a moment of gratitude</p>
        </div>

        {/* Tree Container */}
        <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl border border-brand-border overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(58,46,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
          <svg
            viewBox="0 0 1200 800"
            className="w-full"
            style={{ minHeight: 520 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Sky gradient */}
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FAF6EE" />
                <stop offset="50%" stopColor="#F5EFE3" />
                <stop offset="100%" stopColor="#EDE8DF" />
              </linearGradient>

              {/* Trunk gradient */}
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6B5340" />
                <stop offset="25%" stopColor="#8B7355" />
                <stop offset="50%" stopColor="#A08060" />
                <stop offset="75%" stopColor="#8B7355" />
                <stop offset="100%" stopColor="#6B5340" />
              </linearGradient>

              {/* Canopy ambient glow */}
              <radialGradient id="canopyGlow" cx="50%" cy="40%" r="45%">
                <stop offset="0%" stopColor="rgba(125,140,110,0.12)" />
                <stop offset="60%" stopColor="rgba(163,176,143,0.05)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Ground shadow */}
              <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(107,83,64,0.12)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Bark texture pattern */}
              <pattern id="barkPattern" patternUnits="userSpaceOnUse" width="20" height="40">
                <line x1="5" y1="0" x2="5" y2="40" stroke="#5A4030" strokeWidth="0.5" opacity="0.15" />
                <line x1="12" y1="5" x2="12" y2="35" stroke="#5A4030" strokeWidth="0.3" opacity="0.1" />
                <line x1="17" y1="3" x2="17" y2="38" stroke="#5A4030" strokeWidth="0.4" opacity="0.12" />
              </pattern>

              {/* Leaf animations */}
              <style>{`
                @keyframes goldenFloat {
                  0% { transform: translateY(0px) translateX(0px); opacity: 0.15; }
                  50% { opacity: 0.3; }
                  100% { transform: translateY(-15px) translateX(5px); opacity: 0.1; }
                }
                @keyframes leafSway1 {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(2deg); }
                }
                @keyframes leafSway2 {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-2.5deg); }
                }
                @keyframes leafSway3 {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(1.8deg); }
                }
                @keyframes gentleBreath {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.008); }
                }
                .canopy-group {
                  animation: gentleBreath 8s ease-in-out infinite;
                  transform-origin: 600px 400px;
                }
              `}</style>
            </defs>

            {/* Sky */}
            <rect x="0" y="0" width="1200" height="800" fill="url(#skyGrad)" />

            {/* Distant hills */}
            <ellipse cx="300" cy="700" rx="500" ry="80" fill="#D8CEBC" opacity="0.3" />
            <ellipse cx="900" cy="710" rx="450" ry="70" fill="#C8BC9E" opacity="0.2" />

            {/* Canopy glow */}
            <ellipse cx="600" cy="300" rx="450" ry="320" fill="url(#canopyGlow)" />

            {/* Ground plane */}
            <ellipse cx="600" cy="680" rx="350" ry="40" fill="url(#groundShadow)" />

            {/* Ground grass texture */}
            <ellipse cx="600" cy="675" rx="280" ry="15" fill="rgba(125,140,110,0.08)" />

            {/* ROOTS */}
            {posts.length > 0 && (
              <g opacity="0.5">
                <path d="M540 660 Q490 690 440 710 Q420 715 400 720" stroke="#6B5340" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M560 665 Q510 700 460 730 Q445 738 430 740" stroke="#7A6350" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M660 660 Q710 690 760 710 Q780 715 800 720" stroke="#6B5340" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M640 665 Q690 700 740 730 Q755 738 770 740" stroke="#7A6350" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M580 668 Q560 700 530 730" stroke="#6B5340" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
                <path d="M620 668 Q640 700 670 730" stroke="#6B5340" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
              </g>
            )}

            {/* TRUNK */}
            {posts.length > 0 && (
              <g>
                {/* Main trunk */}
                <path
                  d={`M570 670 Q565 600 560 530 Q555 470 558 420
                     Q580 390 600 380
                     Q620 390 642 420
                     Q645 470 640 530 Q635 600 630 670 Z`}
                  fill="url(#trunkGrad)"
                  stroke="#5A4030"
                  strokeWidth="1"
                />
                {/* Bark texture overlay */}
                <path
                  d={`M570 670 Q565 600 560 530 Q555 470 558 420
                     Q580 390 600 380
                     Q620 390 642 420
                     Q645 470 640 530 Q635 600 630 670 Z`}
                  fill="url(#barkPattern)"
                />
                {/* Trunk highlight */}
                <path
                  d="M590 660 Q588 550 585 450 Q595 410 600 400"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Bark detail lines */}
                <path d="M580 650 Q578 580 575 500" stroke="#5A4030" strokeWidth="0.8" fill="none" opacity="0.2" />
                <path d="M595 660 Q593 570 592 470" stroke="#5A4030" strokeWidth="0.6" fill="none" opacity="0.15" />
                <path d="M610 660 Q612 560 614 460" stroke="#5A4030" strokeWidth="0.6" fill="none" opacity="0.15" />
                <path d="M622 650 Q624 580 627 500" stroke="#5A4030" strokeWidth="0.8" fill="none" opacity="0.2" />

                {/* MAIN BRANCHES */}
                {branchLevel >= 1 && (
                  <>
                    {/* Left main branch */}
                    <path d="M565 480 Q520 440 460 380 Q430 350 380 310" stroke="#7A6350" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <path d="M565 480 Q520 440 460 380 Q430 350 380 310" stroke="#8B7355" strokeWidth="6" fill="none" strokeLinecap="round" />
                    {/* Right main branch */}
                    <path d="M635 480 Q680 440 740 380 Q770 350 820 310" stroke="#7A6350" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <path d="M635 480 Q680 440 740 380 Q770 350 820 310" stroke="#8B7355" strokeWidth="6" fill="none" strokeLinecap="round" />
                    {/* Center branch */}
                    <path d="M600 420 Q600 370 590 300 Q585 260 580 220" stroke="#7A6350" strokeWidth="8" fill="none" strokeLinecap="round" />
                    <path d="M600 420 Q600 370 590 300 Q585 260 580 220" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </>
                )}

                {branchLevel >= 2 && (
                  <>
                    {/* Secondary branches */}
                    <path d="M460 380 Q410 370 360 340" stroke="#8B7355" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M460 380 Q450 340 430 290" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M740 380 Q790 370 840 340" stroke="#8B7355" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M740 380 Q750 340 770 290" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M590 300 Q560 270 520 240" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M590 300 Q620 270 660 240" stroke="#8B7355" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </>
                )}

                {branchLevel >= 3 && (
                  <>
                    {/* Tertiary branches */}
                    <path d="M360 340 Q320 310 280 290" stroke="#9A8365" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M360 340 Q340 300 310 270" stroke="#9A8365" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M430 290 Q400 260 370 230" stroke="#9A8365" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M840 340 Q880 310 920 290" stroke="#9A8365" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M840 340 Q860 300 890 270" stroke="#9A8365" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M770 290 Q800 260 830 230" stroke="#9A8365" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M520 240 Q490 210 460 180" stroke="#9A8365" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M660 240 Q690 210 720 180" stroke="#9A8365" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M580 220 Q570 170 580 130" stroke="#9A8365" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </>
                )}

                {branchLevel >= 4 && (
                  <>
                    {/* Quaternary — fine twigs */}
                    <path d="M280 290 Q260 270 240 250" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M310 270 Q290 240 270 220" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M370 230 Q350 200 330 170" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M460 180 Q440 150 420 130" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M920 290 Q940 270 960 250" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M890 270 Q910 240 930 220" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M830 230 Q850 200 870 170" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M720 180 Q740 150 760 130" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M580 130 Q570 100 580 80" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M580 130 Q600 100 620 85" stroke="#A09070" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </>
                )}

                {branchLevel >= 5 && (
                  <>
                    {/* Ultra-fine twigs */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const rng = seededRandom(i * 37 + 13)
                      const startX = 250 + rng() * 700
                      const startY = 120 + rng() * 150
                      const dx = (rng() - 0.5) * 80
                      const dy = -20 - rng() * 40
                      return (
                        <path
                          key={`twig-${i}`}
                          d={`M${startX} ${startY} Q${startX + dx * 0.5} ${startY + dy * 0.5} ${startX + dx} ${startY + dy}`}
                          stroke="#A89878"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      )
                    })}
                  </>
                )}
              </g>
            )}

            {/* Seed for empty tree */}
            {posts.length === 0 && (
              <g transform="translate(600, 620)">
                {/* Mound of earth */}
                <ellipse cx={0} cy={15} rx={35} ry={12} fill="#A08060" opacity="0.4" />
                <ellipse cx={0} cy={10} rx={25} ry={8} fill="#8B7355" opacity="0.3" />
                {/* Seed */}
                <ellipse cx={0} cy={0} rx={10} ry={7} fill="#A08060" stroke="#6B5340" strokeWidth="1" />
                {/* Tiny sprout */}
                <path d="M0 -7 Q-2 -20 -1 -35" stroke="#7D8C6E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <ellipse cx={-4} cy={-32} rx={7} ry={11} fill="#A3B08F" opacity="0.7" />
                <ellipse cx={3} cy={-28} rx={6} ry={10} fill="#B8C4A5" opacity="0.6" />
              </g>
            )}

            {/* LEAVES — the gratitude canopy */}
            <g className="canopy-group">
              {leafPositions.map((pos, i) => {
                const post = posts[i]
                if (!post) return null
                const color = getLeafColor(post.category)
                return (
                  <LeafShape
                    key={post.id}
                    x={pos.x}
                    y={pos.y}
                    size={pos.size}
                    rotation={pos.rotation}
                    curve={pos.curve}
                    color={color}
                    isHovered={hoveredLeaf === i}
                    isSelected={selectedLeaf === i}
                    delay={pos.delay}
                    onClick={() => setSelectedLeaf(selectedLeaf === i ? null : i)}
                  />
                )
              })}
            </g>

            {/* Leaf count badge */}
            <g transform="translate(1120, 50)">
              <rect x="-45" y="-18" width="90" height="36" rx="18" fill="white" fillOpacity="0.85" stroke="#E2D8CE" strokeWidth="1" />
              <text textAnchor="middle" y="6" fontSize="15" fill="#3A2E2A" fontFamily="Georgia, serif">
                🍃 {posts.length}
              </text>
            </g>
          </svg>

          {/* Selected leaf detail — slides up from bottom */}
          {selectedPost && (
            <div
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl border border-brand-border p-5"
              style={{
                boxShadow: '0 8px 32px rgba(58,46,42,0.12)',
                animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-warm-ink-300 font-medium">
                  {selectedPost.category.replace('_', ' ').toLowerCase()}
                </span>
                <button
                  onClick={() => setSelectedLeaf(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-warm-cream-200 text-warm-ink-300 hover:text-warm-ink-500 transition-all text-sm"
                >
                  ×
                </button>
              </div>
              <p className="text-body text-warm-ink-500 leading-relaxed font-serif italic" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                &ldquo;{selectedPost.content}&rdquo;
              </p>
              {selectedPost.feeling && (
                <p className="text-footnote text-warm-ink-300 mt-2 italic">
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

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-6 py-5">
          <div className="text-center">
            <p className="text-title-2 font-serif text-warm-ink-500" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>{stats.totalPosts}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-warm-ink-300 mt-1">Leaves</p>
          </div>
          <div className="w-px h-10 bg-brand-border" />
          <div className="text-center">
            <p className="text-title-2 font-serif text-warm-ink-500" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>{stats.totalHearts}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-warm-ink-300 mt-1">Hearts</p>
          </div>
          <div className="w-px h-10 bg-brand-border" />
          <div className="text-center">
            <p className="text-title-2 font-serif text-warm-ink-500" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>{stats.currentStreak}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-warm-ink-300 mt-1">Day Streak</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 rounded-full bg-white border border-brand-border text-subheadline text-warm-ink-400 hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.97]"
            style={{ boxShadow: '0 2px 12px rgba(58,46,42,0.06)' }}
          >
            {showShareTip ? '✓ Link copied!' : '🔗 Share tree'}
          </button>
          <a
            href="https://appreciate.live"
            className="px-6 py-3 rounded-full bg-brand-primary text-white text-subheadline font-medium hover:bg-brand-accent-dark transition-all active:scale-[0.97]"
            style={{ boxShadow: '0 4px 16px rgba(196,112,75,0.25)' }}
          >
            Grow your own
          </a>
        </div>

        {/* Growth milestones */}
        <div className="mt-10 px-4">
          <p className="text-[10px] tracking-[0.35em] uppercase text-warm-ink-300 text-center mb-4">
            Journey of growth
          </p>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-brand-border" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-brand-primary transition-all duration-1000"
              style={{ width: `${Math.min(100, (stats.totalPosts / 100) * 100)}%` }}
            />
            <div className="flex items-start justify-between relative">
              {[
                { n: 0, label: 'Seed', emoji: '🌱' },
                { n: 5, label: 'Sprout', emoji: '🌿' },
                { n: 15, label: 'Sapling', emoji: '🌳' },
                { n: 30, label: 'Young', emoji: '🌲' },
                { n: 60, label: 'Flourish', emoji: '🏡' },
                { n: 100, label: 'Grand', emoji: '🏔️' },
              ].map((milestone) => {
                const reached = stats.totalPosts >= milestone.n
                return (
                  <div key={milestone.n} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-500 ${reached ? 'bg-white shadow-warm scale-110' : 'bg-warm-cream-200 opacity-40'}`}
                      style={reached ? { boxShadow: '0 2px 12px rgba(196,112,75,0.2)' } : {}}
                    >
                      {milestone.emoji}
                    </div>
                    <span className={`text-[9px] tracking-wider uppercase ${reached ? 'text-warm-ink-500 font-medium' : 'text-warm-ink-300'}`}>
                      {milestone.label}
                    </span>
                    {reached && (
                      <span className="text-[8px] text-brand-primary">✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
