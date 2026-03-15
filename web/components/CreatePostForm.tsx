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
    // Reset form
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
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-subheadline text-brand-medium-gray">
            Step {step} of 3
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-brand-medium-gray text-headline"
            >
              ✕
            </button>
          )}
        </div>
        <div className="h-1 bg-brand-light-gray rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
      <div className="p-4 flex gap-3 border-t border-brand-light-gray">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-ios-md border border-brand-light-gray text-headline text-brand-charcoal transition-transform active:scale-95"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !canProceedStep1}
            className={cn(
              'flex-1 py-3 rounded-ios-md text-headline text-white transition-all active:scale-95',
              step === 1 && !canProceedStep1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-primary'
            )}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-ios-md bg-gradient-primary text-headline text-white transition-transform active:scale-95 disabled:opacity-50"
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
    <div className="space-y-5">
      <div>
        <label className="text-title-2 text-brand-charcoal block mb-2">
          What are you grateful for today?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="w-full h-32 px-4 py-3 bg-brand-light-gray rounded-ios-md text-body text-brand-charcoal placeholder:text-brand-medium-gray resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          maxLength={500}
        />
        <p className="text-caption text-brand-medium-gray text-right mt-1">
          {content.length}/500
        </p>
      </div>

      <div>
        <label className="text-headline text-brand-charcoal block mb-2">
          How did it make you feel?
        </label>
        <input
          type="text"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder="Happy, grateful, peaceful..."
          className="w-full px-4 py-3 bg-brand-light-gray rounded-ios-md text-body text-brand-charcoal placeholder:text-brand-medium-gray focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
        />
      </div>

      <div>
        <label className="text-headline text-brand-charcoal block mb-2">
          📎 Add a photo (optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative rounded-ios-md overflow-hidden">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-brand-light-gray rounded-ios-md text-brand-medium-gray hover:border-brand-gold transition-colors"
          >
            Tap to add a photo
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
      <h2 className="text-title-2 text-brand-charcoal mb-4">
        Choose a category
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-ios-lg border-2 transition-all',
              category === cat.value
                ? 'border-current shadow-sm'
                : 'border-transparent bg-brand-light-gray'
            )}
            style={
              category === cat.value
                ? { borderColor: cat.color, backgroundColor: `${cat.color}10` }
                : undefined
            }
          >
            <span className="text-[32px]">{cat.emoji}</span>
            <span
              className="text-headline"
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
        <h2 className="text-title-2 text-brand-charcoal mb-4">
          Who can see this?
        </h2>
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-ios-lg border-2 transition-all text-left',
                visibility === opt.value
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-transparent bg-brand-light-gray'
              )}
            >
              <span className="text-[24px]">{opt.icon}</span>
              <div className="flex-1">
                <p className="text-headline text-brand-charcoal">
                  {opt.label}
                </p>
                <p className="text-caption text-brand-medium-gray">
                  {opt.description}
                </p>
              </div>
              {visibility === opt.value && (
                <span className="text-brand-gold text-headline">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-headline text-brand-medium-gray mb-2">Preview</h3>
        <div className="bg-white rounded-ios-lg shadow-card p-4">
          <p className="text-body text-brand-charcoal mb-2">{content}</p>
          {feeling && (
            <p className="text-subheadline text-brand-medium-gray italic mb-2">
              Feeling: {feeling}
            </p>
          )}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
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
