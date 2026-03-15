import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchStreak } from '@/lib/db/streak'

// GET /api/streak — Fetch streak data for the authenticated user
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const streak = await fetchStreak(supabase, user.id)
    return NextResponse.json(streak)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
