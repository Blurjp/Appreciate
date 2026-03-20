'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import html2canvas from 'html2canvas'
import UpgradeModal from './UpgradeModal'

export interface CardTemplate {
  id: string
  name: string
  background: string
  textColor: string
  accentColor: string
}

export type CardBackgroundSource = 'template' | 'photo' | 'ai'

export const PHOTO_CARD_TEMPLATE_ID = 'photo'

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    textColor: '#1a1a1a',
    accentColor: '#ff6b6b',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    textColor: '#4a1942',
    accentColor: '#ff6b9d',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    id: 'forest',
    name: 'Forest',
    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    accentColor: '#f0e68c',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    textColor: '#4a1942',
    accentColor: '#ff69b4',
  },
  {
    id: 'golden',
    name: 'Golden',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
  },
  {
    id: 'peach',
    name: 'Peach',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#5d4e37',
    accentColor: '#ff6b6b',
  },
]

interface ResolvedCardPresentation {
  source: CardBackgroundSource
  background: string
  textColor: string
  accentColor: string
  label: string
  overlayClassName?: string
}

interface Props {
  content: string
  feeling?: string
  authorName?: string
  photoPreview?: string | null
  isPro?: boolean
  embedded?: boolean
  initialCardTemplateId?: string | null
  onContentChange?: (value: string) => void
  onCardTemplateIdChange?: (value: string) => void
  onApply?: (data: { content: string; feeling: string; cardTemplateId: string }) => void
  onClose?: () => void
}

export function resolveCardPresentation(cardTemplateId?: string | null, photoUrl?: string | null): ResolvedCardPresentation {
  if (cardTemplateId === PHOTO_CARD_TEMPLATE_ID && photoUrl) {
    return {
      source: 'photo',
      background: `url(${photoUrl}) center/cover`,
      textColor: '#ffffff',
      accentColor: '#ffffff',
      label: 'Your Photo',
      overlayClassName: 'bg-black/35',
    }
  }

  if (cardTemplateId?.startsWith('ai:')) {
    const aiUrl = cardTemplateId.slice(3)
    return {
      source: 'ai',
      background: `url(${aiUrl}) center/cover`,
      textColor: '#ffffff',
      accentColor: '#ffffff',
      label: 'AI Remix',
      overlayClassName: 'bg-black/28',
    }
  }

  const template = CARD_TEMPLATES.find((entry) => entry.id === cardTemplateId) ?? CARD_TEMPLATES[0]
  return {
    source: 'template',
    background: template.background,
    textColor: template.textColor,
    accentColor: template.accentColor,
    label: template.name,
  }
}

function getInitialSource(initialCardTemplateId?: string | null, hasPhotoPreview?: boolean): CardBackgroundSource {
  if (initialCardTemplateId === PHOTO_CARD_TEMPLATE_ID && hasPhotoPreview) return 'photo'
  if (initialCardTemplateId?.startsWith('ai:')) return 'ai'
  return 'template'
}

async function extractPhotoPaletteHint(photoPreview: string) {
  if (typeof window === 'undefined') return undefined

  const image = new Image()
  image.crossOrigin = 'anonymous'
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to load uploaded photo'))
  })
  image.src = photoPreview
  await loaded

  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 24
  const context = canvas.getContext('2d')
  if (!context) return undefined

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

  let r = 0
  let g = 0
  let b = 0

  for (let index = 0; index < data.length; index += 4) {
    r += data[index]
    g += data[index + 1]
    b += data[index + 2]
  }

  const samples = data.length / 4
  const average = {
    r: r / samples,
    g: g / samples,
    b: b / samples,
  }

  const brightness = (average.r + average.g + average.b) / 3
  const brightnessHint = brightness > 180 ? 'bright airy light' : brightness > 110 ? 'balanced natural light' : 'moody low light'

  const sortedChannels = [
    { key: 'red', value: average.r },
    { key: 'green', value: average.g },
    { key: 'blue', value: average.b },
  ].sort((a, b) => b.value - a.value)

  const primary = sortedChannels[0]?.key
  const secondary = sortedChannels[1]?.key

  const paletteMap: Record<string, string> = {
    red: 'warm rose and amber tones',
    green: 'earthy green and sage tones',
    blue: 'cool blue and indigo tones',
  }

  const secondaryMap: Record<string, string> = {
    red: 'with coral warmth',
    green: 'with soft botanical depth',
    blue: 'with calm atmospheric depth',
  }

  return `${brightnessHint}, ${paletteMap[primary] || 'soft neutral tones'} ${secondaryMap[secondary] || ''}`.trim()
}

