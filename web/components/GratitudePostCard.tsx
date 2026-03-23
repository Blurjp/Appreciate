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

  // Memoize computed values to prevent recalculation
  const category = useMemo(() => getCategoryMeta(post.category), [post.category])
  const isAnonymous = useMemo(() => post.visibility === 'ANONYMOUS', [post.visibility])
  const authorName = useMemo(() => isAnonymous ? 'Anonymous' : post.author.name, [isAnonymous, post.author.name])
  const initial = useMemo(() => isAnonymous ? '?' : authorName[0]?.toUpperCase() || '?', [isAnonymous, authorName])

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

  // Use useCallback to prevent function recreation on each render
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

  const handleClearFilter = useCallback(() => {
    // This would need to be passed in as a prop if you want to clear category filter
  }, [])

  return (
    <div className="bg-brand-card rounded-2xl p-5 border border-brand-border transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-headline border border-brand-border text-brand-text-primary">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-headline text-brand-text-primary truncate">
            {authorName}
          </p>
          <p className="text-caption text-brand-text-secondary">
            {timeAgo(post.createdAt)}
          </p>
        </div>
        <VisibilityIcon visibility={post.visibility} />
      </div>

      {/* Content */}
      <p className="text-body text-brand-text-primary mb-3 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Feeling */}
      {post.feeling && (
        <p className="text-subheadline text-brand-text-secondary italic mb-3">
          Feeling: {post.feeling}
        </p>
      )}

      {/* Card Background */}
      <CardBackground post={post} />

      {/* Photo */}
      {post.photoUrl && post.cardTemplateId !== PHOTO_CARD_TEMPLATE_ID && (
        <div className="mb-4 rounded-xl overflow-hidden relative h-48">
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-medium border border-brand-border text-brand-text-secondary tracking-wide uppercase">
          {category.label}
        </span>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-brand-border">
        <div className="flex items-center gap-2">
          <button
            onClick={handleHeart}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-subheadline font-medium transition-all border',
              post.heartCount > 0
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-brand-border text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary'
            )}
          >
            <HeartIcon filled={post.heartCount > 0} animating={isHeartAnimating} />
            {post.heartCount > 0 && <span>{post.heartCount}</span>}
          </button>

          <button
            onClick={handleShareToggle}
            title="Share post"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-subheadline transition-all border',
              isShareOpen
                ? 'border-brand-primary text-brand-primary'
                : 'border-brand-border text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary'
            )}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <span>{isShareOpen ? 'Close' : 'Share'}</span>
          </button>

          {showActions && (
          <>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all"
              >
                Edit
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={handleToggleVisibility}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all"
              >
                {post.visibility === 'PRIVATE' ? 'Share' : 'Privatise'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-red-400 hover:text-red-500 transition-all ml-auto"
              >
                Delete
              </button>
            )}
          </>
          )}
        </div>

        {isShareOpen && (
          <div className="mt-3">
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
  )
}

// Extract card background to separate memoized component
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
      {cardStyle.overlayClassName && <div className={cn('absolute inset-0 rounded-xl', cardStyle.overlayClassName)} />}
      <p
        className="relative z-10 text-body font-medium leading-relaxed line-clamp-4"
        style={{ color: cardStyle.textColor }}
      >
        &ldquo;{post.content}&rdquo;
      </p>
      {post.feeling && (
        <p
          className="relative z-10 text-caption italic mt-2 opacity-80"
          style={{ color: cardStyle.textColor }}
        >
          Feeling: {post.feeling}
        </p>
      )}
    </div>
  )
}

// Memoize sub-components to prevent unnecessary re-renders
const HeartIcon = memo(function HeartIcon({ filled, animating }: { filled: boolean; animating: boolean }) {
  return (
    <svg
      className={cn('w-4 h-4 transition-transform', animating && 'animate-heart-bounce')}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
})

const VisibilityIcon = memo(function VisibilityIcon({ visibility }: { visibility: string }) {
  const label = useMemo(() => {
    switch (visibility) {
      case 'PRIVATE': return 'Private'
      case 'ANONYMOUS': return 'Anon'
      default: return 'Public'
    }
  }, [visibility])

  return (
    <span className="text-[10px] font-medium tracking-widest uppercase text-brand-text-muted border border-brand-border px-2 py-0.5 rounded-full">
      {label}
    </span>
  )
})

// Memoize the main card component
export default memo(GratitudePostCard, (prevProps, nextProps) => {
  // Only re-render if post content or key props change
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.heartCount === nextProps.post.heartCount &&
    prevProps.post.updatedAt === nextProps.post.updatedAt
  )
})
