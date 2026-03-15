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
}

// Category metadata matching iOS
export const CATEGORIES: {
  value: GratitudeCategory
  label: string
  emoji: string
  color: string
}[] = [
  { value: 'FAMILY', label: 'Family', emoji: '👨‍👩‍👧‍👦', color: '#FF6F61' },
  { value: 'WORK', label: 'Work', emoji: '💼', color: '#4A90D9' },
  { value: 'SMALL_JOYS', label: 'Small Joys', emoji: '✨', color: '#F5A623' },
  { value: 'NATURE', label: 'Nature', emoji: '🌿', color: '#7BC67E' },
  { value: 'HEALTH', label: 'Health', emoji: '💪', color: '#E87CA0' },
  { value: 'OTHER', label: 'Other', emoji: '💭', color: '#C3AED6' },
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
    icon: '🔒',
    description: 'Visible only to me — goes to My Wall only',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    icon: '🌐',
    description: 'Visible to everyone in the feed',
  },
  {
    value: 'ANONYMOUS',
    label: 'Anonymous',
    icon: '❓',
    description: 'Public but hides your name',
  },
]

// Matches iOS CreatePostViewModel confirmations
export const CONFIRMATIONS = [
  'Beautiful! You just shared light 💫',
  'The world is brighter because of you ✨',
  'Gratitude looks good on you 🌟',
  'Your words can change someone\'s day 🌈',
  'That\'s the spirit of appreciation! 🙏',
  'One grateful thought at a time 🌸',
  'You\'re building a beautiful habit 🌱',
  'Spreading positivity, one post at a time ❤️',
]

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🏆'
  if (streak >= 14) return '⭐'
  if (streak >= 7) return '🔥'
  if (streak >= 1) return '🌱'
  return '🌱'
}

export function getStreakMessage(streak: number): string {
  if (streak >= 30) return 'Unstoppable! A true gratitude champion!'
  if (streak >= 14) return 'Two weeks strong! You\'re on fire!'
  if (streak >= 7) return 'One week streak! Keep going!'
  if (streak >= 3) return 'Building momentum! Great job!'
  if (streak >= 1) return 'Every day counts! Keep it up!'
  return 'Start your gratitude journey today!'
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
