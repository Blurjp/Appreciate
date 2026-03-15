import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'
import type { AppreciationPost, Comment, Reaction, Report, User } from '../types'

type Props = {
  posts: AppreciationPost[]
  users: User[]
  reactions: Reaction[]
  comments: Comment[]
  reports?: Report[]
  title: string
  subtitle: string
  onReact?: (postId: number, type: 'support' | 'inspiring') => Promise<void>
  onReport?: (postId: number, reason: string) => Promise<void>
  onComment?: (postId: number, body: string) => Promise<void>
}

export function PostList({ posts, users, reactions, comments, reports = [], title, subtitle, onReact, onReport, onComment }: Props) {
  const { currentUser } = useAuth()
  const [reportDrafts, setReportDrafts] = useState<Record<number, string>>({})
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({})
  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])

  return (
    <section className="feed-stage">
      <div className="feed-stage-header">
        <div>
          <p className="eyebrow">Feed</p>
          <h2>{title}</h2>
        </div>
        <span className="muted">{subtitle}</span>
      </div>

      <div className="polaroid-grid">
        {posts.map((post, index) => {
          const author = userMap.get(post.authorId)
          const displayAuthor = post.visibility === 'anonymous' ? 'Someone' : (author?.name ?? 'Someone')
          const postReactions = reactions.filter((reaction) => reaction.postId === post.id)
          const postComments = comments.filter((comment) => comment.postId === post.id)
          const supportCount = postReactions.filter((reaction) => reaction.type === 'support').length
          const inspiringCount = postReactions.filter((reaction) => reaction.type === 'inspiring').length
          const existingReport = reports.find((report) => report.postId === post.id)

          return (
            <article
              key={post.id}
              className="polaroid-card"
              style={{
                transform: `rotate(${index % 3 === 0 ? -2 : index % 3 === 1 ? 1.5 : -0.5}deg)`,
                animationDelay: `${index * 60}ms`,
              }}
            >
              <div className="polaroid-top">
                <span className="mini-title">{post.category}</span>
                <span className="muted">{formatDate(post.createdAt)}</span>
              </div>
              <Link className="text-link polaroid-title" to={`/posts/${post.id}`}>
                {displayAuthor} appreciated {post.recipient}
              </Link>
              <p className="polaroid-message">{post.message}</p>
              <div className="note-footer">
                <span>{post.location || 'Somewhere worth remembering'}</span>
                <span>{post.visibility}</span>
              </div>

              {(onReact || onReport || onComment) && (
                <div className="polaroid-actions">
                  {onReact && (
                    <div className="action-row compact-row">
                      <button type="button" className="button secondary small" onClick={() => void onReact(post.id, 'support')}>
                        Support {supportCount}
                      </button>
                      <button type="button" className="button secondary small" onClick={() => void onReact(post.id, 'inspiring')}>
                        Inspiring {inspiringCount}
                      </button>
                    </div>
                  )}
                  {onComment && (
                    <div className="comment-box compact-column">
                      <input
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(event) => setCommentDrafts({ ...commentDrafts, [post.id]: event.target.value })}
                        placeholder="Add a note"
                      />
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={async () => {
                          const body = commentDrafts[post.id]?.trim()
                          if (!body) return
                          await onComment(post.id, body)
                          setCommentDrafts({ ...commentDrafts, [post.id]: '' })
                        }}
                      >
                        Comment
                      </button>
                    </div>
                  )}
                  {onReport && currentUser && currentUser.id !== (author?.id ?? '') && (
                    <div className="comment-box compact-column">
                      <input
                        value={reportDrafts[post.id] ?? ''}
                        onChange={(event) => setReportDrafts({ ...reportDrafts, [post.id]: event.target.value })}
                        placeholder="Report reason"
                      />
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={async () => {
                          const reason = reportDrafts[post.id]?.trim()
                          if (!reason) return
                          await onReport(post.id, reason)
                          setReportDrafts({ ...reportDrafts, [post.id]: '' })
                        }}
                      >
                        Report
                      </button>
                    </div>
                  )}
                </div>
              )}

              {postComments.length > 0 && (
                <div className="comment-list paper-comments">
                  {postComments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="meta-row muted">
                        <span>{userMap.get(comment.authorId)?.name ?? 'Member'}</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p>{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}
              {existingReport && <p className="report-status">Report status: {existingReport.status}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
