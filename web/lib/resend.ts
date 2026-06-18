import { Resend } from 'resend'

/// Initialized Resend client for sending transactional email.
/// Requires the RESEND_API_KEY environment variable (server-side only).
/// The Resend SDK throws a descriptive error on `.send()` if the key is missing.
export const resend = new Resend(process.env.RESEND_API_KEY)

/// "From" address used for all outgoing Appreciate email.
export const FROM_ADDRESS = 'Appreciate <noreply@appreciate.live>'

/// Reasonable RFC-5322-ish email validation. Not exhaustive, but good enough to
/// reject obviously malformed addresses before hitting the Resend API.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim())
}
