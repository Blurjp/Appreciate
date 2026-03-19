'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import html2canvas from 'html2canvas'
import { createClient } from '@/lib/supabase/client'

export interface CardTemplate {
  id: string
  name: string
  background: string
  textColor: string
  accentColor: string
  decoration?: string
}

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

interface Props {
  content: string
  feeling?: string
  authorName?: string
  onClose?: () => void
}

export default function AppreciationCardGenerator({
  content,
  feeling,
  authorName = 'Anonymous',
  onClose,
}: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(CARD_TEMPLATES[0])
  const [customText, setCustomText] = useState(content)
  const [customFeeling, setCustomFeeling] = useState(feeling || '')
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null)
  const [useAiImage, setUseAiImage] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleGenerateAIImage = async () => {
    setIsGeneratingAI(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://appreciate-production.up.railway.app/api/v1'}/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          content: customText,
          feeling: customFeeling,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const result = await response.json()
      setAiImageUrl(result.data.imageURL)
      setUseAiImage(true)
    } catch (error) {
      console.error('Failed to generate AI image:', error)
      alert('Failed to generate AI image. Please try again.')
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create Appreciation Card</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-5 space-y-6">
          {/* Card Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-80 h-96 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
              style={{ 
                background: useAiImage && aiImageUrl 
                  ? `url(${aiImageUrl}) center/cover` 
                  : selectedTemplate.background 
              }}
            >
              {/* Overlay for AI image */}
              {useAiImage && aiImageUrl && (
                <div className="absolute inset-0 bg-black/30" />
              )}
              
              {/* Decorative Elements */}
              {!useAiImage && (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <svg viewBox="0 0 100 100" fill={selectedTemplate.accentColor}>
                      <circle cx="80" cy="20" r="40" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
                    <svg viewBox="0 0 100 100" fill={selectedTemplate.accentColor}>
                      <circle cx="20" cy="80" r="30" />
                    </svg>
                  </div>
                </>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <span
                    className="text-sm font-medium tracking-wider uppercase"
                    style={{ color: useAiImage ? '#ffffff' : selectedTemplate.accentColor }}
                  >
                    Gratitude
                  </span>
                </div>
                
                <p
                  className="text-lg leading-relaxed font-medium"
                  style={{ color: useAiImage ? '#ffffff' : selectedTemplate.textColor }}
                >
                  "{customText}"
                </p>

                {customFeeling && (
                  <p
                    className="mt-4 text-sm italic opacity-80"
                    style={{ color: useAiImage ? '#ffffff' : selectedTemplate.textColor }}
                  >
                    Feeling: {customFeeling}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: useAiImage ? 'rgba(255,255,255,0.3)' : selectedTemplate.accentColor }}
                  >
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: useAiImage ? '#ffffff' : selectedTemplate.textColor }}
                  >
                    {authorName}
                  </span>
                </div>
                <span className="text-2xl">🙏</span>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a Template
            </label>
            <div className="grid grid-cols-4 gap-3">
              {CARD_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    'h-16 rounded-xl border-2 transition-all',
                    selectedTemplate.id === template.id
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  style={{ background: template.background }}
                  title={template.name}
                >
                  <span className="sr-only">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Message
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {customText.length}/200
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How does it make you feel?
              </label>
              <input
                type="text"
                value={customFeeling}
                onChange={(e) => setCustomFeeling(e.target.value)}
                placeholder="Happy, grateful, peaceful..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* AI Image Generation */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              AI Generated Background
            </label>
            <button
              onClick={handleGenerateAIImage}
              disabled={isGeneratingAI || !customText.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
              {isGeneratingAI ? 'Generating...' : aiImageUrl ? 'Regenerate AI Image' : 'Generate AI Image'}
            </button>
            
            {aiImageUrl && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseAiImage(true)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                    useAiImage
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  Use AI Image
                </button>
                <button
                  onClick={() => setUseAiImage(false)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                    !useAiImage
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  Use Template
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting || !customText.trim()}
              className="flex-1 py-3.5 bg-brand-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Exporting...' : 'Download'}
            </button>
            
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                disabled={isExporting || !customText.trim()}
                className="flex-1 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
