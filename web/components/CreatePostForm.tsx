'use client'

import { useState, useRef, useEffect } from 'react'
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
import AppreciationCardGenerator from './AppreciationCardGenerator'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onSubmit: (data: {
    content: string
    feeling: string
    category: GratitudeCategory
    visibility: PostVisibility
    photoUrl?: string
  }) => Promise<void>
  onClose?: () => void
}

export default function CreatePostForm({ onSubmit, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [content, setContent] = useState('')
  const [feeling, setFeeling] = useState('')
  const [category, setCategory] = useState<GratitudeCategory>('SMALL_JOYS')
  const [visibility, setVisibility] = useState<PostVisibility>('PRIVATE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [showCardGenerator, setShowCardGenerator] = useState(false)
  const [savedContent, setSavedContent] = useState('')
  const [savedFeeling, setSavedFeeling] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(u => setIsPro(u.isPro ?? false)).catch(() => {})
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const canProceedStep1 = content.trim().length > 0
  const progress = (step / 3) * 100

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError(null)
    const file = e.target.files?.[0]
    if (file) {
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
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('Please sign in again before uploading a photo.')
        }

        const ext = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${safeExt}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, photoFile, {
            cacheControl: '3600',
            contentType: photoFile.type || undefined,
            upsert: false,
          })

        if (uploadError) {
          throw new Error(uploadError.message || 'Photo upload failed.')
        }

        const { data } = supabase.storage.from('photos').getPublicUrl(path)
        photoUrl = data.publicUrl
      }
      await onSubmit({ content, feeling, category, visibility, photoUrl })
      
      // Save content for card generator
      setSavedContent(content)
      setSavedFeeling(feeling)
      
      setConfirmationMessage(randomFrom(CONFIRMATIONS))
      setShowConfirmation(true)
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
    setContent('')
    setFeeling('')
    setCategory('SMALL_JOYS')
    setVisibility('PRIVATE')
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
          <Step1Content
            content={content}
            setContent={setContent}
            feeling={feeling}
            setFeeling={setFeeling}
            photoPreview={photoPreview}
            setPhotoPreview={setPhotoPreview}
            fileInputRef={fileInputRef}
            handlePhotoChange={handlePhotoChange}
          />
        )}
        {step === 2 && (
          <Step2Category
            category={category}
            setCategory={setCategory}
          />
        )}
        {step === 3 && (
          <Step3Visibility
            visibility={visibility}
            setVisibility={setVisibility}
            content={content}
            feeling={feeling}
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
            className="flex-1 py-4 rounded-full border border-brand-border text-subheadline tracking-wide text-brand-text-primary hover:border-brand-primary transition-all active:scale-[0.98]"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !canProceedStep1}
            className={cn(
              'flex-1 py-4 rounded-full text-subheadline tracking-wide text-white font-semibold transition-all active:scale-[0.98]',
              step === 1 && !canProceedStep1
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
            className="flex-1 py-4 rounded-full bg-brand-primary text-subheadline tracking-wide text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
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
        onCreateCard={() => {
          setShowConfirmation(false)
          setShowCardGenerator(true)
        }}
        content={savedContent}
        feeling={savedFeeling}
      />

      {showCardGenerator && (
        <AppreciationCardGenerator
          content={savedContent}
          feeling={savedFeeling}
          isPro={isPro}
          onClose={() => {
            setShowCardGenerator(false)
            handleConfirmationDismiss()
          }}
        />
      )}
    </div>
  )
}

function Step1Content({
  content,
  setContent,
  feeling,
  setFeeling,
  photoPreview,
  setPhotoPreview,
  fileInputRef,
  handlePhotoChange,
}: {
  content: string
  setContent: (v: string) => void
  feeling: string
  setFeeling: (v: string) => void
  photoPreview: string | null
  setPhotoPreview: (v: string | null) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 1</p>
        <label className="text-title-3 text-brand-text-primary block mb-3 font-semibold tracking-tight">
          What are you grateful for?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="w-full h-36 px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
          maxLength={500}
        />
        <p className="text-caption text-brand-text-secondary text-right mt-2">
          {content.length}/500
        </p>
      </div>

      <div>
        <label className="text-headline text-brand-text-primary block mb-3 font-medium">
          How did it make you feel?
        </label>
        <input
          type="text"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder="Happy, grateful, peaceful..."
          className="w-full px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border"
        />
      </div>

      <div>
        <label className="text-headline text-brand-text-primary block mb-3 font-medium">
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
              className="w-full h-44 object-cover"
            />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-lg flex items-center justify-center backdrop-blur-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-10 border border-dashed border-brand-border rounded-xl text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] tracking-widest uppercase">Add a photo</span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

function Step2Category({
  category,
  setCategory,
}: {
  category: GratitudeCategory
  setCategory: (v: GratitudeCategory) => void
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Step 2</p>
      <h2 className="text-title-3 text-brand-text-primary mb-5 font-semibold tracking-tight">
        Choose a category
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'flex flex-col items-center gap-3 p-5 rounded-xl border transition-all',
              category === cat.value
                ? 'border-brand-primary bg-white'
                : 'border-brand-border bg-white hover:border-brand-primary'
            )}
          >
            <svg className={cn('w-8 h-8', category === cat.value ? 'text-brand-primary' : 'text-brand-border')} viewBox="0 0 24 24" fill={category === cat.value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className={cn('text-[10px] tracking-widest uppercase font-medium', category === cat.value ? 'text-brand-primary' : 'text-brand-text-muted')}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step3Visibility({
  visibility,
  setVisibility,
  content,
  feeling,
  category,
}: {
  visibility: PostVisibility
  setVisibility: (v: PostVisibility) => void
  content: string
  feeling: string
  category: { emoji: string; label: string; color: string }
}) {
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
        <div className="rounded-xl p-4 border border-brand-border">
          <p className="text-body text-brand-text-primary mb-2">{content}</p>
          {feeling && (
            <p className="text-subheadline text-brand-text-muted italic mb-3">Feeling: {feeling}</p>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-medium border border-brand-border text-brand-text-muted">
            {category.label}
          </span>
        </div>
      </div>
    </div>
  )
}
