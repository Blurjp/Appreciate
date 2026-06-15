import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user — Get current user profile from Supabase
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: result, error } = await supabase.rpc('self_profile')
  const profile = Array.isArray(result) ? result[0] : null

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
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
    wallHidden: profile.wall_hidden ?? false,
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
  if ('wallHidden' in body) updateData.wall_hidden = !!body.wallHidden

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Re-read via SECURITY DEFINER RPC (email/stripe columns are column-restricted)
  const { data: result } = await supabase.rpc('self_profile')
  const profile = Array.isArray(result) ? result[0] : null

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    isPro: profile.is_pro ?? false,
    wallTheme: profile.wall_theme || 'starry',
    wallHidden: profile.wall_hidden ?? false,
  })
}
