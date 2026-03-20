import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server Component - instant redirect without client-side flash
export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Server-side redirect - much faster than client-side router.replace
  redirect(session ? '/feed' : '/welcome')
}
