import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'

const wallThemes = [
  {
    id: 'fridge',
    label: 'Fridge',
    className: 'wall-fridge',
    noteClassName: 'note-cream',
  },
  {
    id: 'chalkboard',
    label: 'Chalkboard',
    className: 'wall-chalkboard',
    noteClassName: 'note-chalk',
  },
  {
    id: 'corkboard',
    label: 'Corkboard',
    className: 'wall-corkboard',
    noteClassName: 'note-yellow',
  },
] as const

function getStorageKey(base: string, userId?: string): string {
  return `${base}-${userId ?? 'guest'}`
}

function loadOrder(userId?: string): number[] {
  const key = getStorageKey('appreciation-wall-order', userId)
  const saved = localStorage.getItem(key)
  return saved ? (JSON.parse(saved) as number[]) : []
}

function saveOrderToStorage(userId: string | undefined, order: number[]): void {
  const key = getStorageKey('appreciation-wall-order', userId)
  localStorage.setItem(key, JSON.stringify(order))
}

export function ProfilePage() {
  const { state, claimPost, createClaimInvite } = useAppData()
  const { currentUser } = useAuth()
  const [wallTheme, setWallTheme] = useState<(typeof wallThemes)[number]['id']>(() => {
    const saved = localStorage.getItem(getStorageKey('appreciation-wall-theme', undefined))
    return (wallThemes.find((theme) => theme.id === saved)?.id ?? 'fridge') as (typeof wallThemes)[number]['id']
  })
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [savedOrder, setSavedOrder] = useState<number[]>(() => loadOrder(currentUser?.id))

  const createdPosts = useMemo(() => {
    if (!state || !currentUser) return []
    return state.posts
      .filter((post) => post.authorId === currentUser.id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [state, currentUser])

  const wallPosts = useMemo(() => {
    const validIds = new Set(createdPosts.map((post) => post.id))
    const mergedOrder = [
      ...savedOrder.filter((id) => validIds.has(id)),
      ...createdPosts.map((post) => post.id).filter((id) => !savedOrder.includes(id)),
    ]
    return mergedOrder
      .map((id) => createdPosts.find((post) => post.id === id))
      .filter((post): post is (typeof createdPosts)[number] => Boolean(post))
  }, [createdPosts, savedOrder])

  useEffect(() => {
    const key = getStorageKey('appreciation-wall-theme', currentUser?.id)
    localStorage.setItem(key, wallTheme)
  }, [wallTheme, currentUser?.id])

  const activeTheme = useMemo(
    () => wallThemes.find((theme) => theme.id === wallTheme) ?? wallThemes[0],
    [wallTheme],
  )

  const given = wallPosts.length
  const received = useMemo(() => {
    if (!state || !currentUser) return 0
    return state.posts.filter(
      (post) => post.recipientUserId === currentUser.id || post.recipient === currentUser.name,
    ).length
  }, [state, currentUser])

  const topCategory = useMemo(() => {
    const entries = Object.entries(
      wallPosts.reduce<Record<string, number>>((acc, post) => {
        acc[post.category] = (acc[post.category] ?? 0) + 1
        return acc
      }, {}),
    )
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Community'
  }, [wallPosts])

  const moveNote = useCallback((fromId: number, toId: number) => {
    if (fromId === toId) return
    setSavedOrder((prevOrder) => {
      const next = [...prevOrder]
      const fromIndex = next.indexOf(fromId)
      const toIndex = next.indexOf(toId)
      if (fromIndex === -1 || toIndex === -1) return prevOrder
      next.splice(fromIndex, 1)
      next.splice(toIndex, 0, fromId)
      saveOrderToStorage(currentUser?.id, next)
      return next
    })
  }, [currentUser?.id])

  const shareNote = async (postId: number, recipient: string, message: string) => {
    const shareText = `I appreciated ${recipient}: ${message}`
    const shareUrl = `${window.location.origin}/posts/${postId}`
    if (navigator.share) {
      await navigator.share({ title: 'Appreciation note', text: shareText, url: shareUrl })
      return
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
  }

  if (!state || !currentUser) {
    return <div className="page-grid"><section className="card loading-card">Loading profile...</section></div>
  }

  const unclaimedGivenPosts = wallPosts.filter((post) => !post.recipientUserId)

  return (
    <div className="page-grid profile-page">
      <section className="profile-header-simple">
        <div>
          <p className="eyebrow">Personal wall</p>
          <h2>{currentUser.name}&apos;s gratitude board</h2>
          <p className="hero-text">A quieter profile: just your appreciation notes, pinned like a real wall of remembered moments.</p>
        </div>
        <div className="profile-summary-strip">
          <div><strong>{given}</strong><span>Written</span></div>
          <div><strong>{received}</strong><span>Received</span></div>
          <div><strong>{topCategory}</strong><span>Top theme</span></div>
        </div>
      </section>

      <section className="wall-toolbar card">
        <div>
          <p className="eyebrow">Wall style</p>
          <h3>Choose the surface your notes live on.</h3>
        </div>
        <div className="theme-switcher">
          {wallThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-chip${theme.id === wallTheme ? ' active' : ''}`}
              onClick={() => setWallTheme(theme.id)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </section>

      <section className={`gratitude-wall ${activeTheme.className}`}>
        {wallPosts.length === 0 ? (
          <article className={`wall-note ${activeTheme.noteClassName}`}>
            <p className="mini-title">Start your wall</p>
            <p>Your first appreciation post will appear here like a pinned note.</p>
          </article>
        ) : (
          wallPosts.map((post, index) => (
            <article
              key={post.id}
              className={`wall-note ${activeTheme.noteClassName}`}
              draggable
              onDragStart={() => setDraggingId(post.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggingId) moveNote(draggingId, post.id)
                setDraggingId(null)
              }}
              onDragEnd={() => setDraggingId(null)}
              style={{
                transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
                animationDelay: `${index * 70}ms`,
              }}
            >
              <div className="note-meta">
                <span>{post.recipient}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <p className="note-message">{post.message}</p>
              <div className="note-footer">
                <span>{post.category}</span>
                <span>{post.visibility}</span>
              </div>
              <div className="note-actions">
                <button type="button" className="button secondary small" onClick={() => void shareNote(post.id, post.recipient, post.message)}>
                  Share note
                </button>
                <span className="muted">Drag to reorder</span>
              </div>
            </article>
          ))
        )}
      </section>

      {(state.claimCandidates.length > 0 || unclaimedGivenPosts.length > 0) && (
        <section className="profile-utilities card">
          {state.claimCandidates.length > 0 && (
            <div className="utility-column">
              <p className="eyebrow">Claim recognitions</p>
              {state.claimCandidates.map((candidate) => (
                <article key={candidate.postId} className="mini-post compact-post">
                  <p className="mini-title">{candidate.authorName} appreciated you</p>
                  <p>{candidate.message}</p>
                  <button type="button" className="button secondary small" onClick={() => void claimPost(candidate.postId)}>
                    Claim post
                  </button>
                </article>
              ))}
            </div>
          )}

          {unclaimedGivenPosts.length > 0 && (
            <div className="utility-column">
              <p className="eyebrow">Invite recipients</p>
              {unclaimedGivenPosts.map((post) => (
                <article key={post.id} className="mini-post compact-post">
                  <p className="mini-title">{post.recipient}</p>
                  <p>{post.message}</p>
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={async () => {
                      const inviteLink = await createClaimInvite(post.id)
                      await navigator.clipboard.writeText(inviteLink)
                    }}
                  >
                    Copy claim link
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
