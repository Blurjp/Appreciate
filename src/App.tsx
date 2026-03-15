import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { AdminPage } from './pages/AdminPage'
import { FeedPage } from './pages/FeedPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ClaimInvitePage } from './pages/ClaimInvitePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { TeamsPage } from './pages/TeamsPage'
import { MetricsPage } from './pages/MetricsPage'
import './App.css'

function RequireAuth({ children }: { children: ReactElement }) {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) {
    return <div className="shell"><section className="card loading-card">Loading session...</section></div>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RequireModerator({ children }: { children: ReactElement }) {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) {
    return <div className="shell"><section className="card loading-card">Loading session...</section></div>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== 'moderator') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/claim/:token" element={<ClaimInvitePage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="posts/:postId" element={<PostDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="metrics" element={<RequireModerator><MetricsPage /></RequireModerator>} />
        <Route path="teams" element={<RequireModerator><TeamsPage /></RequireModerator>} />
        <Route path="admin" element={<RequireModerator><AdminPage /></RequireModerator>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
