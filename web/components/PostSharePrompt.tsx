'use client'

import ShareLinkActions from './ShareLinkActions'

interface Props {
  isVisible: boolean
  message: string
  postId: string
  onDismiss: () => void
  onDesignCard?: () => void
}

export default function PostSharePrompt({
  isVisible,
  message,
  postId,
  onDismiss,
  onDesignCard,
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

        {onDesignCard && (
          <button
            onClick={onDesignCard}
            className="mt-3 w-full rounded-2xl bg-brand-primary py-3.5 text-subheadline font-semibold tracking-wide text-white transition-colors hover:opacity-90 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Design a Beautiful Card
          </button>
        )}

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
