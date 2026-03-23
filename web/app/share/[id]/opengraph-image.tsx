import { ImageResponse } from 'next/og'
import { fetchSharedPost } from '@/lib/posts'
import { getPostShareMeta } from '@/lib/share'

export const runtime = 'edge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface Props {
  params: { id: string }
}

export default async function Image({ params }: Props) {
  const post = await fetchSharedPost(params.id)

  if (!post || post.visibility === 'PRIVATE') {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f2eb 0%, #fffaf2 52%, #f7ece5 100%)',
            color: '#2c2c2e',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Private appreciation
        </div>
      ),
      size
    )
  }

  const { authorName, category } = getPostShareMeta(post)
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '40px',
          background: `linear-gradient(135deg, ${category.color}22 0%, #fff8f1 44%, #ffffff 100%)`,
          color: '#2c2c2e',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            borderRadius: '34px',
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 26px 70px rgba(17, 17, 17, 0.12)',
            border: '1px solid rgba(44, 44, 46, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: post.photoUrl ? '58%' : '100%',
              padding: '42px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '999px',
                      background: category.color,
                      color: '#ffffff',
                      fontSize: '22px',
                      fontWeight: 700,
                    }}
                  >
                    {post.visibility === 'ANONYMOUS' ? '?' : (authorName[0] || '?').toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontSize: '25px', fontWeight: 700 }}>{authorName}</div>
                    <div style={{ fontSize: '16px', color: '#78716c' }}>{date}</div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '999px',
                    background: `${category.color}16`,
                    color: category.color,
                    padding: '10px 16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {category.label}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#a8a29e',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                  }}
                >
                  Appreciate
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '44px',
                    lineHeight: 1.18,
                    fontWeight: 700,
                    color: '#1c1917',
                  }}
                >
                  “{post.content.slice(0, 220)}{post.content.length > 220 ? '…' : ''}”
                </div>
                {post.feeling ? (
                  <div style={{ display: 'flex', fontSize: '22px', color: '#57534e' }}>
                    Feeling {post.feeling}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#57534e', fontSize: '18px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '999px',
                    background: category.color,
                  }}
                />
                Share gratitude publicly
              </div>
              <div style={{ display: 'flex', color: '#a8a29e', fontSize: '18px' }}>
                appreciate.live
              </div>
            </div>
          </div>

          {post.photoUrl ? (
            <div
              style={{
                display: 'flex',
                width: '42%',
                height: '100%',
                position: 'relative',
                background: '#f5f5f4',
              }}
            >
              <img
                src={post.photoUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    ),
    size
  )
}
