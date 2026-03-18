import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './AppShell'
import type { User, Notification, AppState } from '../types'

// Mock AuthContext
const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'TU',
  role: 'member',
  bio: 'Test bio',
}

const mockModerator: User = {
  id: 'mod-1',
  name: 'Admin User',
  email: 'admin@example.com',
  avatar: 'AU',
  role: 'moderator',
  bio: 'Admin bio',
}

let mockCurrentUser: User | null = mockUser
const mockSignOut = vi.fn(async () => {})

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    signOut: mockSignOut,
  }),
}))

// Mock AppDataContext
let mockAppState: AppState | null = null

vi.mock('../context/AppDataContext', () => ({
  useAppData: () => ({ state: mockAppState }),
}))

function renderAppShell(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Home Page</div>} />
          <Route path="profile" element={<div>Profile Page</div>} />
          <Route path="feed" element={<div>Feed Page</div>} />
          <Route path="notifications" element={<div>Notifications Page</div>} />
          <Route path="teams" element={<div>Teams Page</div>} />
          <Route path="metrics" element={<div>Metrics Page</div>} />
          <Route path="admin" element={<div>Admin Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentUser = mockUser
    mockAppState = null
  })

  describe('rendering', () => {
    it('renders brand and header', () => {
      renderAppShell()
      expect(screen.getByText('Appreciation')).toBeInTheDocument()
      expect(screen.getByText('A wall for gratitude')).toBeInTheDocument()
    })

    it('renders primary navigation links', () => {
      renderAppShell()
      expect(screen.getByRole('link', { name: 'Write a new appreciation' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View your gratitude wall' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Browse appreciation feed' })).toBeInTheDocument()
    })

    it('renders inbox link', () => {
      renderAppShell()
      expect(screen.getByRole('link', { name: 'Inbox' })).toBeInTheDocument()
    })

    it('renders user info in header', () => {
      renderAppShell()
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('member')).toBeInTheDocument()
      expect(screen.getByText('TU')).toBeInTheDocument()
    })

    it('renders sign out button', () => {
      renderAppShell()
      expect(screen.getByRole('button', { name: 'Sign out of your account' })).toBeInTheDocument()
    })

    it('renders skip link for accessibility', () => {
      renderAppShell()
      expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    })
  })

  describe('navigation active state', () => {
    it('marks home link as active on root path', () => {
      renderAppShell(['/'])
      const writeLink = screen.getByRole('link', { name: 'Write a new appreciation' })
      expect(writeLink).toHaveClass('active')
    })

    it('marks profile link as active on profile path', () => {
      renderAppShell(['/profile'])
      const wallLink = screen.getByRole('link', { name: 'View your gratitude wall' })
      expect(wallLink).toHaveClass('active')
    })

    it('marks feed link as active on feed path', () => {
      renderAppShell(['/feed'])
      const feedLink = screen.getByRole('link', { name: 'Browse appreciation feed' })
      expect(feedLink).toHaveClass('active')
    })
  })

  describe('moderator features', () => {
    it('does not show moderator links for regular members', () => {
      mockCurrentUser = mockUser
      renderAppShell()
      expect(screen.queryByRole('link', { name: 'View team analytics' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'View launch metrics' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Moderation queue' })).not.toBeInTheDocument()
    })

    it('shows moderator links for moderators', () => {
      mockCurrentUser = mockModerator
      renderAppShell()
      expect(screen.getByRole('link', { name: 'View team analytics' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View launch metrics' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Moderation queue' })).toBeInTheDocument()
    })

    it('displays moderator role', () => {
      mockCurrentUser = mockModerator
      renderAppShell()
      expect(screen.getByText('moderator')).toBeInTheDocument()
    })
  })

  describe('notifications', () => {
    it('shows unread count when there are unread notifications', () => {
      mockCurrentUser = mockUser
      mockAppState = {
        users: [],
        posts: [],
        reactions: [],
        reports: [],
        comments: [],
        claimRequests: [],
        claimCandidates: [],
        auditLogs: [],
        onboardingPrompts: [],
        launchMetrics: {
          weeklyMeaningfulAppreciations: 0,
          repeatGiverRate: 0,
          recipientOpenRate: 0,
          claimRate: 0,
          moderationRate: 0,
          activeGivers: 0,
        },
        notifications: [
          { id: 1, userId: 'user-1', type: 'post_received', message: 'Test', link: '/', createdAt: '2024-01-01' },
          { id: 2, userId: 'user-1', type: 'reaction_received', message: 'Test 2', link: '/', createdAt: '2024-01-02', readAt: '2024-01-02' },
          { id: 3, userId: 'user-1', type: 'comment_received', message: 'Test 3', link: '/', createdAt: '2024-01-03' },
        ],
      }
      renderAppShell()
      // 2 unread (id 1 and 3, id 2 has readAt)
      expect(screen.getByText('(2)')).toBeInTheDocument()
    })

    it('hides unread count when no unread notifications', () => {
      mockCurrentUser = mockUser
      mockAppState = {
        users: [],
        posts: [],
        reactions: [],
        reports: [],
        comments: [],
        claimRequests: [],
        claimCandidates: [],
        auditLogs: [],
        onboardingPrompts: [],
        launchMetrics: {
          weeklyMeaningfulAppreciations: 0,
          repeatGiverRate: 0,
          recipientOpenRate: 0,
          claimRate: 0,
          moderationRate: 0,
          activeGivers: 0,
        },
        notifications: [],
      }
      renderAppShell()
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
    })
  })

  describe('sign out', () => {
    it('calls signOut when button clicked', async () => {
      const user = userEvent.setup()
      renderAppShell()

      await user.click(screen.getByRole('button', { name: 'Sign out of your account' }))
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has proper landmark roles', () => {
      renderAppShell()
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('has navigation with proper label', () => {
      renderAppShell()
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    })

    it('has accessible user badge', () => {
      renderAppShell()
      expect(screen.getByRole('img', { name: /Logged in as Test User/ })).toBeInTheDocument()
    })
  })
})
