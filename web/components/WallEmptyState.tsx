'use client'

import Link from 'next/link'

interface Props {
  isOwner?: boolean
  embedded?: boolean
}

export default function WallEmptyState({ isOwner, embedded }: Props) {
  const content = (
    <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-border bg-brand-card px-6 py-12 text-center shadow-[0_24px_70px_rgba(62,78,84,0.10)]">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-brand-border bg-brand-surface shadow-warm">
        <svg className="h-9 w-9 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      {isOwner ? (
        <>
          <p className="text-headline text-brand-text-primary">Your wall is waiting</p>
          <p className="mt-2 max-w-xs text-subheadline text-brand-text-secondary">
            Capture your first moment of gratitude and watch your wall come to life.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-subheadline font-semibold text-white transition-all active:scale-95"
          >
            Write your first entry
          </Link>
        </>
      ) : (
        <>
          <p className="text-headline text-brand-text-primary">No moments shared yet</p>
          <p className="mt-2 max-w-xs text-subheadline text-brand-text-secondary">
            This wall will bloom once a moment of gratitude is shared.
          </p>
        </>
      )}
    </div>
  )

  if (embedded) {
    return <>{content}</>
  }

  return (
    <main className="min-h-screen bg-[#EEF3F6] px-4 py-5">
      <section className="mx-auto max-w-4xl">{content}</section>
    </main>
  )
}
