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
}

// 🎀 Kawaii Category metadata with cute colors and emojis
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
    emoji: '💕', 
    color: '#FF6B8A',
    gradient: 'linear-gradient(135deg, #FFB3C6 0%, #FF8FAB 100%)'
  },
  { 
    value: 'WORK', 
    label: 'Work', 
    emoji: '💜', 
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #D8B4FE 0%, #C084FC 100%)'
  },
  { 
    value: 'SMALL_JOYS', 
    label: 'Small Joys', 
    emoji: '✨', 
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)'
  },
  { 
    value: 'NATURE', 
    label: 'Nature', 
    emoji: '🌿', 
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #99F6E4 0%, #5EEAD4 100%)'
  },
  { 
    value: 'HEALTH', 
    label: 'Health', 
    emoji: '💙', 
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)'
  },
  { 
    value: 'OTHER', 
    label: 'Other', 
    emoji: '💖', 
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)'
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
    icon: '🎀',
    description: 'Only you can see this — your secret garden',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    icon: '🌸',
    description: 'Share your joy with everyone',
  },
  {
    value: 'ANONYMOUS',
    label: 'Anonymous',
    icon: '🦋',
    description: 'Share publicly, but stay mysterious',
  },
]

// 🎀 Cute confirmation messages with kawaii style
export const CONFIRMATIONS = [
  'Your gratitude sparkles! ✨',
  'Spreading love like confetti! 🎊',
  'Your heart is glowing! 💖',
  'Thanks for sharing your light! 🌟',
  'The world smiles with you! 😊',
  'You just made today brighter! ☀️',
  'Gratitude looks beautiful on you! 🌸',
  'Your positivity is contagious! 🦋',
  'Keep shining, superstar! ⭐',
  'Your words warm hearts! 💕',
  'One grateful moment at a time! 🌱',
  'You\'re building something beautiful! 🏗️✨',
]

// 🎀 Streak celebrations
export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '👑'      // Crown for a year!
  if (streak >= 100) return '🏆'      // Trophy for 100 days
  if (streak >= 30) return '💎'       // Diamond for 30 days
  if (streak >= 14) return '⭐'       // Star for 2 weeks
  if (streak >= 7) return '🔥'        // Fire for a week
  if (streak >= 3) return '🌟'        // Sparkle for 3 days
  if (streak >= 1) return '🌱'        // Seedling for starting
  return '🌱'
}

export function getStreakMessage(streak: number): string {
  if (streak >= 365) return 'One whole year! You\'re a gratitude royalty! 👑'
  if (streak >= 100) return 'Century club! 100 days of gratitude! 🏆'
  if (streak >= 30) return 'One month strong! You\'re unstoppable! 💎'
  if (streak >= 14) return 'Two weeks of gratitude magic! ⭐'
  if (streak >= 7) return 'One week streak! You\'re on fire! 🔥'
  if (streak >= 3) return 'Building a beautiful habit! 🌟'
  if (streak >= 1) return 'Every moment of gratitude counts! 🌱'
  return 'Start your gratitude journey today! 💖'
}

export function getCategoryMeta(category: GratitudeCategory) {
  return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[5]
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now ✨'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// 🎀 Decorative elements for UI
export const KAWAII_DECORATIONS = {
  sparkles: ['✨', '⭐', '🌟', '💫', '✦'],
  hearts: ['💖', '💕', '💗', '💓', '💝', '❤️', '🧡', '💛', '💚', '💙', '💜'],
  flowers: ['🌸', '🌺', '🌻', '🌼', '🌷', '💐', '🏵️', '🎀'],
  cute: ['🥰', '😊', '🥺', '🤗', '😄', '🦋', '🌈', '☁️'],
  celebrations: ['🎉', '🎊', '🎈', '🎁', '🏆', '👑'],
}

// 🎀 Mascot expressions
export const KAWAII_MASCOT = {
  happy: '(◕‿◕)',
  excited: '(≧▽≦)',
  love: '(♥‿♥)',
  proud: '(￣▽￣)ノ',
  thinking: '(・_・)',
  celebrate: '٩(◕‿◕)۶',
  hug: '(づ｡◕‿‿◕｡)づ',
  sparkle: '(✧ω✧)',
}
