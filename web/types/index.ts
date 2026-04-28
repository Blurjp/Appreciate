// Matches Supabase gratitude_category enum
export type GratitudeCategory =
  | 'FAMILY'
  | 'WORK'
  | 'SMALL_JOYS'
  | 'NATURE'
  | 'HEALTH'
  | 'OTHER'

// Matches Supabase post_visibility enum
export type PostVisibility = 'PRIVATE' | 'PUBLIC' | 'ANONYMOUS'

export interface GratitudePost {
  id: string
  content: string
  feeling: string | null
  category: GratitudeCategory
  visibility: PostVisibility
  photoUrl: string | null
  cardTemplateId: string | null
  authorId: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  createdAt: string
  updatedAt: string
  heartCount: number
  isBookmarked: boolean
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalPosts: number
  lastPostDate: string | null
  weekActivity: boolean[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  wallTheme?: string
}

export const CATEGORIES: {
  value: GratitudeCategory
  label: string
  emoji: string
  color: string
  gradient: string
}[] = [
  {
    value: 'FAMILY',
    label: 'Family',
    emoji: '♡',
    color: '#C4704B',
    gradient: 'linear-gradient(135deg, #D4917A 0%, #C4704B 100%)',
  },
  {
    value: 'WORK',
    label: 'Work',
    emoji: '◆',
    color: '#8B3A2A',
    gradient: 'linear-gradient(135deg, #A85040 0%, #8B3A2A 100%)',
  },
  {
    value: 'SMALL_JOYS',
    label: 'Small Joys',
    emoji: '◇',
    color: '#C4A35A',
    gradient: 'linear-gradient(135deg, #D4B87A 0%, #C4A35A 100%)',
  },
  {
    value: 'NATURE',
    label: 'Nature',
    emoji: '◉',
    color: '#7D8C6E',
    gradient: 'linear-gradient(135deg, #A3B08F 0%, #7D8C6E 100%)',
  },
  {
    value: 'HEALTH',
    label: 'Health',
    emoji: '○',
    color: '#9B8AA0',
    gradient: 'linear-gradient(135deg, #B5A5BA 0%, #9B8AA0 100%)',
  },
  {
    value: 'OTHER',
    label: 'Other',
    emoji: '·',
    color: '#A09080',
    gradient: 'linear-gradient(135deg, #BBA898 0%, #A09080 100%)',
  },
]

export const VISIBILITY_OPTIONS: {
  value: PostVisibility
  label: string
  icon: string
  description: string
}[] = [
  {
    value: 'PRIVATE',
    label: 'Private',
    icon: '○',
    description: 'Only visible to you — your personal journal',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    icon: '◎',
    description: 'Share with the community',
  },
  {
    value: 'ANONYMOUS',
    label: 'Anonymous',
    icon: '◌',
    description: 'Share publicly, without your name',
  },
]

export const CONFIRMATIONS = [
  'Gratitude recorded.',
  'A moment worth keeping.',
  'Well noted.',
  'Your reflection is saved.',
  'Appreciation documented.',
  'A small act of noticing.',
  'Saved to your journal.',
  'Gratitude takes root.',
  'One moment captured.',
  'Your words are kept.',
  'A grateful day.',
  'Something to return to.',
]

export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '◉'
  if (streak >= 100) return '◆'
  if (streak >= 30) return '◇'
  if (streak >= 14) return '○'
  if (streak >= 7) return '▲'
  if (streak >= 3) return '△'
  if (streak >= 1) return '·'
  return '·'
}

export function getStreakMessage(streak: number): string {
  if (streak >= 365) return 'A full year of gratitude.'
  if (streak >= 100) return '100 days of reflection.'
  if (streak >= 30) return 'A month of practice.'
  if (streak >= 14) return 'Two weeks of noticing.'
  if (streak >= 7) return 'One week of gratitude.'
  if (streak >= 3) return 'A habit taking shape.'
  if (streak >= 1) return 'Every entry counts.'
  return 'Begin your gratitude practice.'
}

export function getCategoryMeta(category: GratitudeCategory) {
  return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[5]
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const WARM_ACCENTS = {
  marks: ['·', '○', '◇', '◆', '△', '▲', '◉'],
  punctuation: ['"', '"', '—', '…'],
}

// Kept for backwards compatibility with any component that imports it
export const KAWAII_DECORATIONS = WARM_ACCENTS
