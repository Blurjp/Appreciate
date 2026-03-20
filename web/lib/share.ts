import { CATEGORIES, GratitudePost } from '@/types'

export const DEFAULT_SITE_URL = 'https://appreciate.live'

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString()
}

export function getShareImageUrl(postId: string) {
  return getAbsoluteUrl(`/share/${postId}/opengraph-image`)
}

export function getSharePageUrl(postId: string) {
  return getAbsoluteUrl(`/share/${postId}`)
}

export function getPostShareMeta(post: GratitudePost) {
  const category = CATEGORIES.find((entry) => entry.value === post.category) ?? CATEGORIES[5]
  const authorName = post.visibility === 'ANONYMOUS' ? 'Someone' : post.author.name
  const previewText = post.content.slice(0, 160)
  const previewTitle = post.content.length > 90 ? `${post.content.slice(0, 87)}...` : post.content
  const shareImageUrl = getShareImageUrl(post.id)

  return {
    authorName,
    category,
    previewText,
    previewTitle,
    shareImageUrl,
    sharePageUrl: getSharePageUrl(post.id),
  }
}
