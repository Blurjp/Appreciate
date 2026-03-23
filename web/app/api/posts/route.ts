import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPosts, createPost } from '@/lib/db/posts'

// GET /api/posts — Fetch public feed (with optional category filter)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined

  try {
    const posts = await fetchPosts(supabase, { category })
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { content, feeling, category, visibility, photoUrl, cardTemplateId } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  try {
    const post = await createPost(supabase, {
      content,
      feeling: feeling || undefined,
      category: category || 'SMALL_JOYS',
      visibility: visibility || 'PRIVATE',
      photoUrl: photoUrl || undefined,
      cardTemplateId: cardTemplateId || 'minimal',
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
