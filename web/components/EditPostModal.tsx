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
      <div className="bg-brand-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up border border-brand-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <button
            onClick={onClose}
            className="text-brand-text-secondary text-headline font-medium"
          >
            Cancel
          </button>
          <span className="text-headline text-brand-text-primary font-semibold">Edit Post</span>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={cn(
              'text-headline font-semibold transition-colors',
              content.trim() ? 'text-brand-primary' : 'text-brand-text-muted'
            )}
          >
            Save
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Content */}
          <div>
            <label className="text-headline text-brand-text-primary block mb-3 font-medium">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-28 px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-headline text-brand-text-primary block mb-3 font-medium">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    category === cat.value
                      ? 'border-current'
                      : 'border-brand-border bg-brand-surface hover:border-brand-text-muted'
                  )}
                  style={
                    category === cat.value
                      ? { borderColor: cat.color, backgroundColor: `${cat.color}10` }
                      : undefined
                  }
                >
                  <span className="text-[22px]">{cat.emoji}</span>
                  <span className="text-caption font-medium" style={category === cat.value ? { color: cat.color } : undefined}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-headline text-brand-text-primary block mb-3 font-medium">
              Visibility
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    visibility === opt.value
                      ? 'border-brand-primary bg-brand-accent-light'
                      : 'border-brand-border bg-brand-surface hover:border-brand-text-muted'
                  )}
                >
                  <span className="text-[20px]">{opt.icon}</span>
                  <span className="text-subheadline text-brand-text-primary font-medium">{opt.label}</span>
                  {visibility === opt.value && (
                    <span className="ml-auto text-brand-primary font-bold">✓</span>
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
