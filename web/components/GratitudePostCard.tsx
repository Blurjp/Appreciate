'use client'

import { useState } from 'react'
import {
  GratitudePost,
  getCategoryMeta,
  timeAgo,
} from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  post: GratitudePost
  showActions?: boolean
  onHeart?: (id: string) => void
  onEdit?: (post: GratitudePost) => void
  onDelete?: (id: string) => void
  onToggleVisibility?: (post: GratitudePost) => void
}

export default function GratitudePostCard({
  post,
  showActions = false,
  onHeart,
  onEdit,
  onDelete,
  onToggleVisibility,
}: Props) {
  const [isHeartAnimating, setIsHeartAnimating] = useState(false)
  const category = getCategoryMeta(post.category)
  const isAnonymous = post.visibility === 'ANONYMOUS'
  const authorName = isAnonymous ? 'Anonymous' : post.author.name
  const initial = isAnonymous ? '?' : authorName[0]?.toUpperCase() || '?'

  const handleHeart = () => {
    setIsHeartAnimating(true)
    onHeart?.(post.id)
    setTimeout(() => setIsHeartAnimating(false), 300)
  }

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

      {/* Photo */}
      {post.photoUrl && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={post.photoUrl}
            alt="Post photo"
            className="w-full h-48 object-cover"
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
      <div className="flex items-center gap-2 pt-3 border-t border-brand-border">
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

        {showActions && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all"
              >
                Edit
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(post)}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all"
              >
                {post.visibility === 'PRIVATE' ? 'Share' : 'Privatise'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-2 rounded-full text-subheadline text-brand-text-muted border border-brand-border hover:border-red-400 hover:text-red-500 transition-all ml-auto"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function HeartIcon({ filled, animating }: { filled: boolean; animating: boolean }) {
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
}

function VisibilityIcon({ visibility }: { visibility: string }) {
  const label = visibility === 'PRIVATE' ? 'Private' : visibility === 'ANONYMOUS' ? 'Anon' : 'Public'
  return (
    <span className="text-[10px] font-medium tracking-widest uppercase text-brand-text-muted border border-brand-border px-2 py-0.5 rounded-full">
      {label}
    </span>
  )
}
