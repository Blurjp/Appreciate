'use client'

import { useState } from 'react'

interface Props {
  currentTheme: string
  onClose: () => void
}

const THEMES = [
  {
    id: 'starry',
    name: 'Starry Night',
    emoji: '✨',
    description: 'Constellations of gratitude in the night sky',
    preview: 'linear-gradient(135deg, #0a0a35 0%, #151050 50%, #1a1260 100%)',
    starColor: '#FFF4B8',
  },
  {
    id: 'tree',
    name: 'Gratitude Tree',
    emoji: '🌳',
    description: 'Every appreciation is a leaf on your tree',
    preview: 'linear-gradient(135deg, #FAF6EE 0%, #F5EFE3 50%, #EDE8DF 100%)',
    starColor: '#7D8C6E',
  },
  {
    id: 'zen',
    name: 'Zen Garden',
    emoji: '🪨',
    description: 'Seeds of gratitude growing in peaceful harmony',
    preview: 'linear-gradient(135deg, #E8E4D8 0%, #D4CCB8 50%, #C8C0A8 100%)',
    starColor: '#7D8C6E',
  },
  {
    id: 'polaroid',
    name: 'Polaroid Gallery',
    emoji: '📸',
    description: 'Snapshot memories scattered like instant photos',
    preview: 'linear-gradient(135deg, #F5F0E8 0%, #E8E0D4 50%, #DCCCB8 100%)',
    starColor: '#C4704B',
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    emoji: '🧊',
    description: 'Frosted glass panels floating over shifting colors',
    preview: 'linear-gradient(135deg, #A8B8FF 0%, #D4A0FF 50%, #FFB0C8 100%)',
    starColor: '#B8A0FF',
  },
]

export default function ThemePicker({ currentTheme, onClose }: Props) {
  const [selected, setSelected] = useState(currentTheme)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const handleSelect = async (themeId: string) => {
    setSelected(themeId)
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallTheme: themeId }),
      })
      const data = await res.json()
      if (res.ok) {
        // Reload the page to show the new theme
        window.location.reload()
      } else {
        setError(data.error || 'Failed to save theme')
        setSelected(currentTheme) // revert
      }
    } catch {
      setError('Network error — please try again')
      setSelected(currentTheme) // revert
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Picker panel */}
      <div
        className="relative w-full max-w-lg mx-4 mb-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-title-3 text-warm-ink-500 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              Choose your view
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-cream-200 text-warm-ink-300 hover:text-warm-ink-500 transition-all"
            >
              ×
            </button>
          </div>
          <p className="text-caption text-warm-ink-300">
            Pick how your gratitude wall looks to others
          </p>
          {error && (
            <p className="text-caption text-red-500 mt-1">{error}</p>
          )}
        </div>

        {/* Theme list */}
        <div className="px-6 pb-6 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          {THEMES.map((theme) => {
            const isActive = selected === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                disabled={saving}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  isActive
                    ? 'border-brand-primary bg-brand-primary/5 shadow-warm'
                    : 'border-brand-border bg-white hover:border-brand-primary/30 hover:shadow-warm'
                } ${saving ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Preview swatch */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  style={{ background: theme.preview }}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className="text-2xl">{theme.emoji}</span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`text-headline ${isActive ? 'text-brand-primary' : 'text-warm-ink-500'}`}>
                    {theme.name}
                  </p>
                  <p className="text-caption text-warm-ink-300 mt-0.5 leading-snug">
                    {theme.description}
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
