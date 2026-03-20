import { GratitudePost, CATEGORIES } from '@/types'
import { Metadata } from 'next'
import ShareCardClient from './ShareCardClient'
import { fetchSharedPost } from '@/lib/posts'
import { getPostShareMeta, getSiteUrl } from '@/lib/share'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchSharedPost(params.id)
  if (!post || post.visibility === 'PRIVATE') {
    return {
      title: 'Appreciate — A moment of gratitude',
      metadataBase: new URL(getSiteUrl()),
    }
  }
  const { authorName, previewText, shareImageUrl, sharePageUrl } = getPostShareMeta(post)
  return {
    metadataBase: new URL(getSiteUrl()),
    title: `${authorName} is grateful — Appreciate`,
    description: previewText,
    openGraph: {
      title: `${authorName} shared a moment of gratitude`,
      description: previewText,
      url: sharePageUrl,
      siteName: 'Appreciate',
      type: 'article',
      images: [
        {
          url: shareImageUrl,
          width: 1200,
          height: 630,
          alt: `${authorName} shared a gratitude moment`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${authorName} shared a moment of gratitude`,
      description: previewText,
      images: [shareImageUrl],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const post = await fetchSharedPost(params.id)
  const signupHref = `/welcome?next=${encodeURIComponent('/feed')}&from=share&id=${params.id}`

  if (!post) {
    return <PrivateCard signupHref={signupHref} />
  }

  if (post.visibility === 'PRIVATE') {
    return <PrivateCard signupHref={signupHref} />
  }

  const category = CATEGORIES.find((c) => c.value === post.category) ?? CATEGORIES[5]
  const authorName = post.visibility === 'ANONYMOUS' ? 'Anonymous' : post.author.name
  const initial = post.visibility === 'ANONYMOUS' ? '?' : authorName[0]?.toUpperCase() || '?'

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${category.color}18 0%, ${category.color}08 50%, #fff5f5 100%)` }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Category accent bar */}
          <div className="h-1.5 w-full" style={{ backgroundColor: category.color }} />

          <div className="p-8">
            {/* App logo */}
            <div className="flex items-center justify-center gap-1.5 mb-8">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: category.color }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-xs tracking-widest uppercase font-semibold text-gray-400">Appreciate</span>
            </div>

            {/* Category emoji */}
            <div className="text-center mb-6">
              <span className="text-5xl">{category.emoji}</span>
              <p className="text-[10px] tracking-widest uppercase font-semibold mt-2" style={{ color: category.color }}>
                {category.label}
              </p>
            </div>

            {/* Content */}
            <blockquote className="text-center text-gray-800 text-lg font-medium leading-relaxed mb-4">
              &ldquo;{post.content}&rdquo;
            </blockquote>

            {/* Feeling */}
            {post.feeling && (
              <p className="text-center text-sm text-gray-400 italic mb-4">
                Feeling {post.feeling}
              </p>
            )}

            {/* Photo */}
            {post.photoUrl && (
              <div className="rounded-2xl overflow-hidden mb-6">
                <img
                  src={post.photoUrl}
                  alt="Gratitude moment"
                  className="w-full h-52 object-cover"
                />
              </div>
            )}

            {/* Hearts */}
            {post.heartCount > 0 && (
              <div className="flex items-center justify-center gap-1 mb-4">
                <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-sm text-gray-400">{post.heartCount}</span>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-5" />

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: category.color }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{authorName}</p>
                <p className="text-xs text-gray-400">{date}</p>
              </div>
            </div>
          </div>

          {/* CTA footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">Share your own gratitude</p>
            <div className="flex flex-col gap-2">
              <a
                href={signupHref}
                className="inline-flex items-center justify-center px-4 py-3 rounded-full text-subheadline font-semibold tracking-wide text-white"
                style={{ backgroundColor: category.color }}
              >
                Sign up for Appreciate
              </a>
              <a
                href="https://appreciate.live"
                className="text-xs font-semibold tracking-wide"
                style={{ color: category.color }}
              >
                appreciate.live →
              </a>
            </div>
          </div>
        </div>

        {/* Share button */}
        <ShareCardClient authorName={authorName} postId={post.id} />
      </div>
    </div>
  )
}

function PrivateCard({ signupHref }: { signupHref: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Private Appreciation</h2>
        <p className="text-sm text-gray-400 mb-6">This moment of gratitude is kept private by its author.</p>
        <div className="flex flex-col gap-3">
          <a
            href={signupHref}
            className="inline-block px-5 py-3 rounded-full bg-gray-900 text-white text-subheadline font-semibold tracking-wide"
          >
            Sign up for Appreciate
          </a>
          <a
            href="https://appreciate.live"
            className="inline-block px-5 py-3 rounded-full border border-gray-200 text-gray-700 text-subheadline font-semibold tracking-wide"
          >
            Start your own journey
          </a>
        </div>
      </div>
    </div>
  )
}
