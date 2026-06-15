'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import {
  GratitudeCategory,
  PostVisibility,
  CATEGORIES,
  VISIBILITY_OPTIONS,
  CONFIRMATIONS,
  getCategoryMeta,
} from '@/types'
import { cn, randomFrom } from '@/lib/utils'
import ConfirmationOverlay from './ConfirmationOverlay'
import { resolveCardPresentation } from './AppreciationCardGenerator'
import PostSharePrompt from './PostSharePrompt'

const AppreciationCardGenerator = dynamic(
  () => import('./AppreciationCardGenerator'),
  { ssr: false }
)

const CATEGORY_TEMPLATE_MAP: Record<GratitudeCategory, string> = {
  FAMILY: 'sunset',
  WORK: 'golden',
  SMALL_JOYS: 'peach',
  NATURE: 'forest',
  HEALTH: 'lavender',
  OTHER: 'ocean',
}

interface Props {
  onSubmit: (data: {
    content: string
    category: GratitudeCategory
    visibility: PostVisibility
    photoUrl?: string
    cardTemplateId?: string
  }) => Promise<{ id: string }>
  onClose?: () => void
  isPro?: boolean
}

export default function CreatePostForm({ onSubmit, onClose, isPro = false }: Props) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<GratitudeCategory>('SMALL_JOYS')
  const [visibility, setVisibility] = useState<PostVisibility>('PRIVATE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sharePromptPostId, setSharePromptPostId] = useState<string | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showCardDesigner, setShowCardDesigner] = useState(false)
  const [createdPostContent, setCreatedPostContent] = useState('')
  const [createdPostId, setCreatedPostId] = useState<string | null>(null)

  const canSubmit = content.trim().length > 0

  const handleSubmit = async () => {
    if (isSubmitting || !canSubmit) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const cardTemplateId = CATEGORY_TEMPLATE_MAP[category]
      const createdPost = await onSubmit({ content, category, visibility, cardTemplateId })
      setCreatedPostContent(content)
      setCreatedPostId(createdPost.id)
      const nextMessage = randomFrom(CONFIRMATIONS)
      setConfirmationMessage(nextMessage)
      if (visibility === 'PRIVATE') {
        setShowConfirmation(true)
      } else {
        setSharePromptPostId(createdPost.id)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmationDismiss = () => {
    setShowConfirmation(false)
    setSharePromptPostId(null)
    setCreatedPostId(null)
    setContent('')
    setCategory('SMALL_JOYS')
    setVisibility('PRIVATE')
    onClose?.()
  }

  const handleApplyCard = async ({ cardTemplateId }: { content: string; feeling: string; cardTemplateId: string }) => {
    if (!createdPostId) return
    try {
      const res = await fetch(`/api/posts/${createdPostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardTemplateId }),
      })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        queryClient.invalidateQueries({ queryKey: ['my-wall'] })
        queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      }
    } catch {
      // best-effort; share/download still work
    }
    setShowCardDesigner(false)
  }

  const selectedCategory = getCategoryMeta(category)
  const preview = resolveCardPresentation(CATEGORY_TEMPLATE_MAP[category])

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="font-serif text-title-3 text-brand-text-primary tracking-tight">
          What are you grateful for?
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="glass-chip flex h-8 w-8 items-center justify-center rounded-full text-brand-text-muted transition-all hover:text-brand-primary"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <div className="glass-chip rounded-2xl p-5">
          <div className="flex items-end justify-between gap-3">
            <label className="text-sm text-brand-text-secondary font-medium">Your appreciation</label>
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-surface text-brand-text-muted border border-brand-divider">
              {content.length}/500
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Today I'm grateful for..."
            className="mt-4 h-36 w-full resize-none rounded-xl border border-brand-border bg-white/88 px-4 py-3 text-body leading-6 text-[#211713] placeholder:text-[#6B5E57] transition-all focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
            maxLength={500}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-brand-text-primary mb-3">Category</p>
          <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                category === cat.value
                  ? 'border-transparent text-white shadow-warm'
                  : 'glass-chip text-brand-text-primary hover:text-brand-primary'
              )}
              style={category === cat.value ? { backgroundColor: cat.color } : {}}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className={cn(
                'text-sm font-medium',
                category === cat.value ? 'text-white' : 'text-brand-text-primary'
              )}>
                {cat.label}
              </span>
            </button>
          ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-brand-text-primary mb-3">Who can see this?</p>
          <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition-all',
                visibility === opt.value
                  ? 'border-brand-primary bg-white/62'
                  : 'glass-chip hover:border-brand-primary'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center border',
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
                <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-3">Preview</p>
          <div
            className="relative overflow-hidden rounded-xl border border-brand-border p-4"
            style={{ background: preview.background }}
          >
            {preview.overlayClassName && <div className={cn('absolute inset-0', preview.overlayClassName)} />}
            <p className="relative z-10 text-body mb-3" style={{ color: preview.textColor }}>
              {content || 'Your gratitude will appear here...'}
            </p>
            <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-medium border border-brand-border text-brand-text-muted">
              {selectedCategory.label}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-border bg-white/82 p-5 backdrop-blur-xl">
        {submitError && (
          <p className="mb-3 text-sm text-red-500">{submitError}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className={cn(
            'w-full py-3.5 rounded-xl text-subheadline tracking-wide font-medium transition-all active:scale-95',
            canSubmit
              ? 'bg-brand-primary text-white shadow-button hover:bg-brand-accent-dark disabled:opacity-60'
              : 'bg-brand-surface/90 text-brand-text-secondary cursor-not-allowed border border-brand-border'
          )}
        >
          {isSubmitting ? 'Saving...' : 'Save entry'}
        </button>
      </div>

      <ConfirmationOverlay
        isVisible={showConfirmation}
        message={confirmationMessage}
        onDismiss={handleConfirmationDismiss}
        onCreateCard={() => setShowCardDesigner(true)}
      />

      {sharePromptPostId && (
        <PostSharePrompt
          isVisible={Boolean(sharePromptPostId)}
          message={confirmationMessage}
          postId={sharePromptPostId}
          onDismiss={handleConfirmationDismiss}
          onDesignCard={() => setShowCardDesigner(true)}
        />
      )}

      {showCardDesigner && (
        <AppreciationCardGenerator
          content={createdPostContent}
          isPro={isPro}
          initialCardTemplateId={CATEGORY_TEMPLATE_MAP[category]}
          onApply={handleApplyCard}
          onClose={() => setShowCardDesigner(false)}
        />
      )}
    </div>
  )
}
