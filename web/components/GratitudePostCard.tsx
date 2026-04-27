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
  FAMILY: '#C4704B',
  WORK: '#8B3A2A',
  SMALL_JOYS: '#C4A35A',
  NATURE: '#7D8C6E',
  HEALTH: '#9B8AA0',
  OTHER: '#A09080',
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
  const accentColor = CATEGORY_ACCENT_COLORS[post.category] ?? '#A09080'

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
      className="bg-white rounded-2xl border border-brand-border shadow-warm transition-shadow hover:shadow-warm-lg overflow-hidden"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-medium text-white text-sm flex-shrink-0"
            style={{ backgroundColor: accentColor }}
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

        {/* Content */}
        <div className="relative mb-4">
          <span
            className="absolute -left-0.5 -top-1 text-2xl text-brand-border opacity-70"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 1 }}
          >
            &ldquo;
          </span>
          <p className="text-brand-text-primary text-[15px] leading-relaxed pl-4 pr-2 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Feeling */}
        {post.feeling && (
          <div className="mb-4 pl-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-brand-surface text-brand-text-secondary border border-brand-divider">
              <span className="italic">{post.feeling}</span>
            </span>
          </div>
        )}

        {/* Card Background */}
        <CardBackground post={post} />

        {/* Photo */}
        {post.photoUrl && post.cardTemplateId !== PHOTO_CARD_TEMPLATE_ID && (
          <div className="mb-4 rounded-xl overflow-hidden relative h-52">
            <Image
              src={post.photoUrl}
              alt="Post photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              borderColor: `${accentColor}35`,
            }}
          >
            {category.label}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-brand-divider">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleHeart}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                post.heartCount > 0
                  ? 'text-white'
                  : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-accent-light border border-brand-divider'
              )}
              style={post.heartCount > 0 ? { backgroundColor: accentColor } : {}}
            >
              <HeartIcon filled={post.heartCount > 0} animating={isHeartAnimating} />
              {post.heartCount > 0 && (
                <span>{post.heartCount}</span>
              )}
            </button>

            <button
              onClick={handleShareToggle}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isShareOpen
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-accent-light border border-brand-divider'
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
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-brand-surface text-brand-text-secondary hover:bg-brand-accent-light border border-brand-divider transition-all"
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                )}

                {onToggleVisibility && (
                  <button
                    onClick={handleToggleVisibility}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-brand-surface text-brand-text-secondary hover:bg-brand-accent-light border border-brand-divider transition-all"
                  >
                    <span>{post.visibility === 'PRIVATE' ? 'Make Public' : 'Make Private'}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all ml-auto"
                  >
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}
          </div>

          {isShareOpen && (
            <div className="mt-4 p-3 rounded-xl bg-brand-surface border border-brand-divider">
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
    prevProps.post.updatedAt === nextProps.post.updatedAt
  )
})
