import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'

export function PostDetailPage() {
  const { postId } = useParams()
  const { state, addComment, addReaction, addReport } = useAppData()
  const { currentUser } = useAuth()
  const [commentDraft, setCommentDraft] = useState('')
  const [reportDraft, setReportDraft] = useState('')

  const post = useMemo(
    () => state?.posts.find((entry) => entry.id === Number(postId)),
    [postId, state?.posts],
  )

  if (!state || !currentUser) {
    return <div className="page-grid"><section className="card loading-card">Loading note...</section></div>
  }

  if (!post) {
    return (
      <div className="page-grid">
        <section className="card enterprise-section">
          <p className="eyebrow">Note</p>
          <h2>That appreciation note does not exist.</h2>
          <Link to="/feed" className="button secondary">Back to feed</Link>
        </section>
      </div>
    )
  }

  const author = state.users.find((user) => user.id === post.authorId)
  const displayAuthor = post.visibility === 'anonymous' ? 'Someone' : (author?.name ?? 'Someone')
  const postComments = state.comments.filter((comment) => comment.postId === post.id)
  const reactions = state.reactions.filter((reaction) => reaction.postId === post.id)
  const supportCount = reactions.filter((reaction) => reaction.type === 'support').length
  const inspiringCount = reactions.filter((reaction) => reaction.type === 'inspiring').length

  const shareNote = async () => {
    const shareText = `${displayAuthor} appreciated ${post.recipient}: ${post.message}`
    const shareUrl = `${window.location.origin}/posts/${post.id}`
    if (navigator.share) {
      await navigator.share({ title: 'Appreciation note', text: shareText, url: shareUrl })
      return
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
  }

  return (
    <div className="page-grid narrow-page note-detail-page">
      <section className="note-detail-card">
        <div className="polaroid-top">
          <span className="mini-title">{post.category}</span>
          <span className="muted">{formatDate(post.createdAt)}</span>
        </div>
        <h2 className="polaroid-title">{displayAuthor} appreciated {post.recipient}</h2>
        <p className="note-detail-message">{post.message}</p>
        <div className="note-footer">
          <span>{post.location || 'Somewhere worth remembering'}</span>
          <span>{post.visibility}</span>
        </div>
        <div className="note-actions">
          <button type="button" className="button secondary small" onClick={() => void shareNote()}>
            Share this note
          </button>
          <Link to="/feed" className="subtle-link">Back to feed</Link>
        </div>

        <div className="polaroid-actions">
          <div className="action-row compact-row">
            <button type="button" className="button secondary small" onClick={() => void addReaction(post.id, 'support')}>
              Support {supportCount}
            </button>
            <button type="button" className="button secondary small" onClick={() => void addReaction(post.id, 'inspiring')}>
              Inspiring {inspiringCount}
            </button>
          </div>

          <div className="comment-box compact-column">
            <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Leave a gentle comment" />
            <button
              type="button"
              className="button secondary small"
              onClick={async () => {
                if (!commentDraft.trim()) return
                await addComment(post.id, commentDraft.trim())
                setCommentDraft('')
              }}
            >
              Comment
            </button>
          </div>

          {currentUser.id !== (author?.id ?? '') && (
            <div className="comment-box compact-column">
              <input value={reportDraft} onChange={(event) => setReportDraft(event.target.value)} placeholder="Report reason" />
              <button
                type="button"
                className="button secondary small"
                onClick={async () => {
                  if (!reportDraft.trim()) return
                  await addReport(post.id, reportDraft.trim())
                  setReportDraft('')
                }}
              >
                Report
              </button>
            </div>
          )}
        </div>
      </section>

      {postComments.length > 0 && (
        <section className="paper-comments detail-comments">
          <p className="eyebrow">Comments</p>
          <div className="comment-list">
            {postComments.map((comment) => (
              <article key={comment.id} className="comment-item">
                <div className="meta-row muted">
                  <span>{state.users.find((user) => user.id === comment.authorId)?.name ?? 'Member'}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
