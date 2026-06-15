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
import { CARD_TEMPLATES } from './AppreciationCardGenerator'
import UpgradeModal from './UpgradeModal'

interface Props {
  post: GratitudePost
  isOpen: boolean
  isPro?: boolean
  onClose: () => void
  onSave: (data: {
    id: string
    content: string
    feeling: string
    category: GratitudeCategory
    visibility: PostVisibility
    cardTemplateId: string
  }) => void
}

export default function EditPostModal({ post, isOpen, isPro = false, onClose, onSave }: Props) {
  const [content, setContent] = useState(post.content)
  const [feeling, setFeeling] = useState(post.feeling ?? '')
  const [category, setCategory] = useState<GratitudeCategory>(post.category)
  const [visibility, setVisibility] = useState<PostVisibility>(post.visibility)
  const existingAiUrl = post.cardTemplateId?.startsWith('ai:') ? post.cardTemplateId.slice(3) : null
  const [cardTemplateId, setCardTemplateId] = useState(post.cardTemplateId ?? 'minimal')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(existingAiUrl)
  const [aiError, setAiError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    onSave({ id: post.id, content, feeling, category, visibility, cardTemplateId })
    onClose()
  }

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, feeling }),
      })
      const result = await res.json()
      if (!res.ok || !result.data?.imageURL) {
        throw new Error(result.error || 'Failed to generate image. Please try again.')
      }
      setAiImageUrl(result.data.imageURL)
      setCardTemplateId('ai:' + result.data.imageURL)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate image.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const selectedTemplate = CARD_TEMPLATES.find((t) => t.id === cardTemplateId)
  const isAiSelected = cardTemplateId.startsWith('ai:')

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col border border-brand-border">
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
                className="w-full h-28 px-4 py-3 bg-white rounded-xl text-body text-[#211713] placeholder:text-[#6B5E57] resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
              />
              <p className="text-caption text-brand-text-secondary text-right mt-1">{content.length}/500</p>
            </div>

            {/* Card Background */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-3">Card Background</p>

              {/* Mini preview */}
              <div
                className="w-full h-20 rounded-xl mb-3 relative overflow-hidden"
                style={{
                  background: isAiSelected && aiImageUrl
                    ? `url(${aiImageUrl}) center/cover`
                    : selectedTemplate?.background ?? CARD_TEMPLATES[0].background,
                }}
              >
                {isAiSelected && <div className="absolute inset-0 bg-black/20" />}
                <p
                  className="absolute inset-0 flex items-center justify-center text-caption font-medium px-4 text-center line-clamp-2"
                  style={{ color: isAiSelected ? '#ffffff' : (selectedTemplate?.textColor ?? '#1a1a1a') }}
                >
                  {content || 'Your gratitude...'}
                </p>
              </div>

              {/* Template swatches */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {CARD_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCardTemplateId(t.id)}
                    title={t.name}
                    className={cn(
                      'h-12 rounded-xl border-2 transition-all',
                      cardTemplateId === t.id
                        ? 'border-brand-primary ring-2 ring-brand-primary ring-offset-1'
                        : 'border-brand-border hover:border-brand-primary'
                    )}
                    style={{ background: t.background }}
                  >
                    <span className="sr-only">{t.name}</span>
                  </button>
                ))}
              </div>

              {/* AI background button */}
              <button
                onClick={isPro ? handleGenerateAI : () => setShowUpgrade(true)}
                disabled={isPro && (isGeneratingAI || !content.trim())}
                className={cn(
                  'w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-subheadline font-medium transition-all',
                  isAiSelected
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-brand-border text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary',
                  'disabled:opacity-40'
                )}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                {isGeneratingAI
                  ? 'Generating...'
                  : isAiSelected
                    ? 'Regenerate AI Background'
                    : isPro
                      ? 'Generate AI Background'
                      : 'Generate AI Background ✦ Pro'}
              </button>
              {aiError && (
                <p className="-mt-1 text-xs text-red-500">{aiError}</p>
              )}
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

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
