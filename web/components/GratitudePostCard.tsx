'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import Image from 'next/image'
import {
  GratitudePost,
  getCategoryMeta,
  timeAgo,
} from '@/types'
import { cn } from '@/lib/utils'
import { PHOTO_CARD_TEMPLATE_ID, resolveCardPresentation } from './AppreciationCardGenerator'
import ShareLinkActions from './ShareLinkActions'

interface Props {
  post: GratitudePost
  showActions?: boolean
  onHeart?: (id: string) => void
  onEdit?: (post: GratitudePost) => void
  onDelete?: (id: string) => void
  onToggleVisibility?: (post: GratitudePost) => void
}

const CATEGORY_ACCENT_COLORS: Record<string, string> = {
  FAMILY: '#9B4D30',
  WORK: '#8B3A2A',
  SMALL_JOYS: '#7A6023',
  NATURE: '#566747',
  HEALTH: '#6E5877',
  OTHER: '#655446',
}

function GratitudePostCard({
  post,
  showActions = false,
  onHeart,
  onEdit,
  onDelete,
  onToggleVisibility,
}: Props) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const category = useMemo(() => getCategoryMeta(post.category), [post.category])
  const isAnonymous = useMemo(() => post.visibility === 'ANONYMOUS', [post.visibility])
  const authorName = useMemo(() => isAnonymous ? 'Anonymous' : post.author.name, [isAnonymous, post.author.name])
  const initial = useMemo(() => isAnonymous ? '?' : authorName[0]?.toUpperCase() || '?', [isAnonymous, authorName])
  const accentColor = CATEGORY_ACCENT_COLORS[post.category] ?? '#655446'

  const shareUrl = useMemo(
    () => typeof window === 'undefined' ? `/share/${post.id}` : `${window.location.origin}/share/${post.id}`,
    [post.id]
  )

  const shareImageUrl = useMemo(
    () => typeof window === 'undefined'
      ? `/share/${post.id}/opengraph-image`
      : `${window.location.origin}/share/${post.id}/opengraph-image`,
    [post.id]
  )

  const shareText = useMemo(
    () => `${authorName} shared a gratitude moment on Appreciate.`,
    [authorName]
  )

  const handleHeart = useCallback(() => {
    setIsHeartAnimating(true)
    onHeart?.(post.id)
    setTimeout(() => setIsHeartAnimating(false), 300)
  }, [onHeart, post.id])

  const handleShareToggle = useCallback(() => {
    setIsShareOpen((open) => !open)
  }, [])

  const handleEdit = useCallback(() => {
    onEdit?.(post)
  }, [onEdit, post])

  const handleToggleVisibility = useCallback(() => {
    onToggleVisibility?.(post)
  }, [onToggleVisibility, post])

  const handleDelete = useCallback(() => {
    onDelete?.(post.id)
  }, [onDelete, post.id])

  return (
    <div
      className="concept-panel transition-transform duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: `0 18px 42px ${accentColor}16` }}
    >
      <div className="relative z-10 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/60 text-sm font-semibold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)` }}
          >
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-brand-text-primary truncate text-sm">
              {authorName}
            </p>
            <p className="text-xs text-brand-text-muted">
              {timeAgo(post.createdAt)}
            </p>
          </div>

          <VisibilityBadge visibility={post.visibility} />
        </div>

        <div className="relative mb-4 rounded-2xl border border-brand-border bg-white/82 p-4 backdrop-blur-xl">
          <span
            className="absolute left-3 top-2 text-2xl text-brand-text-muted opacity-40"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 1 }}
          >
            &ldquo;
          </span>
          <p className="whitespace-pre-wrap pl-4 pr-2 text-[15px] leading-relaxed text-brand-text-primary">
            {post.content}
          </p>
        </div>

        {post.feeling && (
          <div className="mb-4 pl-4">
            <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-brand-text-secondary">
              <span className="italic">{post.feeling}</span>
            </span>
          </div>
        )}

        <CardBackground post={post} />

        {post.photoUrl && post.cardTemplateId !== PHOTO_CARD_TEMPLATE_ID && (
          <div className="relative mb-4 h-52 overflow-hidden rounded-2xl border border-white/55">
            <Image
              src={post.photoUrl}
              alt="Post photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="mb-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              borderColor: `${accentColor}35`,
            }}
          >
            {category.label}
          </span>
        </div>

        <div className="border-t border-white/50 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleHeart}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                post.isHeartedByMe
                  ? 'text-white'
                  : 'glass-chip text-brand-text-secondary hover:text-brand-text-primary'
              )}
              style={post.isHeartedByMe ? { backgroundColor: accentColor } : {}}
            >
              <HeartIcon filled={post.isHeartedByMe ?? false} animating={isHeartAnimating} />
              {post.heartCount > 0 && (
                <span>{post.heartCount}</span>
              )}
            </button>

            <button
              onClick={handleShareToggle}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                isShareOpen
                  ? 'bg-brand-accent text-white'
                  : 'glass-chip text-brand-text-secondary hover:text-brand-text-primary'
              )}
            >
              <ShareIcon />
              <span>{isShareOpen ? 'Close' : 'Share'}</span>
            </button>

            {showActions && (
              <>
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="glass-chip flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-text-secondary transition-all hover:text-brand-text-primary"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                )}

                {onToggleVisibility && (
                  <button
                    onClick={handleToggleVisibility}
                    className="glass-chip flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-text-secondary transition-all hover:text-brand-text-primary"
                  >
                    <span>{post.visibility === 'PRIVATE' ? 'Make Public' : post.visibility === 'PUBLIC' ? 'Make Anon' : 'Make Private'}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="ml-auto flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
                  >
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}
          </div>

          {isShareOpen && (
            <div className="glass-chip mt-4 rounded-2xl p-3">
              <ShareLinkActions
                url={shareUrl}
                title="Share this gratitude moment"
                text={shareText}
                imageUrl={shareImageUrl}
                compact
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CardBackground = ({ post }: { post: GratitudePost }) => {
  const cardStyle = useMemo(() => {
    if (!post.cardTemplateId || post.cardTemplateId === 'minimal') return null
    return resolveCardPresentation(post.cardTemplateId, post.photoUrl)
  }, [post.cardTemplateId, post.photoUrl])

  if (!cardStyle) return null

  return (
    <div
      className="mb-4 rounded-xl overflow-hidden relative p-5 min-h-[140px] flex flex-col justify-between"
      style={{ background: cardStyle.background }}
    >
      {cardStyle.overlayClassName && (
        <div className={cn('absolute inset-0 rounded-xl', cardStyle.overlayClassName)} />
      )}

      <p
        className="relative z-10 text-[15px] font-medium leading-relaxed line-clamp-4"
        style={{ color: cardStyle.textColor }}
      >
        &ldquo;{post.content}&rdquo;
      </p>
      {post.feeling && (
        <p
          className="relative z-10 text-sm italic mt-2 opacity-80"
          style={{ color: cardStyle.textColor }}
        >
          {post.feeling}
        </p>
      )}
    </div>
  )
}

const HeartIcon = memo(function HeartIcon({ filled, animating }: { filled: boolean; animating: boolean }) {
  return (
    <svg
      className={cn('w-4 h-4 transition-transform', animating && 'scale-125')}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
})

function ShareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69a4.5 4.5 0 0 1 1.24 7.24l-4.5 4.5a4.5 4.5 0 0 1-6.37-6.36l1.76-1.77" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.81 15.31a4.5 4.5 0 0 1-1.24-7.24l4.5-4.5a4.5 4.5 0 1 1 6.37 6.36l-1.76 1.77" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  )
}

const VisibilityBadge = memo(function VisibilityBadge({ visibility }: { visibility: string }) {
  const label = useMemo(() => {
    switch (visibility) {
      case 'PRIVATE': return 'Private'
      case 'ANONYMOUS': return 'Anon'
      default: return 'Public'
    }
  }, [visibility])

  return (
    <span className="flex items-center text-xs font-medium px-2.5 py-1 rounded-full border bg-brand-surface text-brand-text-muted border-brand-divider">
      {label}
    </span>
  )
})

export default memo(GratitudePostCard, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.heartCount === nextProps.post.heartCount &&
    prevProps.post.isHeartedByMe === nextProps.post.isHeartedByMe &&
    prevProps.post.updatedAt === nextProps.post.updatedAt &&
    prevProps.post.visibility === nextProps.post.visibility &&
    prevProps.post.category === nextProps.post.category
  )
})
