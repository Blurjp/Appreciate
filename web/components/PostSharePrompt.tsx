'use client'

import ShareLinkActions from './ShareLinkActions'

interface Props {
  isVisible: boolean
  message: string
  postId: string
  onDismiss: () => void
}

export default function PostSharePrompt({
  isVisible,
  message,
  postId,
  onDismiss,
}: Props) {
  if (!isVisible) return null

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const shareUrl = `${origin}/share/${postId}`
  const imageUrl = `${origin}/share/${postId}/opengraph-image`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[30px] border border-brand-border bg-white p-6 shadow-[0_30px_80px_rgba(17,17,17,0.16)]">
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-text-muted">
            Post Published
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-text-primary">
            {message}
          </h2>
          <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
            Want to share it now? We already prepared the public link and preview card for social platforms.
          </p>
        </div>

        <ShareLinkActions
          url={shareUrl}
          title="Share this gratitude moment"
          text="I just shared an appreciation on Appreciate."
          imageUrl={imageUrl}
        />

        <button
          onClick={onDismiss}
          className="mt-5 w-full rounded-2xl border border-brand-border py-3.5 text-subheadline font-semibold tracking-wide text-brand-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
