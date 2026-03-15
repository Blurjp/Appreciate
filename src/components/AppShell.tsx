import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

const primaryLinks = [
  { to: '/', label: 'Write', ariaLabel: 'Write a new appreciation' },
  { to: '/profile', label: 'Wall', ariaLabel: 'View your gratitude wall' },
  { to: '/feed', label: 'Feed', ariaLabel: 'Browse appreciation feed' },
]

const secondaryLinks = [
  { to: '/notifications', label: 'Inbox', ariaLabel: 'View notifications' },
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
        { to: '/teams', label: 'Teams', ariaLabel: 'View team analytics' },
        { to: '/metrics', label: 'Metrics', ariaLabel: 'View launch metrics' },
        { to: '/admin', label: 'Moderation', ariaLabel: 'Moderation queue' },
      ]
    : []

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="shell soft-shell">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>
      <header className="quiet-topbar" role="banner">
        <div className="brand-stack">
          <p className="eyebrow">Appreciation</p>
          <h1 className="brand">A wall for gratitude</h1>
        </div>

        <nav className="quiet-nav" aria-label="Main navigation">
          <ul role="list" className="nav-list">
            {primaryLinks.map((link) => (
              <li key={link.to}>
                <NavLink 
                  to={link.to} 
                  end={link.to === '/'} 
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  aria-label={link.ariaLabel}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="quiet-actions">
          <NavLink 
            to="/notifications" 
            className="subtle-link"
            aria-label={`Inbox${unreadNotifications > 0 ? `, ${unreadNotifications} unread notifications` : ''}`}
          >
            Inbox{unreadNotifications > 0 ? <span aria-hidden="true"> ({unreadNotifications})</span> : ''}
            {unreadNotifications > 0 && (
              <span className="visually-hidden">, {unreadNotifications} unread</span>
            )}
          </NavLink>
          {secondaryLinks.slice(1).map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className="subtle-link"
              aria-label={link.ariaLabel}
            >
              {link.label}
            </NavLink>
          ))}
          {moderatorLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className="subtle-link admin-link"
              aria-label={link.ariaLabel}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="user-badge quiet-badge" role="img" aria-label={`Logged in as ${currentUser?.name}, ${currentUser?.role}`}>
            <span className="avatar" aria-hidden="true">{currentUser?.avatar}</span>
            <span>
              <strong>{currentUser?.name}</strong>
              <small>{currentUser?.role}</small>
            </span>
          </div>
          <button
            type="button"
            className="button secondary small"
            aria-label="Sign out of your account"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </header>
      <main id="main-content" role="main">
        <Outlet />
      </main>
    </div>
  )
}