export default function AppreciationCardGenerator({
  content,
  feeling,
  authorName = 'Anonymous',
  photoPreview,
  isPro = false,
  embedded = false,
  initialCardTemplateId,
  onContentChange,
  onCardTemplateIdChange,
  onApply,
  onClose,
}: Props) {
  const initialAiUrl = initialCardTemplateId?.startsWith('ai:') ? initialCardTemplateId.slice(3) : null
  const initialTemplate = initialCardTemplateId && !initialCardTemplateId.startsWith('ai:') && initialCardTemplateId !== PHOTO_CARD_TEMPLATE_ID
    ? CARD_TEMPLATES.find((template) => template.id === initialCardTemplateId) ?? CARD_TEMPLATES[0]
    : CARD_TEMPLATES[0]

  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(initialTemplate)
  const [backgroundSource, setBackgroundSource] = useState<CardBackgroundSource>(
    getInitialSource(initialCardTemplateId, Boolean(photoPreview))
  )
  const [customText, setCustomText] = useState(content)
  const [customFeeling, setCustomFeeling] = useState(feeling || '')
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(initialAiUrl)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const hasPhotoPreview = Boolean(photoPreview)
  const resolvedCardTemplateId = useMemo(() => {
    if (backgroundSource === 'photo' && hasPhotoPreview) return PHOTO_CARD_TEMPLATE_ID
    if (backgroundSource === 'ai' && aiImageUrl) return `ai:${aiImageUrl}`
    return selectedTemplate.id
  }, [aiImageUrl, backgroundSource, hasPhotoPreview, selectedTemplate.id])

  useEffect(() => {
    onCardTemplateIdChange?.(resolvedCardTemplateId)
  }, [onCardTemplateIdChange, resolvedCardTemplateId])

  const previewCard = useMemo(
    () => resolveCardPresentation(
      backgroundSource === 'photo' && hasPhotoPreview
        ? PHOTO_CARD_TEMPLATE_ID
        : backgroundSource === 'ai' && aiImageUrl
          ? `ai:${aiImageUrl}`
          : selectedTemplate.id,
      photoPreview
    ),
    [aiImageUrl, backgroundSource, hasPhotoPreview, photoPreview, selectedTemplate.id]
  )

  const handleGenerateAIImage = async () => {
    if (!customText.trim()) return

    setIsGeneratingAI(true)
    try {
      const photoPaletteHint = photoPreview ? await extractPhotoPaletteHint(photoPreview) : undefined
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: customText,
          feeling: customFeeling,
          photoPaletteHint,
          hasPhotoReference: Boolean(photoPreview),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const result = await response.json()
      if (!result.data?.imageURL) {
        throw new Error('No image returned')
      }

      setAiImageUrl(result.data.imageURL)
      setBackgroundSource('ai')
    } catch (error) {
      console.error('Failed to generate AI image:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleExport = async () => {
    if (!cardRef.current || isExporting) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      const link = document.createElement('a')
      link.download = `appreciation-card-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to export card:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!cardRef.current || isExporting) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          try {
            const file = new File([blob], 'appreciation-card.png', { type: 'image/png' })
            await navigator.share({
              files: [file],
              title: 'My Appreciation',
              text: customText,
            })
          } catch (error) {
            console.error('Failed to share:', error)
          }
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to share card:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const sourceCards: Array<{
    id: CardBackgroundSource
    title: string
    description: string
    disabled?: boolean
    badge?: string
  }> = [
    {
      id: 'photo',
      title: 'Use Uploaded Photo',
      description: hasPhotoPreview
        ? 'Turn the uploaded moment into a full-bleed background.'
        : 'Add a photo first to unlock this background option.',
      disabled: !hasPhotoPreview,
    },
    {
      id: 'template',
      title: 'Choose a Template',
      description: 'Pick a polished art direction with predictable text contrast.',
    },
    {
      id: 'ai',
      title: 'AI Remix',
      description: hasPhotoPreview
        ? 'Generate a new background from your words and your photo’s palette.'
        : 'Generate a new background from your words and feeling.',
      badge: !isPro ? 'Pro' : undefined,
    },
  ]

  return (
    <>
      <div className={cn(
        embedded
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm'
      )}>
        <div className={cn(
          'flex w-full flex-col overflow-hidden rounded-[32px] border border-brand-border bg-white',
          embedded
            ? 'shadow-[0_20px_50px_rgba(17,17,17,0.08)]'
            : 'max-h-[92vh] max-w-6xl shadow-[0_30px_80px_rgba(17,17,17,0.18)]'
        )}>
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-text-muted">Create Card</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-text-primary">
                Design the background first, then publish the appreciation
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-text-secondary">
                You can build the card from your uploaded photo, a curated template, or an AI remix that follows your message and feeling.
              </p>
            </div>
            {!embedded && onClose && (
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                ✕
              </button>
            )}
          </div>

          <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-brand-border px-6 py-6 lg:border-b-0 lg:border-r">
              <div className="mb-5 grid gap-3 md:grid-cols-3">
                {sourceCards.map((source) => {
                  const isSelected = backgroundSource === source.id
                  return (
                    <button
                      key={source.id}
                      onClick={() => {
                        if (source.disabled) return
                        if (source.id === 'ai' && !isPro) {
                          setShowUpgrade(true)
                          return
                        }
                        setBackgroundSource(source.id)
                      }}
                      className={cn(
                        'rounded-3xl border p-4 text-left transition-all',
                        source.disabled
                          ? 'cursor-not-allowed border-brand-border/70 bg-brand-surface/60 text-brand-text-muted'
                          : isSelected
                            ? 'border-brand-primary bg-amber-50'
                            : 'border-brand-border bg-white hover:border-brand-primary'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-brand-text-primary">{source.title}</p>
                        {source.badge && (
                          <span className="rounded-full border border-brand-border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-brand-text-muted">
                            {source.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-brand-text-secondary">{source.description}</p>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-center">
                <div
                  ref={cardRef}
                  className="relative flex h-[470px] w-[350px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/40 p-7 shadow-[0_28px_60px_rgba(17,17,17,0.18)]"
                  style={{ background: previewCard.background }}
                >
                  {previewCard.overlayClassName && (
                    <div className={cn('absolute inset-0', previewCard.overlayClassName)} />
                  )}

                  {previewCard.source === 'template' && (
                    <>
                      <div
                        className="absolute right-0 top-0 h-36 w-36 rounded-full opacity-20"
                        style={{ background: previewCard.accentColor, transform: 'translate(28%, -28%)' }}
                      />
                      <div
                        className="absolute bottom-0 left-0 h-28 w-28 rounded-full opacity-20"
                        style={{ background: previewCard.accentColor, transform: 'translate(-30%, 30%)' }}
                      />
                    </>
                  )}

                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <span
                          className="text-xs font-semibold uppercase tracking-[0.34em]"
                          style={{ color: previewCard.accentColor }}
                        >
                          Gratitude
                        </span>
                      </div>
                      <span
                        className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em]"
                        style={{ color: previewCard.textColor, background: previewCard.source === 'template' ? 'rgba(255,255,255,0.28)' : 'rgba(17,17,17,0.16)' }}
                      >
                        {previewCard.label}
                      </span>
                    </div>

                    <p
                      className="text-[30px] font-semibold leading-[1.2]"
                      style={{ color: previewCard.textColor }}
                    >
                      &ldquo;{customText || 'Your appreciation message will appear here.'}&rdquo;
                    </p>

                    {customFeeling && (
                      <p
                        className="mt-5 text-base italic opacity-85"
                        style={{ color: previewCard.textColor }}
                      >
                        Feeling: {customFeeling}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: previewCard.source === 'template' ? previewCard.accentColor : 'rgba(255,255,255,0.22)',
                          color: '#ffffff',
                        }}
                      >
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: previewCard.textColor }}>
                          {authorName}
                        </p>
                        <p className="text-xs opacity-75" style={{ color: previewCard.textColor }}>
                          appreciate.live
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl">🙏</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-brand-border bg-brand-surface/55 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-muted">
                    Card Copy
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-brand-text-primary">Message</label>
                      <textarea
                        value={customText}
                        onChange={(event) => {
                          setCustomText(event.target.value)
                          onContentChange?.(event.target.value)
                        }}
                        className="h-32 w-full resize-none rounded-2xl border border-brand-border bg-white px-4 py-3 text-body text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        maxLength={200}
                      />
                      <p className="mt-1 text-right text-xs text-brand-text-muted">{customText.length}/200</p>
                    </div>
                  </div>
                </div>

                {backgroundSource === 'photo' && (
                  <div className="rounded-[28px] border border-brand-border bg-white p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-muted">
                      Your Photo
                    </p>
                    {photoPreview ? (
                      <>
                        <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                          Your uploaded image becomes the full card background with an automatic dark overlay for text readability.
                        </p>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-brand-border">
                          <img src={photoPreview} alt="Uploaded background preview" className="h-40 w-full object-cover" />
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                        Add a photo in step 1 to use it as the background.
                      </p>
                    )}
                  </div>
                )}

                {backgroundSource === 'template' && (
                  <div className="rounded-[28px] border border-brand-border bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-muted">
                          Template Studio
                        </p>
                        <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                          Choose a polished visual direction when you want fast, reliable contrast and consistent styling.
                        </p>
                      </div>
                      <span className="rounded-full border border-brand-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-text-muted">
                        {selectedTemplate.name}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {CARD_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template)
                            setBackgroundSource('template')
                          }}
                          className={cn(
                            'rounded-3xl border p-2 transition-all',
                            selectedTemplate.id === template.id
                              ? 'border-brand-primary ring-2 ring-brand-primary ring-offset-2'
                              : 'border-brand-border hover:border-brand-primary'
                          )}
                        >
                          <div className="h-20 rounded-2xl" style={{ background: template.background }} />
                          <p className="mt-2 text-xs font-semibold text-brand-text-primary">{template.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {backgroundSource === 'ai' && (
                  <div className="rounded-[28px] border border-brand-border bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-muted">
                          AI Remix
                        </p>
                        <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                          Generate a fresh background from the appreciation text.
                          {photoPreview ? ' Your uploaded photo also contributes palette and mood hints.' : ''}
                        </p>
                      </div>
                      {!isPro && (
                        <span className="rounded-full border border-brand-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-text-muted">
                          Pro
                        </span>
                      )}
                    </div>

                    {photoPreview && (
                      <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface/60 px-4 py-3 text-xs leading-5 text-brand-text-secondary">
                        The AI background is not copying the uploaded image pixel-for-pixel. It is using your words plus the photo&rsquo;s color/vibe hint to keep the card visually coherent.
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={isPro ? handleGenerateAIImage : () => setShowUpgrade(true)}
                        disabled={isPro && (isGeneratingAI || !customText.trim())}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-4 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        <SparkleIcon />
                        {isGeneratingAI ? 'Generating...' : aiImageUrl ? 'Regenerate Background' : 'Generate AI Background'}
                      </button>

                      {aiImageUrl && (
                        <button
                          onClick={() => setBackgroundSource('ai')}
                          className="rounded-2xl border border-brand-border px-5 py-4 text-sm font-semibold text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
                        >
                          Use Current AI Result
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className={cn('flex gap-3', onApply && !embedded && 'flex-wrap')}>
                  {onApply && !embedded && (
                    <button
                      onClick={() => onApply({
                        content: customText,
                        feeling: customFeeling,
                        cardTemplateId: resolvedCardTemplateId,
                      })}
                      disabled={!customText.trim()}
                      className="w-full rounded-2xl bg-brand-primary py-4 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      Use This Card
                    </button>
                  )}

                  <button
                    onClick={handleExport}
                    disabled={isExporting || !customText.trim()}
                    className="flex-1 rounded-2xl border border-brand-border py-4 text-sm font-semibold text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : 'Download PNG'}
                  </button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleShare}
                      disabled={isExporting || !customText.trim()}
                      className="flex-1 rounded-2xl bg-gray-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                    >
                      Share Card
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}

function SparkleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
}
