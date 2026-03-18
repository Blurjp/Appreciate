import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PostList } from './PostList'
import type { AppreciationPost, User, Reaction, Comment, Report } from '../types'

// Mock AuthContext
const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'TU',
  role: 'member',
  bio: 'Test bio',
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: mockCurrentUser }),
}))

// Mock formatDate
vi.mock('../lib/format', () => ({
  formatDate: (date: string) => date,
}))

const mockUsers: User[] = [
  mockCurrentUser,
  { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com', avatar: 'JD', role: 'member', bio: '' },
]

const mockPosts: AppreciationPost[] = [
  {
    id: 1,
    authorId: 'user-2',
    recipient: 'Test User',
    message: 'Great teamwork on the project!',
    category: 'Teamwork',
    location: 'Office',
    visibility: 'public',
    giftAmount: 0,
    giftProvider: 'None',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    authorId: 'user-1',
    recipient: 'Jane Doe',
    message: 'Anonymous appreciation message',
    category: 'Leadership',
    location: '',
    visibility: 'anonymous',
    giftAmount: 10,
    giftProvider: 'Venmo',
    createdAt: '2024-01-02',
  },
]

const mockReactions: Reaction[] = [
  { id: 1, postId: 1, userId: 'user-1', type: 'support', createdAt: '2024-01-01' },
  { id: 2, postId: 1, userId: 'user-2', type: 'inspiring', createdAt: '2024-01-01' },
]

const mockComments: Comment[] = [
  { id: 1, postId: 1, authorId: 'user-1', body: 'Great post!', createdAt: '2024-01-01' },
]

const mockReports: Report[] = [
  { id: 1, postId: 2, reporterId: 'user-1', reason: 'Spam', status: 'open', createdAt: '2024-01-02' },
]

function renderPostList(overrides: {
  posts?: AppreciationPost[]
  users?: User[]
  reactions?: Reaction[]
  comments?: Comment[]
  reports?: Report[]
  onReact?: (() => Promise<void>) | false
  onReport?: (() => Promise<void>) | false
  onComment?: (() => Promise<void>) | false
} = {}) {
  return render(
    <MemoryRouter>
      <PostList
        posts={overrides.posts ?? mockPosts}
        users={overrides.users ?? mockUsers}
        reactions={overrides.reactions ?? mockReactions}
        comments={overrides.comments ?? mockComments}
        reports={overrides.reports ?? []}
        title="Test Feed"
        subtitle="2 posts"
        onReact={overrides.onReact === false ? undefined : (overrides.onReact ?? (async () => {}))}
        onReport={overrides.onReport === false ? undefined : overrides.onReport}
        onComment={overrides.onComment === false ? undefined : (overrides.onComment ?? (async () => {}))}
      />
    </MemoryRouter>
  )
}

describe('PostList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders title and subtitle', () => {
      renderPostList()
      expect(screen.getByText('Test Feed')).toBeInTheDocument()
      expect(screen.getByText('2 posts')).toBeInTheDocument()
    })

    it('renders all posts', () => {
      renderPostList()
      expect(screen.getByText('Jane Doe appreciated Test User')).toBeInTheDocument()
      expect(screen.getByText('Someone appreciated Jane Doe')).toBeInTheDocument()
    })

    it('displays anonymous author as "Someone"', () => {
      renderPostList()
      expect(screen.getByText('Someone appreciated Jane Doe')).toBeInTheDocument()
    })

    it('displays post message and category', () => {
      renderPostList()
      expect(screen.getByText('Great teamwork on the project!')).toBeInTheDocument()
      expect(screen.getByText('Teamwork')).toBeInTheDocument()
      expect(screen.getByText('Leadership')).toBeInTheDocument()
    })

    it('displays location or fallback text', () => {
      renderPostList()
      expect(screen.getByText('Office')).toBeInTheDocument()
      expect(screen.getByText('Somewhere worth remembering')).toBeInTheDocument()
    })

    it('displays visibility status', () => {
      renderPostList()
      expect(screen.getByText('public')).toBeInTheDocument()
      expect(screen.getByText('anonymous')).toBeInTheDocument()
    })
  })

  describe('comments', () => {
    it('renders existing comments', () => {
      renderPostList()
      expect(screen.getByText('Great post!')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('renders comment input when onComment provided', () => {
      renderPostList()
      expect(screen.getAllByPlaceholderText('Add a note')).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: 'Submit comment' })).toHaveLength(2)
    })

    it('does not render comment input when onComment not provided', () => {
      renderPostList({ onComment: false })
      expect(screen.queryByPlaceholderText('Add a note')).not.toBeInTheDocument()
    })
  })

  describe('reactions', () => {
    it('renders reaction buttons with counts', () => {
      renderPostList()
      expect(screen.getAllByRole('button', { name: /Support this post/ })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /Mark as inspiring/ })).toHaveLength(2)
      expect(screen.getByText('Support 1')).toBeInTheDocument()
      expect(screen.getByText('Inspiring 1')).toBeInTheDocument()
    })

    it('does not render reaction buttons when onReact not provided', () => {
      renderPostList({ onReact: false })
      expect(screen.queryByRole('button', { name: /Support this post/ })).not.toBeInTheDocument()
    })
  })

  describe('reports', () => {
    it('renders report status when report exists', () => {
      renderPostList({ reports: mockReports })
      expect(screen.getByText('Report status: open')).toBeInTheDocument()
    })

    it('renders report input for other users posts', () => {
      renderPostList({ onReport: async () => {} })
      expect(screen.getByPlaceholderText('Report reason')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit report' })).toBeInTheDocument()
    })

    it('does not render report input for own posts', () => {
      // Current user is user-1, post 1 is by user-2, so should show report
      // Post 2 is by user-1, so should NOT show report input for that post
      renderPostList({ onReport: async () => {} })
      const reportInputs = screen.queryAllByPlaceholderText('Report reason')
      // Only one report input (for post 1, not post 2 which is by current user)
      expect(reportInputs.length).toBe(1)
    })
  })

  describe('interactions', () => {
    it('calls onReact when support button clicked', async () => {
      const user = userEvent.setup()
      const onReact = vi.fn(async () => {})
      renderPostList({ onReact })

      // Click the first support button (for post 1)
      const supportButtons = screen.getAllByRole('button', { name: /Support this post/ })
      await user.click(supportButtons[0])
      expect(onReact).toHaveBeenCalledWith(1, 'support')
    })

    it('calls onReact when inspiring button clicked', async () => {
      const user = userEvent.setup()
      const onReact = vi.fn(async () => {})
      renderPostList({ onReact })

      // Click the first inspiring button (for post 1)
      const inspiringButtons = screen.getAllByRole('button', { name: /Mark as inspiring/ })
      await user.click(inspiringButtons[0])
      expect(onReact).toHaveBeenCalledWith(1, 'inspiring')
    })

    it('calls onComment when comment submitted', async () => {
      const user = userEvent.setup()
      const onComment = vi.fn(async () => {})
      renderPostList({ onComment })

      const inputs = screen.getAllByPlaceholderText('Add a note')
      await user.type(inputs[0], 'Nice work!')
      const submitButtons = screen.getAllByRole('button', { name: 'Submit comment' })
      await user.click(submitButtons[0])

      expect(onComment).toHaveBeenCalledWith(1, 'Nice work!')
    })

    it('does not submit empty comment', async () => {
      const user = userEvent.setup()
      const onComment = vi.fn(async () => {})
      renderPostList({ onComment })

      const submitButtons = screen.getAllByRole('button', { name: 'Submit comment' })
      await user.click(submitButtons[0])
      expect(onComment).not.toHaveBeenCalled()
    })

    it('calls onReport when report submitted', async () => {
      const user = userEvent.setup()
      const onReport = vi.fn(async () => {})
      renderPostList({ onReport })

      const input = screen.getByPlaceholderText('Report reason')
      await user.type(input, 'Inappropriate content')
      await user.click(screen.getByRole('button', { name: 'Submit report' }))

      expect(onReport).toHaveBeenCalledWith(1, 'Inappropriate content')
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA roles', () => {
      renderPostList()
      expect(screen.getByRole('feed', { name: 'Appreciation posts' })).toBeInTheDocument()
      expect(screen.getAllByRole('article')).toHaveLength(2)
    })

    it('has accessible reaction buttons', () => {
      renderPostList()
      expect(screen.getByRole('button', { name: /Support this post, 1 supporters/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Mark as inspiring, 1 people inspired/ })).toBeInTheDocument()
    })
  })
})
