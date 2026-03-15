import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchMyPosts } from '@/lib/db/posts'

// GET /api/my-wall — Fetch all posts for the authenticated user
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const visibility = searchParams.get('visibility') || undefined

  try {
    const posts = await fetchMyPosts(supabase, user.id, { visibility })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
