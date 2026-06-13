import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user — Get current user profile from Supabase
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, created_at, is_pro, stripe_customer_id, wall_theme')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    isPro: profile.is_pro ?? false,
    hasStripeCustomer: !!profile.stripe_customer_id,
    wallTheme: profile.wall_theme || 'starry',
  })
}

// PATCH /api/user — Update user profile
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if ('name' in body) updateData.name = body.name
  if (body.wallTheme) updateData.wall_theme = body.wallTheme

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select('id, name, email, avatar_url, created_at, is_pro, wall_theme')
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    isPro: profile.is_pro ?? false,
    wallTheme: profile.wall_theme || 'starry',
  })
}
