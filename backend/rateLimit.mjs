const buckets = new Map()

function getKey(scope, identifier) {
  return `${scope}:${identifier}`
}

export function rateLimit({ scope, identifier, limit, windowMs }) {
  const now = Date.now()
  const key = getKey(scope, identifier)
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now, remaining: 0 }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count }
}
