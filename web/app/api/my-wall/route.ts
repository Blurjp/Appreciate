import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/my-wall — Get all posts for the authenticated user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { searchParams } = new URL(req.url)
  const visibility = searchParams.get('visibility')

  const where: Record<string, unknown> = { authorId: userId }
  if (visibility) {
    where.visibility = visibility
  }

  const posts = await prisma.gratitudePost.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}
