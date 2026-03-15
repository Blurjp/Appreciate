import { describe, it, expect } from 'vitest'
import {
  validate,
  loginSchema,
  createPostSchema,
  createReactionSchema,
  createCommentSchema,
  createReportSchema,
  updateReportSchema,
  markNotificationSchema,
  categories,
  visibilities,
  giftProviders,
} from './validation.mjs'

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = validate(loginSchema, { email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
      expect(result.data.password).toBe('password123')
    }
  })

  it('rejects invalid email', () => {
    const result = validate(loginSchema, { email: 'not-an-email', password: 'password' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Invalid email')
    }
  })

  it('rejects empty password', () => {
    const result = validate(loginSchema, { email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Password is required')
    }
  })

  it('rejects email longer than 255 chars', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    const result = validate(loginSchema, { email: longEmail, password: 'password' })
    expect(result.success).toBe(false)
  })
})

describe('createPostSchema', () => {
  it('accepts valid post with all fields', () => {
    const result = validate(createPostSchema, {
      recipient: 'John Doe',
      message: 'Thank you for your help!',
      category: 'Teamwork',
      location: 'Office',
      visibility: 'public',
      giftAmount: 10,
      giftProvider: 'Venmo',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recipient).toBe('John Doe')
      expect(result.data.message).toBe('Thank you for your help!')
      expect(result.data.category).toBe('Teamwork')
      expect(result.data.visibility).toBe('public')
      expect(result.data.giftAmount).toBe(10)
      expect(result.data.giftProvider).toBe('Venmo')
    }
  })

  it('trims recipient and message', () => {
    const result = validate(createPostSchema, {
      recipient: '  John Doe  ',
      message: '  Thank you!  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recipient).toBe('John Doe')
      expect(result.data.message).toBe('Thank you!')
    }
  })

  it('uses defaults for optional fields', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('Community')
      expect(result.data.visibility).toBe('public')
      expect(result.data.giftAmount).toBe(0)
      expect(result.data.giftProvider).toBe('None')
    }
  })

  it('rejects empty recipient', () => {
    const result = validate(createPostSchema, { recipient: '', message: 'Thanks' })
    expect(result.success).toBe(false)
  })

  it('rejects empty message', () => {
    const result = validate(createPostSchema, { recipient: 'John', message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects recipient longer than 100 chars', () => {
    const result = validate(createPostSchema, { recipient: 'a'.repeat(101), message: 'Thanks' })
    expect(result.success).toBe(false)
  })

  it('rejects message longer than 2000 chars', () => {
    const result = validate(createPostSchema, { recipient: 'John', message: 'a'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('clamps negative gift amount to 0', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      giftAmount: -50,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.giftAmount).toBe(0)
    }
  })

  it('clamps gift amount over 1M to 1M', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      giftAmount: 2000000,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.giftAmount).toBe(1000000)
    }
  })

  it('parses string gift amount', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      giftAmount: '50',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.giftAmount).toBe(50)
    }
  })

  it('handles NaN gift amount', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      giftAmount: 'not-a-number',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.giftAmount).toBe(0)
    }
  })

  it('rejects invalid category', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      category: 'InvalidCategory',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid visibility', () => {
    const result = validate(createPostSchema, {
      recipient: 'John',
      message: 'Thanks',
      visibility: 'secret',
    })
    expect(result.success).toBe(false)
  })
})

describe('createReactionSchema', () => {
  it('accepts valid reaction type', () => {
    const result = validate(createReactionSchema, { type: 'support' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('support')
    }
  })

  it('accepts inspiring reaction type', () => {
    const result = validate(createReactionSchema, { type: 'inspiring' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid reaction type', () => {
    const result = validate(createReactionSchema, { type: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    const result = validate(createCommentSchema, { body: 'Great post!' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.body).toBe('Great post!')
    }
  })

  it('trims comment body', () => {
    const result = validate(createCommentSchema, { body: '  Great post!  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.body).toBe('Great post!')
    }
  })

  it('rejects empty comment', () => {
    const result = validate(createCommentSchema, { body: '' })
    expect(result.success).toBe(false)
  })

  it('rejects comment longer than 1000 chars', () => {
    const result = validate(createCommentSchema, { body: 'a'.repeat(1001) })
    expect(result.success).toBe(false)
  })
})

describe('createReportSchema', () => {
  it('accepts valid report', () => {
    const result = validate(createReportSchema, { reason: 'Inappropriate content' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Inappropriate content')
    }
  })

  it('rejects empty reason', () => {
    const result = validate(createReportSchema, { reason: '' })
    expect(result.success).toBe(false)
  })

  it('rejects reason longer than 500 chars', () => {
    const result = validate(createReportSchema, { reason: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })
})

describe('updateReportSchema', () => {
  it('accepts valid status', () => {
    for (const status of ['open', 'reviewing', 'resolved']) {
      const result = validate(updateReportSchema, { status })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    const result = validate(updateReportSchema, { status: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('markNotificationSchema', () => {
  it('accepts boolean read', () => {
    const result = validate(markNotificationSchema, { read: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.read).toBe(true)
    }
  })

  it('accepts boolean false', () => {
    const result = validate(markNotificationSchema, { read: false })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.read).toBe(false)
    }
  })
})

describe('constants', () => {
  it('has expected categories', () => {
    expect(categories).toContain('Teamwork')
    expect(categories).toContain('Leadership')
    expect(categories).toContain('Community')
    expect(categories).toContain('Education')
    expect(categories).toContain('Support')
    expect(categories).toContain('Everyday Kindness')
  })

  it('has expected visibilities', () => {
    expect(visibilities).toContain('public')
    expect(visibilities).toContain('anonymous')
    expect(visibilities).toContain('private')
  })

  it('has expected gift providers', () => {
    expect(giftProviders).toContain('None')
    expect(giftProviders).toContain('Venmo')
    expect(giftProviders).toContain('Cash App')
    expect(giftProviders).toContain('PayPal')
    expect(giftProviders).toContain('Gift Card')
  })
})
