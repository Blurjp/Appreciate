import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPosts, createPost } from '@/lib/db/posts'

// GET /api/posts — Fetch public feed (with optional category filter)
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)

  try {
    const posts = await fetchPosts(supabase, {
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/posts — Create a new gratitude post
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { content, feeling, category, visibility, photoUrl } = body

  if (!content?.trim()) {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    )
  }

  try {
    const post = await createPost(supabase, {
      content: content.trim(),
      feeling: feeling || undefined,
      category: category || 'OTHER',
      visibility: visibility || 'PRIVATE',
      photoUrl: photoUrl || undefined,
      authorId: user.id,
    })
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
