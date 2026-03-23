'use client'

import ShareLinkActions from '@/components/ShareLinkActions'

interface Props {
  authorName: string
  postId?: string
}

export default function ShareCardClient({ authorName, postId }: Props) {
  return (
    <div className="mt-4">
      <ShareLinkActions
        url={typeof window === 'undefined' ? '' : window.location.href}
        title="Share this gratitude moment"
        text={`${authorName} shared a gratitude moment on Appreciate.`}
        imageUrl={postId ? `/share/${postId}/opengraph-image` : undefined}
      />
    </div>
  )
}
