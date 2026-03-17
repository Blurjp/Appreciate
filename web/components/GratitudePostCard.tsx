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
    <div className="bg-brand-card rounded-2xl shadow-card p-5 border border-brand-border transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-headline"
          style={{ backgroundColor: category.color }}
        >
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
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caption font-medium"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
        >
          {category.emoji} {category.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-brand-border">
        <button
          onClick={handleHeart}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-subheadline font-medium transition-all',
            post.heartCount > 0
              ? 'bg-brand-accent-light text-brand-primary'
              : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-accent-light hover:text-brand-primary'
          )}
        >
          <span className={cn(isHeartAnimating && 'animate-heart-bounce')}>
            ❤️
          </span>
          {post.heartCount > 0 && (
            <span>{post.heartCount}</span>
          )}
        </button>

        {showActions && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="px-3 py-2 rounded-xl text-subheadline text-brand-text-secondary hover:bg-brand-surface transition-all"
              >
                ✏️
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(post)}
                className="px-3 py-2 rounded-xl text-subheadline text-brand-text-secondary hover:bg-brand-surface transition-all"
              >
                {post.visibility === 'PRIVATE' ? '🌐' : '🔒'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-2 rounded-xl text-subheadline text-red-500 hover:bg-red-50 transition-all ml-auto"
              >
                🗑️
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function VisibilityIcon({ visibility }: { visibility: string }) {
  if (visibility === 'PRIVATE') {
    return (
      <div className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center">
        <span className="text-caption">🔒</span>
      </div>
    )
  }
  if (visibility === 'ANONYMOUS') {
    return (
      <div className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center">
        <span className="text-caption">❓</span>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-brand-accent-light flex items-center justify-center">
      <span className="text-caption">🌐</span>
    </div>
  )
}
