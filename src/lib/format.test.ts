import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency } from './format'

describe('formatDate', () => {
  it('formats ISO date string to readable format', () => {
    const result = formatDate('2024-06-15T12:00:00Z')
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/2024/)
  })

  it('handles December dates', () => {
    const result = formatDate('2024-12-15T12:00:00Z')
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/2024/)
  })

  it('returns a string with month, day, and year', () => {
    const result = formatDate('2024-03-15T12:00:00Z')
    expect(typeof result).toBe('string')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/2024/)
  })
})

describe('formatCurrency', () => {
  it('formats USD currency with no decimals', () => {
    const result = formatCurrency(100)
    expect(result).toBe('$100')
  })

  it('formats large amounts', () => {
    const result = formatCurrency(1000000)
    expect(result).toBe('$1,000,000')
  })

  it('returns "No gift attached" for zero', () => {
    const result = formatCurrency(0)
    expect(result).toBe('No gift attached')
  })

  it('returns "No gift attached" for falsy values', () => {
    expect(formatCurrency(0 as number)).toBe('No gift attached')
    expect(formatCurrency(null as unknown as number)).toBe('No gift attached')
    expect(formatCurrency(undefined as unknown as number)).toBe('No gift attached')
  })

  it('rounds to whole dollars', () => {
    const result = formatCurrency(99.99)
    expect(result).toBe('$100')
  })
})
