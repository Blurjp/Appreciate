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
      <div className="bg-white rounded-t-ios-xl sm:rounded-ios-xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-light-gray">
          <button onClick={onClose} className="text-brand-medium-gray text-headline">
            Cancel
          </button>
          <span className="text-headline text-brand-charcoal">Edit Post</span>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={cn(
              'text-headline font-semibold',
              content.trim() ? 'text-brand-gold' : 'text-gray-300'
            )}
          >
            Save
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Content */}
          <div>
            <label className="text-headline text-brand-charcoal block mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-28 px-4 py-3 bg-brand-light-gray rounded-ios-md text-body text-brand-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-headline text-brand-charcoal block mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-ios-md border-2 transition-all',
                    category === cat.value
                      ? 'border-current'
                      : 'border-transparent bg-brand-light-gray'
                  )}
                  style={
                    category === cat.value
                      ? { borderColor: cat.color, backgroundColor: `${cat.color}10` }
                      : undefined
                  }
                >
                  <span className="text-[20px]">{cat.emoji}</span>
                  <span className="text-caption" style={category === cat.value ? { color: cat.color } : undefined}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-headline text-brand-charcoal block mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-ios-md border-2 text-left transition-all',
                    visibility === opt.value
                      ? 'border-brand-gold bg-brand-gold/5'
                      : 'border-transparent bg-brand-light-gray'
                  )}
                >
                  <span>{opt.icon}</span>
                  <span className="text-subheadline text-brand-charcoal">{opt.label}</span>
                  {visibility === opt.value && (
                    <span className="ml-auto text-brand-gold">✓</span>
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
