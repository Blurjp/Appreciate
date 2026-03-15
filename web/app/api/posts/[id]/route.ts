import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/posts/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.gratitudePost.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

// PATCH /api/posts/:id — Update post (content, category, visibility, heartCount)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const body = await req.json()

  // Allow heart increments without auth
  if (body.heartIncrement) {
    const post = await prisma.gratitudePost.update({
      where: { id: params.id },
      data: { heartCount: { increment: 1 } },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })
    return NextResponse.json(post)
  }

  // All other updates require auth
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const existing = await prisma.gratitudePost.findUnique({
    where: { id: params.id },
  })

  if (!existing || existing.authorId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (body.content !== undefined) data.content = body.content
  if (body.category !== undefined) data.category = body.category
  if (body.visibility !== undefined) data.visibility = body.visibility

  const post = await prisma.gratitudePost.update({
    where: { id: params.id },
    data,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  })

  return NextResponse.json(post)
}

// DELETE /api/posts/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const existing = await prisma.gratitudePost.findUnique({
    where: { id: params.id },
  })

  if (!existing || existing.authorId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.gratitudePost.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
