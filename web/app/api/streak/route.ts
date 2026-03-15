import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateStreak } from '@/lib/streak'

// GET /api/streak — Get streak data for authenticated user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const streak = await calculateStreak(userId)

  return NextResponse.json(streak)
}
