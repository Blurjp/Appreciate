import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updatePost, deletePost, toggleHeart } from '@/lib/db/posts'

// GET /api/posts/:id — Fetch a single post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('gratitude_posts')
    .select('*, profiles(id, name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PATCH /api/posts/:id — Update post or toggle heart
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await req.json()

  // Heart toggle
  if (body.heartToggle) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const hearted = await toggleHeart(supabase, id, user.id)
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
    const post = await updatePost(supabase, id, {
      content: body.content,
      feeling: body.feeling,
      category: body.category,
      visibility: body.visibility,
      cardTemplateId: body.cardTemplateId,
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deletePost(supabase, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
