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
  const [category, setCategory] = useState<GratitudeCategory>('SMALL_JOYS')
  const [visibility, setVisibility] = useState<PostVisibility>('PRIVATE')
  const [cardTemplateId, setCardTemplateId] = useState<string>('')
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

  const canProceedStep1 = content.trim().length > 0
  const progress = (step / 4) * 100

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
    if (isSubmitting) return
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
        : cardTemplateId || 'minimal'
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
    setCategory('SMALL_JOYS')
    setVisibility('PRIVATE')
    setCardTemplateId('')
    setPhotoPreview(null)
    setPhotoFile(null)
    setStep(1)
    onClose?.()
  }

  const selectedCategory = getCategoryMeta(category)

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">
            {step} / 4
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
          <Step1Message
            content={content}
            setContent={setContent}
            category={category}
            setCategory={setCategory}
          />
        )}
        {step === 2 && (
          <Step2Photo
            photoPreview={photoPreview}
            onRemovePhoto={() => {
              setPhotoPreview(null)
              setPhotoFile(null)
              setCardTemplateId((current) => current === PHOTO_CARD_TEMPLATE_ID ? '' : current)
            }}
            fileInputRef={fileInputRef}
            handlePhotoChange={handlePhotoChange}
          />
        )}
        {step === 3 && (
          <Step3CardDesigner
            content={content}
            photoPreview={photoPreview}
            isPro={isPro}
            cardTemplateId={cardTemplateId}
            onCardTemplateIdChange={setCardTemplateId}
          />
        )}
        {step === 4 && (
          <Step4Visibility
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
            className="flex-1 py-4 rounded-full border-2 border-pink-100 text-subheadline font-semibold tracking-wide text-gray-600 hover:border-pink-300 hover:text-pink-500 bg-white transition-all active:scale-95 shadow-md shadow-pink-50"
          >
            ← Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !canProceedStep1}
            className={cn(
              'flex-1 py-4 rounded-full text-subheadline tracking-wide font-semibold transition-all active:scale-95 shadow-lg',
              step === 1 && !canProceedStep1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-pink-200 hover:shadow-xl hover:shadow-pink-300'
            )}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-subheadline tracking-wide text-white font-semibold transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300"
          >
            {isSubmitting ? '✨ Sharing...' : '💖 Share'}
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

function Step1Message({
  content,
  setContent,
  category,
  setCategory,
}: {
  content: string
  setContent: (v: string) => void
  category: GratitudeCategory
  setCategory: (v: GratitudeCategory) => void
}) {
  return (
    <div className="space-y-6">
      {/* 🎀 Kawaii Step Header */}
      <div>
        <p className="text-sm text-pink-400 mb-1 flex items-center gap-1.5">
          <span className="animate-sparkle">✨</span>
          Step 1
          <span className="animate-sparkle">✨</span>
        </p>
        <label className="text-title-3 text-gray-700 block mb-2 font-bold tracking-tight">
          What are you grateful for? 💖
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Start with the appreciation itself, then shape how it looks in the next steps. 🌸
        </p>
      </div>

      {/* 🎀 Kawaii Card */}
      <div className="rounded-[32px] border-2 border-pink-100 bg-white p-5 shadow-lg shadow-pink-100/50 hover:shadow-xl transition-shadow">
        <div className="flex items-end justify-between gap-3">
          <label className="text-headline text-gray-700 block font-semibold flex items-center gap-2">
            <span>📝</span> Your appreciation
          </label>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-500 border-2 border-pink-100">
            {content.length}/200
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="mt-4 h-40 w-full resize-none rounded-3xl border-2 border-pink-100 bg-gradient-to-b from-pink-50/30 to-white px-5 py-4 text-body leading-6 text-gray-700 placeholder:text-pink-300 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all"
          maxLength={200}
        />
      </div>

      {/* 🎀 Kawaii Category Selection */}
      <div>
        <div className="mb-4">
          <p className="text-headline font-semibold text-gray-700 flex items-center gap-2">
            <span>🏷️</span> Choose a category
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This tags the moment without interrupting the main writing step. ✨
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2 rounded-3xl border-2 px-4 py-5 text-center transition-all transform hover:scale-105 active:scale-95',
              category === cat.value
                ? 'border-transparent shadow-lg scale-105'
                : 'border-pink-100 bg-white hover:border-pink-200 hover:shadow-md'
            )}
            style={category === cat.value ? { background: cat.gradient } : {}}
          >
            {category === cat.value && (
              <span className="absolute -top-1.5 -right-1.5 text-lg animate-sparkle">✨</span>
            )}
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md transition-all',
                category === cat.value 
                  ? 'bg-white/90 scale-110' 
                  : 'bg-gradient-to-br from-pink-50 to-purple-50'
              )}
            >
              {cat.emoji}
            </div>
            <p className={cn(
              'text-sm font-semibold transition-colors',
              category === cat.value ? 'text-white' : 'text-gray-700'
            )}>
              {cat.label}
            </p>
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}

function Step2Photo({
  photoPreview,
  onRemovePhoto,
  fileInputRef,
  handlePhotoChange,
}: {
  photoPreview: string | null
  onRemovePhoto: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 2</p>
        <label className="text-title-3 text-brand-text-primary block mb-2 font-semibold tracking-tight">
          Add a photo
        </label>
        <p className="text-sm text-brand-text-secondary">
          Optional, but useful if you want to use the photo directly or feed it into AI remix.
        </p>
      </div>

      <div className="rounded-[28px] border border-brand-border bg-white p-5 shadow-[0_16px_36px_rgba(17,17,17,0.05)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <label className="text-headline text-brand-text-primary block font-medium">
              Upload image
            </label>
            <p className="mt-1 text-sm text-brand-text-secondary">
              If you skip this, the designer will still offer templates and AI remix from text alone.
            </p>
          </div>
          {photoPreview && (
            <button
              onClick={onRemovePhoto}
              className="rounded-full border border-brand-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        {photoPreview ? (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-brand-border">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-72 w-full object-cover"
            />
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 w-full rounded-[24px] border border-dashed border-brand-border bg-brand-surface/35 py-16 text-brand-text-muted transition-all hover:border-brand-primary hover:text-brand-primary"
          >
            <div className="flex flex-col items-center gap-3">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] tracking-widest uppercase">Upload Photo</span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

function Step3CardDesigner({
  content,
  photoPreview,
  isPro,
  cardTemplateId,
  onCardTemplateIdChange,
}: {
  content: string
  photoPreview: string | null
  isPro: boolean
  cardTemplateId: string
  onCardTemplateIdChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 3</p>
        <label className="text-title-3 text-brand-text-primary block mb-2 font-semibold tracking-tight">
          Design your card
        </label>
        <p className="text-sm text-brand-text-secondary">
          First choose a background type. The next controls appear based on that selection.
        </p>
      </div>

      <AppreciationCardGenerator
        content={content}
        photoPreview={photoPreview}
        isPro={isPro}
        embedded
        initialCardTemplateId={cardTemplateId || null}
        onCardTemplateIdChange={onCardTemplateIdChange}
      />
    </div>
  )
}

function Step4Visibility({
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
  category: { emoji: string; label: string; color: string }
}) {
  const preview = resolveCardPresentation(cardTemplateId, photoPreview)

  return (
    <div className="space-y-6">
      <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 4</p>
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-medium border border-brand-border text-brand-text-muted">
            {category.label}
          </span>
        </div>
      </div>
    </div>
  )
}
