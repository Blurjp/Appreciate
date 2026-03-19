'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ShareLinkActionsProps {
  url: string
  title?: string
  text?: string
  compact?: boolean
}

type StatusTone = 'default' | 'success'

function buildShareCopy(text: string | undefined, url: string) {
  return text ? `${text}\n\n${url}` : url
}

export default function ShareLinkActions({
  url,
  title = 'Share',
  text,
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

  const handleInstagramShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setSuccess('Opened your share sheet for Instagram.')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    await navigator.clipboard.writeText(buildShareCopy(text, url))
    setSuccess('Caption and link copied for Instagram.')
  }

  const openWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=720,height=720')
    setSuccess('Share window opened.')
  }

  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text ?? '')

  return (
    <div className={cn('rounded-2xl border border-brand-border bg-white', compact ? 'p-3' : 'p-4')}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 min-w-[132px] px-4 py-3 rounded-full bg-brand-primary text-white text-subheadline font-semibold tracking-wide transition-all active:scale-[0.98]"
        >
          Copy link
        </button>
        <button
          onClick={() => openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
          className="flex-1 min-w-[132px] px-4 py-3 rounded-full border border-brand-border text-subheadline font-semibold tracking-wide text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          LinkedIn
        </button>
        <button
          onClick={() => openWindow(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`)}
          className="flex-1 min-w-[132px] px-4 py-3 rounded-full border border-brand-border text-subheadline font-semibold tracking-wide text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          X
        </button>
        <button
          onClick={handleInstagramShare}
          className="flex-1 min-w-[132px] px-4 py-3 rounded-full border border-brand-border text-subheadline font-semibold tracking-wide text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          Instagram
        </button>
      </div>
      <p
        className={cn(
          'mt-3 text-xs',
          status.tone === 'success' ? 'text-emerald-600' : 'text-brand-text-muted'
        )}
      >
        {status.message}
      </p>
    </div>
  )
}
