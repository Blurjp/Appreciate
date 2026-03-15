import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

const primaryLinks = [
  { to: '/', label: 'Write' },
  { to: '/profile', label: 'Wall' },
  { to: '/feed', label: 'Feed' },
]

const secondaryLinks = [
  { to: '/notifications', label: 'Inbox' },
]

export function AppShell() {
  const { currentUser, signOut } = useAuth()
  const { state } = useAppData()
  const navigate = useNavigate()

  const unreadNotifications = state?.notifications.filter(
    (notification) => !notification.readAt && notification.userId === currentUser?.id,
  ).length ?? 0
  const moderatorLinks = currentUser?.role === 'moderator'
    ? [
        { to: '/teams', label: 'Teams' },
        { to: '/metrics', label: 'Metrics' },
        { to: '/admin', label: 'Moderation' },
      ]
    : []

  return (
    <div className="shell soft-shell">
      <header className="quiet-topbar">
        <div className="brand-stack">
          <p className="eyebrow">Appreciation</p>
          <h1 className="brand">A wall for gratitude</h1>
        </div>

        <nav className="quiet-nav">
          {primaryLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="quiet-actions">
          <NavLink to="/notifications" className="subtle-link">
            Inbox{unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
          </NavLink>
          {secondaryLinks.slice(1).map((link) => (
            <NavLink key={link.to} to={link.to} className="subtle-link">
              {link.label}
            </NavLink>
          ))}
          {moderatorLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="subtle-link admin-link">
              {link.label}
            </NavLink>
          ))}
          <div className="user-badge quiet-badge">
            <span className="avatar">{currentUser?.avatar}</span>
            <span>
              <strong>{currentUser?.name}</strong>
              <small>{currentUser?.role}</small>
            </span>
          </div>
          <button
            type="button"
            className="button secondary small"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
