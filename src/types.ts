export type Visibility = 'public' | 'anonymous' | 'private'
export type GiftProvider = 'None' | 'Venmo' | 'Cash App' | 'PayPal' | 'Gift Card'
export type ReactionType = 'support' | 'inspiring'
export type ReportStatus = 'open' | 'reviewing' | 'resolved'

export type User = {
  id: string
  name: string
  email: string
  avatar: string
  role: 'member' | 'moderator'
  company?: string
  bio: string
}

export type AppreciationPost = {
  id: number
  authorId: string
  recipient: string
  recipientUserId?: string
  message: string
  category: string
  location: string
  visibility: Visibility
  giftAmount: number
  giftProvider: GiftProvider
  createdAt: string
  company?: string
}

export type Reaction = {
  id: number
  postId: number
  userId: string
  type: ReactionType
  createdAt: string
}

export type Report = {
  id: number
  postId: number
  reporterId: string
  reason: string
  status: ReportStatus
  createdAt: string
}

export type Comment = {
  id: number
  postId: number
  authorId: string
  body: string
  createdAt: string
}

export type Notification = {
  id: number
  userId: string
  actorId?: string
  type: 'post_received' | 'reaction_received' | 'comment_received' | 'report_opened'
  message: string
  link: string
  createdAt: string
  readAt?: string
}

export type Draft = {
  recipient: string
  recipientUserId?: string
  message: string
  category: string
  location: string
  visibility: Visibility
  giftAmount: string
  giftProvider: GiftProvider
}

export type ClaimRequest = {
  id: number
  postId: number
  requesterUserId: string
  status: 'approved' | 'rejected' | 'pending'
  createdAt: string
  decidedAt?: string
}

export type ClaimCandidate = {
  postId: number
  recipient: string
  message: string
  createdAt: string
  authorName: string
}

export type ClaimInvite = {
  token: string
  postId: number
  recipient: string
  message: string
  authorName: string
  createdAt: string
  expiresAt: string
}

export type AuditLog = {
  id: number
  actorUserId?: string
  action: string
  targetType: string
  targetId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

export type OnboardingPrompt = {
  id: string
  title: string
  body: string
  category: string
}

export type LaunchMetrics = {
  weeklyMeaningfulAppreciations: number
  repeatGiverRate: number
  recipientOpenRate: number
  claimRate: number
  moderationRate: number
  activeGivers: number
}

export type AppState = {
  users: User[]
  posts: AppreciationPost[]
  reactions: Reaction[]
  reports: Report[]
  comments: Comment[]
  notifications: Notification[]
  claimRequests: ClaimRequest[]
  claimCandidates: ClaimCandidate[]
  auditLogs: AuditLog[]
  onboardingPrompts: OnboardingPrompt[]
  launchMetrics: LaunchMetrics
}

export type SessionPayload = {
  currentUser: User | null
  csrfToken: string | null
}

export type BootstrapPayload = {
  currentUser: User
  csrfToken: string
  state: AppState
}

export type LoginPayload = {
  email: string
  password: string
}

export type ClaimInvitePayload = {
  csrfToken: string | null
  invite: ClaimInvite
}
