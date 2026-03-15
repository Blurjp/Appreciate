import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateStreakData } from '@/lib/streak'

// POST /api/posts — Create a new gratitude post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const { content, feeling, category, visibility, photoUrl } = body

  if (!content?.trim()) {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    )
  }

  const post = await prisma.gratitudePost.create({
    data: {
      content: content.trim(),
      feeling: feeling || null,
      category: category || 'OTHER',
      visibility: visibility || 'PRIVATE',
      photoUrl: photoUrl || null,
      authorId: userId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  })

  // Update streak after creating a post
  await updateStreakData(userId)

  return NextResponse.json(post, { status: 201 })
}

// GET /api/posts — Get public feed (with optional category filter)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const where: Record<string, unknown> = {
    visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
  }

  if (category) {
    where.category = category
  }

  const posts = await prisma.gratitudePost.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })

  return NextResponse.json(posts)
}
