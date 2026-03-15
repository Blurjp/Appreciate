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
    <div className="bg-white rounded-ios-lg shadow-card p-ios-md transition-shadow hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-headline"
          style={{ backgroundColor: category.color }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-headline text-brand-charcoal truncate">
            {authorName}
          </p>
          <p className="text-caption text-brand-medium-gray">
            {timeAgo(post.createdAt)}
          </p>
        </div>
        <VisibilityIcon visibility={post.visibility} />
      </div>

      {/* Content */}
      <p className="text-body text-brand-charcoal mb-2 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Feeling */}
      {post.feeling && (
        <p className="text-subheadline text-brand-medium-gray italic mb-2">
          Feeling: {post.feeling}
        </p>
      )}

      {/* Photo */}
      {post.photoUrl && (
        <div className="mb-3 rounded-ios-md overflow-hidden">
          <img
            src={post.photoUrl}
            alt="Post photo"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
          style={{
            backgroundColor: `${category.color}15`,
            color: category.color,
          }}
        >
          {category.emoji} {category.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-brand-light-gray">
        <button
          onClick={handleHeart}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-subheadline transition-all',
            post.heartCount > 0
              ? 'text-brand-coral'
              : 'text-brand-medium-gray hover:text-brand-coral'
          )}
        >
          <span className={cn(isHeartAnimating && 'animate-heart-bounce')}>
            ❤️
          </span>
          {post.heartCount > 0 && (
            <span className="font-medium">{post.heartCount}</span>
          )}
        </button>

        {showActions && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="px-3 py-1.5 rounded-full text-subheadline text-brand-medium-gray hover:text-brand-charcoal transition-colors"
              >
                ✏️ Edit
              </button>
            )}
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(post)}
                className="px-3 py-1.5 rounded-full text-subheadline text-brand-medium-gray hover:text-brand-charcoal transition-colors"
              >
                {post.visibility === 'PRIVATE' ? '🌐 Make Public' : '🔒 Make Private'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-1.5 rounded-full text-subheadline text-red-500 hover:text-red-700 transition-colors ml-auto"
              >
                🗑️ Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function VisibilityIcon({ visibility }: { visibility: string }) {
  const icon =
    visibility === 'PRIVATE' ? '🔒' : visibility === 'ANONYMOUS' ? '❓' : '🌐'
  return <span className="text-caption">{icon}</span>
}
