'use client'

import { useState } from 'react'
import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'

interface ShareLinkActionsProps {
  url: string
  title?: string
  text?: string
  imageUrl?: string
  compact?: boolean
}

type StatusTone = 'default' | 'success'

type SharePlatform = 'copy' | 'x' | 'facebook' | 'linkedin' | 'instagram'

function buildShareCopy(text: string | undefined, url: string) {
  return text ? `${text}\n\n${url}` : url
}

function buildInstagramCopy(title: string, text: string | undefined, url: string) {
  return `${title}\n${buildShareCopy(text, url)}`
}

export default function ShareLinkActions({
  url,
  title = 'Share',
  text,
  imageUrl,
  compact = false,
}: ShareLinkActionsProps) {
  const [status, setStatus] = useState<{ message: string; tone: StatusTone }>({
    message: 'Share this gratitude link anywhere.',
    tone: 'default',
  })

  const setSuccess = (message: string) => {
    setStatus({ message, tone: 'success' })
    window.setTimeout(() => {
      setStatus((current) =>
        current.message === message
          ? { message: 'Share this gratitude link anywhere.', tone: 'default' }
          : current
      )
    }, 2500)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setSuccess('Link copied.')
  }

  const handlePlatformShare = (platform: Exclude<SharePlatform, 'copy' | 'instagram'>, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=720,height=720')
    const labels: Record<typeof platform, string> = {
      x: 'X',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
    }
    setSuccess(`${labels[platform]} share opened.`)
  }

  const handleInstagramShare = async () => {
    if (imageUrl && navigator.share) {
      try {
        const response = await fetch(imageUrl)
        if (response.ok) {
          const blob = await response.blob()
          const file = new File([blob], 'appreciation-card.png', { type: blob.type || 'image/png' })
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title,
              text,
              files: [file],
            })
            setSuccess('Opened your image share sheet for Instagram.')
            return
          }
        }
      } catch {
        // Fall through to the standard share/copy path.
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setSuccess('Opened your share sheet for Instagram.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    await navigator.clipboard.writeText(buildInstagramCopy(title, text, url))
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    setSuccess('Caption copied. Instagram opened in a new tab.')
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text ?? '')
  const cards: Array<{
    id: SharePlatform
    label: string
    hint: string
    icon: ReactElement
    onClick: () => void | Promise<void>
    accentClass: string
    bgClass: string
  }> = [
    {
      id: 'copy',
      label: 'Copy Link',
      hint: 'Grab the share URL for messages or anywhere else.',
      icon: <LinkIcon />,
      onClick: handleCopy,
      accentClass: 'text-brand-primary',
      bgClass: 'bg-amber-50 border-amber-200 hover:border-amber-300',
    },
    {
      id: 'x',
      label: 'Share on X',
      hint: 'Open a prefilled post with your appreciation link.',
      icon: <XIcon />,
      onClick: () => handlePlatformShare('x', `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`),
      accentClass: 'text-slate-900',
      bgClass: 'bg-slate-50 border-slate-200 hover:border-slate-300',
    },
    {
      id: 'facebook',
      label: 'Share on Facebook',
      hint: 'Send this gratitude moment to your Facebook feed.',
      icon: <FacebookIcon />,
      onClick: () => handlePlatformShare('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
      accentClass: 'text-blue-600',
      bgClass: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    },
    {
      id: 'linkedin',
      label: 'Share on LinkedIn',
      hint: 'Open a LinkedIn share dialog with the public link.',
      icon: <LinkedInIcon />,
      onClick: () => handlePlatformShare('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`),
      accentClass: 'text-sky-700',
      bgClass: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
    },
    {
      id: 'instagram',
      label: 'Share on Instagram',
      hint: 'Copy the caption and open Instagram for a manual paste.',
      icon: <InstagramIcon />,
      onClick: handleInstagramShare,
      accentClass: 'text-fuchsia-700',
      bgClass: 'bg-pink-50 border-pink-200 hover:border-pink-300',
    },
  ]

  return (
    <div className={cn('rounded-[28px] border border-brand-border bg-white/95 shadow-[0_18px_50px_rgba(17,17,17,0.08)]', compact ? 'p-4' : 'p-5')}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-muted">
            Share Appreciation
          </p>
          <h3 className="mt-1 text-base font-semibold text-brand-text-primary">
            Post this gratitude moment where people already follow you
          </h3>
        </div>
        <div className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-text-muted">
          public link
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => void card.onClick()}
            className={cn(
              'group rounded-3xl border p-4 text-left transition-all active:scale-[0.99]',
              card.bgClass
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm', card.accentClass)}>
                {card.icon}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-text-muted">
                {card.id === 'copy' ? 'utility' : 'social'}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-brand-text-primary">
                {card.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-brand-text-secondary">
                {card.hint}
              </p>
            </div>
          </button>
        ))}
      </div>
      <p
        className={cn(
          'mt-4 text-xs leading-5',
          status.tone === 'success' ? 'text-emerald-600' : 'text-brand-text-muted'
        )}
      >
        {status.message}
      </p>
    </div>
  )
}

function LinkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69a4.5 4.5 0 0 1 1.24 7.24l-4.5 4.5a4.5 4.5 0 0 1-6.37-6.36l1.76-1.77" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.81 15.31a4.5 4.5 0 0 1-1.24-7.24l4.5-4.5a4.5 4.5 0 1 1 6.37 6.36l-1.76 1.77" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.88-7.42L5.59 22H2.48l7.24-8.28L1.8 2h6.4l4.41 6.73L18.9 2Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.56c0-.93.26-1.56 1.6-1.56h1.71V4.14c-.3-.04-1.31-.14-2.5-.14-2.48 0-4.18 1.52-4.18 4.32v2.28H7.3v3.2h2.83V22h3.37Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.3 6.9 1.96 1.96 0 0 0 5.25 3ZM20.44 12.73c0-3.44-1.83-5.04-4.27-5.04-1.97 0-2.85 1.08-3.34 1.84V8.5H9.45c.04.68 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.69.13-.93.27-.69.88-1.4 1.9-1.4 1.34 0 1.88 1.02 1.88 2.5V20H20v-6.87Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
