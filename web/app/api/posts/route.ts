import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api/v1'

// GET /api/posts — Fetch public feed (with optional category filter)
export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token || !token.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  try {
    const res = await fetch(`${API_URL}/posts?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch posts')
    }

    const json = await res.json()
    // Backend returns { success: true, data: [...] }
    const posts = json.data || json
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
  const token = await getToken({ req })

  if (!token || !token.accessToken) {
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
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        recipient: 'Someone', // Backend requires recipient field
        message: content,
        category: category || 'OTHER',
        visibility: visibility?.toLowerCase() || 'public',
        feeling: feeling || undefined,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create post')
    }

    const json = await res.json()
    const post = json.data || json
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
