import { useEffect } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'

export function AdminPage() {
  const { state, updateReportStatus, resetDemo, refreshAuditLogs } = useAppData()
  const { currentUser, canResetDemo } = useAuth()

  useEffect(() => {
    if (currentUser?.role === 'moderator') {
      void refreshAuditLogs()
    }
  }, [currentUser?.role])

  if (!state || !currentUser) {
    return <div className="page-grid"><section className="card loading-card">Loading moderation...</section></div>
  }

  if (currentUser.role !== 'moderator') {
    return (
      <div className="page-grid">
        <section className="card enterprise-section">
          <p className="eyebrow">Moderation</p>
          <h2>Restricted to trust and safety team.</h2>
          <p>Sign in as `alina@appreciation.dev` to work the report queue.</p>
        </section>
      </div>
    )
  }

  const reportPosts = new Map(state.posts.map((post) => [post.id, post]))

  return (
    <div className="page-grid moderator-mode">
      <section className="card enterprise-section moderator-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Moderator workspace</p>
            <h2>Review notes that need care</h2>
          </div>
          <div className="admin-actions">
            {canResetDemo && (
              <button type="button" className="button secondary small" onClick={() => void resetDemo()}>
                Reset sample data
              </button>
            )}
            <span className="pill">Signed in as {currentUser.role}</span>
          </div>
        </div>

        <div className="post-list">
          {state.reports.map((report) => {
            const post = reportPosts.get(report.postId)
            return (
              <article key={report.id} className="post-card">
                <div className="meta-row">
                  <span>Report #{report.id}</span>
                  <span>{report.status}</span>
                </div>
                <p>{report.reason}</p>
                <div className="meta-row muted">
                  <span>{post ? `${post.recipient} appreciation` : 'Post removed'}</span>
                  <span>{formatDate(report.createdAt)}</span>
                </div>
                <div className="post-actions">
                  <button type="button" className="button secondary small" onClick={() => void updateReportStatus(report.id, 'reviewing')}>
                    Mark reviewing
                  </button>
                  <button type="button" className="button secondary small" onClick={() => void updateReportStatus(report.id, 'resolved')}>
                    Resolve
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="card enterprise-section moderator-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Audit trail</p>
            <h2>Recent moderation and access events</h2>
          </div>
        </div>
        <div className="post-list">
          {state.auditLogs.map((entry) => (
            <article key={entry.id} className="post-card">
              <div className="meta-row">
                <span>{entry.action}</span>
                <span>{entry.targetType}</span>
              </div>
              <div className="meta-row muted">
                <span>{entry.actorUserId ?? 'system'}</span>
                <span>{entry.targetId ?? 'n/a'}</span>
              </div>
              <p className="muted code-line">{JSON.stringify(entry.metadata)}</p>
              <p className="report-status">{formatDate(entry.createdAt)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
