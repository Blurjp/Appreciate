'use client'

import { useState } from 'react'
import {
  GratitudePost,
  GratitudeCategory,
  PostVisibility,
  CATEGORIES,
  VISIBILITY_OPTIONS,
} from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  post: GratitudePost
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    id: string
    content: string
    category: GratitudeCategory
    visibility: PostVisibility
  }) => void
}

export default function EditPostModal({ post, isOpen, onClose, onSave }: Props) {
  const [content, setContent] = useState(post.content)
  const [category, setCategory] = useState<GratitudeCategory>(post.category)
  const [visibility, setVisibility] = useState<PostVisibility>(post.visibility)

  if (!isOpen) return null

  const handleSave = () => {
    onSave({ id: post.id, content, category, visibility })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col border border-brand-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border flex-shrink-0">
          <button
            onClick={onClose}
            className="text-subheadline tracking-wide text-brand-text-muted hover:text-brand-text-primary transition-colors"
          >
            Cancel
          </button>
          <span className="text-headline text-brand-text-primary font-semibold">Edit Post</span>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={cn(
              'text-subheadline tracking-wide font-semibold transition-colors',
              content.trim() ? 'text-brand-primary' : 'text-brand-text-muted'
            )}
          >
            Save
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">
          {/* Content */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Content</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              className="w-full h-28 px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
            />
            <p className="text-caption text-brand-text-secondary text-right mt-1">{content.length}/500</p>
          </div>

          {/* Category */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-3">Category</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-4 rounded-xl border transition-all',
                    category === cat.value
                      ? 'border-brand-primary bg-white'
                      : 'border-brand-border bg-white hover:border-brand-primary'
                  )}
                >
                  <svg
                    className={cn('w-7 h-7', category === cat.value ? 'text-brand-primary' : 'text-brand-border')}
                    viewBox="0 0 24 24"
                    fill={category === cat.value ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className={cn('text-[10px] tracking-widest uppercase font-medium', category === cat.value ? 'text-brand-primary' : 'text-brand-text-muted')}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-3">Visibility</p>
            <div className="space-y-3">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                    visibility === opt.value
                      ? 'border-brand-primary bg-white'
                      : 'border-brand-border bg-white hover:border-brand-primary'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0',
                    visibility === opt.value ? 'border-brand-primary' : 'border-brand-border'
                  )}>
                    <svg className={cn('w-4 h-4', visibility === opt.value ? 'text-brand-primary' : 'text-brand-text-muted')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-subheadline text-brand-text-primary font-medium tracking-wide">{opt.label}</p>
                    <p className="text-caption text-brand-text-muted">{opt.description}</p>
                  </div>
                  {visibility === opt.value && (
                    <svg className="w-4 h-4 text-brand-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
