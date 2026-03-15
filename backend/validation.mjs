import { z } from 'zod'

export const categories = ['Teamwork', 'Leadership', 'Community', 'Education', 'Support', 'Everyday Kindness'] as const
export const visibilities = ['public', 'anonymous', 'private'] as const
export const giftProviders = ['None', 'Venmo', 'Cash App', 'PayPal', 'Gift Card'] as const
export const reactionTypes = ['support', 'inspiring'] as const
export const reportStatuses = ['open', 'reviewing', 'resolved'] as const

export const categorySchema = z.enum(categories)
export const visibilitySchema = z.enum(visibilities)
export const giftProviderSchema = z.enum(giftProviders)
export const reactionTypeSchema = z.enum(reactionTypes)
export const reportStatusSchema = z.enum(reportStatuses)

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128),
})

export const createPostSchema = z.object({
  recipient: z.string().trim().min(1, 'Recipient is required').max(100),
  recipientUserId: z.string().max(64).optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000),
  category: categorySchema.optional().default('Community'),
  location: z.string().max(100).optional().default(''),
  visibility: visibilitySchema.optional().default('public'),
  giftAmount: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (Number.isNaN(num) || !Number.isFinite(num)) return 0
    return Math.max(0, Math.min(num, 1000000))
  }).optional().default(0),
  giftProvider: giftProviderSchema.optional().default('None'),
})

export const createReactionSchema = z.object({
  type: reactionTypeSchema,
})

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment body is required').max(1000),
})

export const createReportSchema = z.object({
  reason: z.string().trim().min(1, 'Report reason is required').max(500),
})

export const updateReportSchema = z.object({
  status: reportStatusSchema,
})

export const markNotificationSchema = z.object({
  read: z.boolean(),
})

export function validate<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const firstError = result.error.errors[0]
  return { success: false, error: firstError?.message || 'Validation failed' }
}
