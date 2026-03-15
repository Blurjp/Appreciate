import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updatePost, deletePost, toggleHeart } from '@/lib/db/posts'

// GET /api/posts/:id — Fetch a single post
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: post, error } = await supabase
    .from('gratitude_posts')
    .select('*, profiles(id, name, avatar_url)')
    .eq('id', params.id)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PATCH /api/posts/:id — Update post or toggle heart
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const body = await req.json()

  // Heart toggle
  if (body.heartToggle) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const hearted = await toggleHeart(supabase, params.id, user.id)
      return NextResponse.json({ hearted })
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      )
    }
  }

  // Content update — requires auth and ownership (RLS enforces this)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await updatePost(supabase, params.id, {
      content: body.content,
      category: body.category,
      visibility: body.visibility,
    })
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/:id — Delete a post (RLS ensures only owner can delete)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deletePost(supabase, params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
