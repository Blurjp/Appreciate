'use client'

import { useEffect, useRef, useState } from 'react'
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
import AppreciationCardGenerator, {
  PHOTO_CARD_TEMPLATE_ID,
  resolveCardPresentation,
} from './AppreciationCardGenerator'
import PostSharePrompt from './PostSharePrompt'

interface Props {
  onSubmit: (data: {
    content: string
    category: GratitudeCategory
    visibility: PostVisibility
    photoUrl?: string
    cardTemplateId?: string
  }) => Promise<{ id: string }>
  onClose?: () => void
}

export default function CreatePostForm({ onSubmit, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<GratitudeCategory | null>(null)
  const [visibility, setVisibility] = useState<PostVisibility>('PRIVATE')
  const [cardTemplateId, setCardTemplateId] = useState<string>('minimal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sharePromptPostId, setSharePromptPostId] = useState<string | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(u => setIsPro(u.isPro ?? false)).catch(() => {})
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const canProceedStep1 = category !== null
  const canProceedStep2 = content.trim().length > 0
  const progress = (step / 3) * 100

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError(null)
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please choose an image file.')
        return
      }

      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || !category) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let photoUrl: string | undefined
      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)

        const uploadRes = await fetch('/api/uploads/post-image', {
          method: 'POST',
          body: formData,
        })

        const uploadBody = await uploadRes.json().catch(() => null)
        if (!uploadRes.ok) {
          throw new Error(uploadBody?.error || 'Photo upload failed.')
        }

        photoUrl = uploadBody?.url
      }
      const resolvedCardTemplateId = cardTemplateId === PHOTO_CARD_TEMPLATE_ID && !photoUrl
        ? 'minimal'
        : cardTemplateId
      const createdPost = await onSubmit({ content, category, visibility, photoUrl, cardTemplateId: resolvedCardTemplateId })
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
          : 'We could not attach your photo. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmationDismiss = () => {
    setShowConfirmation(false)
    setSharePromptPostId(null)
    setContent('')
    setCategory(null)
    setVisibility('PRIVATE')
    setCardTemplateId('minimal')
    setPhotoPreview(null)
    setPhotoFile(null)
    setStep(1)
    onClose?.()
  }

  const selectedCategory = category ? getCategoryMeta(category) : null

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">
            {step} / 3
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-all"
            >
              ✕
            </button>
          )}
        </div>
        <div className="h-1.5 bg-brand-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {step === 1 && (
          <Step1Category
            category={category}
            setCategory={setCategory}
          />
        )}
        {step === 2 && (
          <Step2CardDesigner
            content={content}
            setContent={setContent}
            photoPreview={photoPreview}
            onRemovePhoto={() => {
              setPhotoPreview(null)
              setPhotoFile(null)
              setCardTemplateId((current) => current === PHOTO_CARD_TEMPLATE_ID ? 'minimal' : current)
            }}
            fileInputRef={fileInputRef}
            handlePhotoChange={handlePhotoChange}
            isPro={isPro}
            cardTemplateId={cardTemplateId}
            onCardTemplateIdChange={setCardTemplateId}
          />
        )}
        {step === 3 && (
          <Step3Visibility
            visibility={visibility}
            setVisibility={setVisibility}
            content={content}
            cardTemplateId={cardTemplateId}
            photoPreview={photoPreview}
            category={selectedCategory}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="p-5 border-t border-brand-border bg-white">
        {submitError && (
          <p className="mb-3 text-sm text-red-500">{submitError}</p>
        )}
        <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-4 rounded-xl border border-brand-border text-subheadline tracking-wide text-brand-text-primary hover:border-brand-primary transition-all active:scale-[0.98]"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
            className={cn(
              'flex-1 py-4 rounded-xl text-subheadline tracking-wide text-white font-semibold transition-all active:scale-[0.98]',
              (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)
                ? 'bg-brand-border cursor-not-allowed'
                : 'bg-brand-primary'
            )}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-xl bg-brand-primary text-subheadline tracking-wide text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        )}
        </div>
      </div>

      <ConfirmationOverlay
        isVisible={showConfirmation}
        message={confirmationMessage}
        onDismiss={handleConfirmationDismiss}
      />

      {sharePromptPostId && (
        <PostSharePrompt
          isVisible={Boolean(sharePromptPostId)}
          message={confirmationMessage}
          postId={sharePromptPostId}
          onDismiss={handleConfirmationDismiss}
        />
      )}

    </div>
  )
}

