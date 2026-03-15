import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/format'

export function NotificationsPage() {
  const { state, markNotificationRead } = useAppData()
  const { currentUser } = useAuth()

  if (!state || !currentUser) {
    return <div className="page-grid"><section className="card loading-card">Loading notifications...</section></div>
  }

  const notifications = state.notifications
    .filter((notification) => notification.userId === currentUser.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return (
    <div className="page-grid">
      <section className="feed-stage">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Notifications</p>
            <h2>Your recognition inbox</h2>
          </div>
          <span className="muted">{notifications.filter((item) => !item.readAt).length} unread</span>
        </div>

        <div className="postcard-grid">
          {notifications.map((notification) => (
            <article key={notification.id} className="postcard-item">
              <div className="postcard-top">
                <span>{notification.message}</span>
                <span>{notification.readAt ? 'read' : 'unread'}</span>
              </div>
              <div className="postcard-body">
                <Link className="text-link muted-link" to={notification.link}>Open this moment</Link>
              </div>
              <div className="meta-row muted">
                <span>{formatDate(notification.createdAt)}</span>
              </div>
              {!notification.readAt && (
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => void markNotificationRead(notification.id)}
                >
                  Mark read
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
