import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_ADDRESS, isValidEmail } from '@/lib/resend'

// POST /api/email — Send a transactional email via Resend.
// Requires an authenticated Supabase session.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { to?: unknown; subject?: unknown; html?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, subject, html } = body

  if (!isValidEmail(to)) {
    return NextResponse.json({ error: 'A valid "to" email address is required' }, { status: 400 })
  }

  if (typeof subject !== 'string' || !subject.trim()) {
    return NextResponse.json({ error: '"subject" is required' }, { status: 400 })
  }

  if (typeof html !== 'string' || !html.trim()) {
    return NextResponse.json({ error: '"html" is required' }, { status: 400 })
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