function Step1Category({
  category,
  setCategory,
}: {
  category: GratitudeCategory | null
  setCategory: (v: GratitudeCategory) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 1</p>
        <label className="text-title-3 text-brand-text-primary block mb-2 font-semibold tracking-tight">
          Choose a category
        </label>
        <p className="text-sm text-brand-text-secondary mb-4">
          Set the tone for your gratitude moment.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-2xl border px-5 py-6 text-center transition-all',
              category === cat.value
                ? 'border-brand-primary bg-white shadow-[0_10px_24px_rgba(17,17,17,0.08)]'
                : 'border-brand-border bg-white hover:border-brand-primary hover:shadow-sm'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl',
                category === cat.value ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border bg-brand-surface'
              )}
            >
              {cat.emoji}
            </div>
            <p className="text-sm font-semibold text-brand-text-primary">
              {cat.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step2CardDesigner({
  content,
  setContent,
  photoPreview,
  onRemovePhoto,
  fileInputRef,
  handlePhotoChange,
  isPro,
  cardTemplateId,
  onCardTemplateIdChange,
}: {
  content: string
  setContent: (v: string) => void
  photoPreview: string | null
  onRemovePhoto: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isPro: boolean
  cardTemplateId: string
  onCardTemplateIdChange: (v: string) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 2</p>
        <label className="text-title-3 text-brand-text-primary block mb-2 font-semibold tracking-tight">
          Write & design your card
        </label>
        <p className="text-sm text-brand-text-secondary">
          Express your gratitude and customize how it looks.
        </p>
      </div>

      {/* Content Input */}
      <div>
        <label className="text-headline text-brand-text-primary block mb-2 font-medium">
          What are you grateful for?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="w-full h-28 px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
          maxLength={200}
        />
        <p className="text-caption text-brand-text-secondary text-right mt-1">
          {content.length}/200
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="text-headline text-brand-text-primary block mb-2 font-medium">
          Add a photo (optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-36 object-cover"
            />
            <button
              onClick={onRemovePhoto}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-lg flex items-center justify-center backdrop-blur-sm text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border border-dashed border-brand-border rounded-xl text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] tracking-widest uppercase">Add a photo</span>
            </div>
          </button>
        )}
      </div>

      {/* Card Designer */}
      <AppreciationCardGenerator
        content={content}
        photoPreview={photoPreview}
        isPro={isPro}
        embedded
        initialCardTemplateId={cardTemplateId}
        onCardTemplateIdChange={onCardTemplateIdChange}
      />
    </div>
  )
}

function Step3Visibility({
  visibility,
  setVisibility,
  content,
  cardTemplateId,
  photoPreview,
  category,
}: {
  visibility: PostVisibility
  setVisibility: (v: PostVisibility) => void
  content: string
  cardTemplateId: string
  photoPreview: string | null
  category: { emoji: string; label: string; color: string } | null
}) {
  const preview = resolveCardPresentation(cardTemplateId, photoPreview)

  return (
    <div className="space-y-6">
      <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 3</p>
      <h2 className="text-title-3 text-brand-text-primary mb-5 font-semibold tracking-tight">
        Who can see this?
      </h2>
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
                'w-10 h-10 rounded-full flex items-center justify-center border',
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

      {/* Preview */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-3">Preview</p>
        <div
          className="relative overflow-hidden rounded-xl border border-brand-border p-4"
          style={{ background: preview.background }}
        >
          {preview.overlayClassName && <div className={cn('absolute inset-0', preview.overlayClassName)} />}
          <p className="relative z-10 text-body mb-3" style={{ color: preview.textColor }}>{content}</p>
          {category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-medium border border-brand-border text-brand-text-muted">
              {category.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
