'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { VisualizationProps } from './ZenClient'

const HAND = '"Comic Sans MS", "Bradley Hand", "Segoe Print", cursive'
const GRADIENTS = [
  'from-[#F7D8A8] via-[#F6E8D2] to-[#BFD6D8]',
  'from-[#B9D7E6] via-[#DCEBE7] to-[#BFD7B8]',
  'from-[#E8B7B0] via-[#F3D4B7] to-[#C7B7D8]',
  'from-[#C9D8A8] via-[#EFE1C7] to-[#D7B85C]',
]

const EMOJI_BY_CATEGORY: Record<string, string> = {
  FAMILY: '❤️',
  WORK: '💼',
  SMALL_JOYS: '✨',
  NATURE: '🌿',
  HEALTH: '💪',
  OTHER: '☕',
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function PolaroidClient({ user, posts, isOwner, currentTheme, embedded, onThemeSaved }: VisualizationProps) {
  const [selected, setSelected] = useState(0)
  const [draggedPositions, setDraggedPositions] = useState<Record<number, { x: number; y: number }>>({})
  const boardRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    index: number
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  } | null>(null)
  const active = posts[selected] || posts[0]

  const cards = useMemo(() => {
    const rand = seeded(12)
    const single = posts.length === 1
    const count = Math.max(8, Math.min(22, posts.length + 8))
    return Array.from({ length: count }, (_, i) => {
      const isCentered = single && i === 0
      return {
        x: isCentered ? 50 : 7 + rand() * 82,
        y: isCentered ? 50 : 11 + rand() * 70,
        rotate: isCentered ? 0 : -9 + rand() * 18,
        scale: isCentered ? 1 : 0.82 + rand() * 0.28,
        postIndex: i < posts.length ? i : -1,
      }
    })
  }, [posts])

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    index: number,
    x: number,
    y: number
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      originX: draggedPositions[index]?.x ?? x,
      originY: draggedPositions[index]?.y ?? y,
      moved: false,
    }
  }

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    const board = boardRef.current
    if (!drag || !board) return

    const rect = board.getBoundingClientRect()
    const deltaX = ((event.clientX - drag.startX) / rect.width) * 100
    const deltaY = ((event.clientY - drag.startY) / rect.height) * 100
    const nextX = Math.min(92, Math.max(6, drag.originX + deltaX))
    const nextY = Math.min(86, Math.max(8, drag.originY + deltaY))
    if (Math.abs(event.clientX - drag.startX) > 4 || Math.abs(event.clientY - drag.startY) > 4) {
      drag.moved = true
    }
    setDraggedPositions((current) => ({
      ...current,
      [drag.index]: { x: nextX, y: nextY },
    }))
  }

  const endDrag = (postIndex: number) => {
    const wasDrag = dragRef.current?.moved
    dragRef.current = null
    if (!wasDrag && postIndex >= 0) {
      setSelected(postIndex)
    }
  }

  const canvasHeight = posts.length === 1 ? 'h-[48vh] min-h-[400px]' : 'h-[70vh] min-h-[520px]'

  const visualization = (
        <div ref={boardRef} className={`relative ${canvasHeight} overflow-hidden rounded-2xl bg-[#FBF4E7] shadow-[0_24px_70px_rgba(80,62,40,0.18)]`}>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(128,105,74,0.04)_1px,transparent_1px),radial-gradient(circle,rgba(91,72,48,0.055)_1px,transparent_1px)] bg-[size:92px_92px,18px_18px]" />

          {cards.map((card, i) => {
            const isPost = card.postIndex >= 0
            const post = posts[card.postIndex]
            const isSelected = card.postIndex === selected
            const position = draggedPositions[i] ?? { x: card.x, y: card.y }
            const style = {
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: isSelected ? 150 : 122,
              transform: `translate(-50%, -50%) rotate(${isSelected ? card.rotate * 0.3 : card.rotate}deg) scale(${isSelected ? 1.08 : card.scale})`,
            }

            return isPost ? (
              <button
                key={i}
                type="button"
                onPointerDown={(event) => startDrag(event, i, card.x, card.y)}
                onPointerMove={moveDrag}
                onPointerUp={() => endDrag(card.postIndex)}
                onPointerCancel={() => { dragRef.current = null }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelected(card.postIndex)
                  }
                }}
                className="absolute z-20 touch-none cursor-grab bg-white p-2 text-left shadow-[0_14px_30px_rgba(45,36,24,0.20)] ring-2 ring-[#D7B85C]/55 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#D7B85C]/45 active:cursor-grabbing"
                style={style}
                aria-label={`Open memory ${card.postIndex + 1}`}
              >
                <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full border border-white bg-[#B98154] shadow" />
                <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                  {post.photoUrl ? (
                    <Image src={post.photoUrl} alt="" fill className="object-cover" sizes="140px" />
                  ) : (
                    <span className="text-4xl opacity-70">{EMOJI_BY_CATEGORY[post.category] ?? '☕'}</span>
                  )}
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-[#2F281F]" style={{ fontFamily: HAND }}>
                  {post.content}
                </p>
              </button>
            ) : (
              <div
                key={i}
                onPointerDown={(event) => startDrag(event, i, card.x, card.y)}
                onPointerMove={moveDrag}
                onPointerUp={() => endDrag(-1)}
                onPointerCancel={() => { dragRef.current = null }}
                className="absolute z-10 touch-none cursor-grab bg-white/70 p-2 text-left opacity-55 shadow-[0_8px_18px_rgba(45,36,24,0.12)] active:cursor-grabbing"
                style={style}
              >
                <div className={`h-24 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`} />
                <div className="mt-2 h-2 w-16 rounded-full bg-stone-200" />
                <div className="mt-1 h-2 w-10 rounded-full bg-stone-200" />
              </div>
            )
          })}

          {active && (
            <div className="pointer-events-none absolute right-7 top-8 z-30 rotate-3 bg-[#F5EDCF] px-4 py-3 text-lg leading-tight text-[#2F281F] shadow" style={{ fontFamily: HAND, maxWidth: 185 }}>
              {active.content}
            </div>
          )}
        </div>
  )

  if (embedded) {
    return <>{visualization}</>
  }

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">
        {visualization}
      </section>
    </main>
  )
}
