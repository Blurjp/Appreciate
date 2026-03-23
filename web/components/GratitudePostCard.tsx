'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import Image from 'next/image'
import {
  GratitudePost,
  getCategoryMeta,
  timeAgo,
  KAWAII_DECORATIONS,
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

// 🎀 Random cute decoration
function getRandomSparkle() {
  const sparkles = [...KAWAII_DECORATIONS.sparkles, ...KAWAII_DECORATIONS.hearts.slice(0, 3)]
  return sparkles[Math.floor(Math.random() * sparkles.length)]
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
  const [sparkle] = useState(() => getRandomSparkle())

  // Memoize computed values
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
    () => `${authorName} shared a gratitude moment on Appreciate. 💖`,
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
    <div className="relative">
      {/* 🎀 Decorative sparkle */}
      <span className="absolute -top-2 -right-2 text-xl animate-sparkle z-10">
        {sparkle}
      </span>
      
      {/* 🎀 Main Card - Super rounded and cute */}
      <div className="bg-white rounded-[32px] p-5 border-2 border-pink-100 shadow-lg shadow-pink-100/50 transition-all hover:shadow-xl hover:shadow-pink-200/50 hover:-translate-y-1 hover:border-pink-200">
        
        {/* 🎀 Header with cute avatar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Cute gradient avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center font-bold text-pink-600 text-lg shadow-md shadow-pink-100">
              {initial}
            </div>
            {/* Cute status dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px]">
              ✨
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-700 truncate flex items-center gap-1.5">
              {authorName}
              {post.heartCount > 5 && <span className="text-xs">💖</span>}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <span className="text-xs">🕐</span>
              {timeAgo(post.createdAt)}
            </p>
          </div>
          
          {/* 🎀 Visibility badge - cute style */}
          <VisibilityBadge visibility={post.visibility} />
        </div>

        {/* 🎀 Content with cute quote styling */}
        <div className="relative mb-4">
          <span className="absolute -left-1 -top-1 text-3xl text-pink-300 opacity-50">&ldquo;</span>
          <p className="text-gray-700 text-[15px] leading-relaxed pl-4 pr-2 whitespace-pre-wrap">
            {post.content}
          </p>
          <span className="absolute -right-1 -bottom-3 text-3xl text-pink-300 opacity-50">&rdquo;</span>
        </div>

        {/* 🎀 Feeling tag */}
        {post.feeling && (
          <div className="mb-4 pl-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-pink-50 to-purple-50 text-purple-600 border border-purple-100">
              <span>💭</span>
              <span className="italic">{post.feeling}</span>
            </span>
          </div>
        )}

        {/* 🎀 Card Background */}
        <CardBackground post={post} />

        {/* 🎀 Photo with rounded corners */}
        {post.photoUrl && post.cardTemplateId !== PHOTO_CARD_TEMPLATE_ID && (
          <div className="mb-4 rounded-3xl overflow-hidden relative h-52 shadow-md shadow-pink-100">
            <Image
              src={post.photoUrl}
              alt="Post photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Cute photo overlay */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs flex items-center gap-1">
              <span>📸</span>
            </div>
          </div>
        )}

        {/* 🎀 Category Badge - Sticker style */}
        <div className="flex items-center gap-2 mb-4">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transform -rotate-1 hover:rotate-0 transition-transform"
            style={{ 
              background: category.gradient,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-base">{category.emoji}</span>
            <span>{category.label}</span>
          </span>
        </div>

        {/* 🎀 Actions - Super cute buttons */}
        <div className="pt-3 border-t-2 border-pink-50">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Heart button */}
            <button
              onClick={handleHeart}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 active:scale-95',
                post.heartCount > 0
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-200'
                  : 'bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-100 hover:border-pink-200'
              )}
            >
              <HeartIcon filled={post.heartCount > 0} animating={isHeartAnimating} />
              {post.heartCount > 0 && (
                <span className="font-bold">{post.heartCount}</span>
              )}
            </button>

            {/* Share button */}
            <button
              onClick={handleShareToggle}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 active:scale-95',
                isShareOpen
                  ? 'bg-gradient-to-r from-purple-400 to-violet-400 text-white shadow-lg shadow-purple-200'
                  : 'bg-purple-50 text-purple-500 hover:bg-purple-100 border-2 border-purple-100 hover:border-purple-200'
              )}
            >
              <span>🔗</span>
              <span>{isShareOpen ? 'Close' : 'Share'}</span>
            </button>

            {showActions && (
              <>
                {/* Edit button */}
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-teal-50 text-teal-500 hover:bg-teal-100 border-2 border-teal-100 hover:border-teal-200 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                )}
                
                {/* Visibility toggle */}
                {onToggleVisibility && (
                  <button
                    onClick={handleToggleVisibility}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 border-2 border-amber-100 hover:border-amber-200 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <span>{post.visibility === 'PRIVATE' ? '🌸' : '🔒'}</span>
                    <span>{post.visibility === 'PRIVATE' ? 'Share' : 'Privatise'}</span>
                  </button>
                )}
                
                {/* Delete button */}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-red-50 text-red-400 hover:bg-red-100 border-2 border-red-100 hover:border-red-200 transition-all transform hover:scale-105 active:scale-95 ml-auto"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Share actions */}
          {isShareOpen && (
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-pink-100">
              <ShareLinkActions
                url={shareUrl}
                title="Share this gratitude moment ✨"
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

// 🎀 Card Background Component
const CardBackground = ({ post }: { post: GratitudePost }) => {
  const cardStyle = useMemo(() => {
    if (!post.cardTemplateId || post.cardTemplateId === 'minimal') return null
    return resolveCardPresentation(post.cardTemplateId, post.photoUrl)
  }, [post.cardTemplateId, post.photoUrl])

  if (!cardStyle) return null

  return (
    <div
      className="mb-4 rounded-3xl overflow-hidden relative p-5 min-h-[140px] flex flex-col justify-between shadow-lg"
      style={{ background: cardStyle.background }}
    >
      {cardStyle.overlayClassName && (
        <div className={cn('absolute inset-0 rounded-3xl', cardStyle.overlayClassName)} />
      )}
      
      {/* Decorative corner sparkle */}
      <span className="absolute top-2 right-2 text-xl opacity-60">✨</span>
      
      <p
        className="relative z-10 text-[15px] font-medium leading-relaxed line-clamp-4"
        style={{ color: cardStyle.textColor }}
      >
        &ldquo;{post.content}&rdquo;
      </p>
      {post.feeling && (
        <p
          className="relative z-10 text-sm italic mt-2 opacity-80 flex items-center gap-1"
          style={{ color: cardStyle.textColor }}
        >
          <span>💭</span> {post.feeling}
        </p>
      )}
    </div>
  )
}

// 🎀 Heart Icon - Cute animated heart
const HeartIcon = memo(function HeartIcon({ filled, animating }: { filled: boolean; animating: boolean }) {
  return (
    <span 
      className={cn(
        'text-lg transition-transform',
        animating && 'animate-bounce'
      )}
    >
      {filled ? '💖' : '🤍'}
    </span>
  )
})

// 🎀 Visibility Badge - Cute pill style
const VisibilityBadge = memo(function VisibilityBadge({ visibility }: { visibility: string }) {
  const { icon, label, bgClass } = useMemo(() => {
    switch (visibility) {
      case 'PRIVATE':
        return { icon: '🔒', label: 'Private', bgClass: 'bg-amber-50 text-amber-600 border-amber-200' }
      case 'ANONYMOUS':
        return { icon: '🦋', label: 'Anon', bgClass: 'bg-purple-50 text-purple-600 border-purple-200' }
      default:
        return { icon: '🌸', label: 'Public', bgClass: 'bg-pink-50 text-pink-600 border-pink-200' }
    }
  }, [visibility])

  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border-2 ${bgClass}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  )
})

// Memoize the main card component
export default memo(GratitudePostCard, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.heartCount === nextProps.post.heartCount &&
    prevProps.post.updatedAt === nextProps.post.updatedAt
  )
})
