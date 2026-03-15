import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/// Server-side Supabase client for use in API routes and Server Components.
/// Reads/writes auth cookies to maintain the user session.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can fail in Server Components (read-only).
            // This is fine — the middleware will refresh the session.
          }
        },
      },
    }
  )
}
