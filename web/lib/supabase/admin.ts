import { createClient } from '@supabase/supabase-js'

/// Privileged Supabase client using the service-role key. Bypasses RLS.
/// Use ONLY in server contexts that have NO user session (e.g. Stripe webhooks,
/// cron jobs). NEVER import this in a client component or expose the key to the
/// browser. Throws if SUPABASE_SERVICE_ROLE_KEY is not configured.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — cannot create admin client')
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
