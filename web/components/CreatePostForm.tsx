'use client'

import { useState, useRef } from 'react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const canProceedStep1 = content.trim().length > 0
  const progress = (step / 3) * 100

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit({ content, feeling, category, visibility })
      setConfirmationMessage(randomFrom(CONFIRMATIONS))
      setShowConfirmation(true)
    } catch {
      // Error handling
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
    setStep(1)
    onClose?.()
  }

  const selectedCategory = getCategoryMeta(category)

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-subheadline text-brand-text-secondary font-medium">
            Step {step} of 3
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center text-brand-text-secondary hover:bg-brand-border transition-all"
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
      <div className="p-5 flex gap-3 border-t border-brand-border bg-brand-card">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-4 rounded-xl border border-brand-border text-headline text-brand-text-primary transition-all active:scale-[0.98]"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !canProceedStep1}
            className={cn(
              'flex-1 py-4 rounded-xl text-headline text-white font-semibold transition-all active:scale-[0.98]',
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
            className="flex-1 py-4 rounded-xl bg-brand-primary text-headline text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Sharing...' : 'Share Gratitude ✨'}
          </button>
        )}
      </div>

      <ConfirmationOverlay
        isVisible={showConfirmation}
        message={confirmationMessage}
        onDismiss={handleConfirmationDismiss}
      />
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
        <label className="text-title-3 text-brand-text-primary block mb-3 font-semibold">
          What are you grateful for today?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="w-full h-36 px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
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
          className="w-full px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border"
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
            className="w-full py-10 border-2 border-dashed border-brand-border rounded-xl text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[24px]">📷</span>
              <span className="text-subheadline">Tap to add a photo</span>
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
      <h2 className="text-title-3 text-brand-text-primary mb-5 font-semibold">
        Choose a category
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all',
              category === cat.value
                ? 'border-current shadow-sm'
                : 'border-brand-border bg-brand-surface hover:border-brand-text-muted'
            )}
            style={
              category === cat.value
                ? { borderColor: cat.color, backgroundColor: `${cat.color}10` }
                : undefined
            }
          >
            <span className="text-[36px]">{cat.emoji}</span>
            <span
              className="text-headline font-medium"
              style={
                category === cat.value
                  ? { color: cat.color }
                  : { color: '#8E8E93' }
              }
            >
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
        <h2 className="text-title-3 text-brand-text-primary mb-5 font-semibold">
          Who can see this?
        </h2>
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                visibility === opt.value
                  ? 'border-brand-primary bg-brand-accent-light'
                  : 'border-brand-border bg-brand-surface hover:border-brand-text-muted'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                visibility === opt.value ? 'bg-brand-primary text-white' : 'bg-brand-surface'
              )}>
                <span className="text-[20px]">{opt.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-headline text-brand-text-primary font-medium">
                  {opt.label}
                </p>
                <p className="text-caption text-brand-text-secondary">
                  {opt.description}
                </p>
              </div>
              {visibility === opt.value && (
                <span className="text-brand-primary text-headline font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-headline text-brand-text-secondary mb-3 font-medium">Preview</h3>
        <div className="bg-brand-card rounded-xl shadow-card p-4 border border-brand-border">
          <p className="text-body text-brand-text-primary mb-2">{content}</p>
          {feeling && (
            <p className="text-subheadline text-brand-text-secondary italic mb-3">
              Feeling: {feeling}
            </p>
          )}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-caption font-medium"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
            }}
          >
            {category.emoji} {category.label}
          </span>
        </div>
      </div>
    </div>
  )
}
