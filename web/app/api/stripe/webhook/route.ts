import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Service-role client: the webhook carries no session cookie, so the anon
  // client (auth.uid() = null) is blocked by RLS from writing profiles.
  // The admin client bypasses RLS so is_pro / subscription updates persist.
  let supabase
  try {
    supabase = createAdminClient()
  } catch (err) {
    // Fail loud so Stripe retries and the operator notices the missing key,
    // rather than silently ack'ing events that never grant Pro.
    console.error('Stripe webhook: cannot create admin client:', (err as Error).message)
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (userId && session.subscription) {
        const { error } = await supabase.from('profiles').update({
          is_pro: true,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', userId)
        if (error) console.error('webhook checkout.session.completed: profile update failed', userId, error.message)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break
      const userId = (customer as Stripe.Customer).metadata?.supabase_user_id
      if (userId) {
        const isPro = sub.status === 'active' || sub.status === 'trialing'
        const { error } = await supabase.from('profiles').update({
          is_pro: isPro,
          stripe_subscription_id: sub.id,
        }).eq('id', userId)
        if (error) console.error('webhook customer.subscription.updated: profile update failed', userId, error.message)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break
      const userId = (customer as Stripe.Customer).metadata?.supabase_user_id
      if (userId) {
        const { error } = await supabase.from('profiles').update({
          is_pro: false,
          stripe_subscription_id: null,
        }).eq('id', userId)
        if (error) console.error('webhook customer.subscription.deleted: profile update failed', userId, error.message)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
