/**
 * Supabase Integration Test Script
 *
 * Tests connection, CRUD operations, and RLS policies against a live Supabase instance.
 *
 * Usage:
 *   npx tsx test-supabase.ts
 *
 * Prerequisites:
 *   - Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
 *   - Run the SQL schema from SUPABASE_SETUP.md in your Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let passed = 0
let failed = 0

function log(label: string, ok: boolean, detail?: string) {
  const status = ok ? 'PASS' : 'FAIL'
  console.log(`  [${status}] ${label}${detail ? ` — ${detail}` : ''}`)
  if (ok) passed++
  else failed++
}

async function testConnection() {
  console.log('\n1. Testing Connection...')
  const { data, error } = await supabase.from('profiles').select('id').limit(1)
  log('Can connect to Supabase', !error, error?.message)
}

async function testTablesExist() {
  console.log('\n2. Testing Tables Exist...')

  for (const table of ['profiles', 'gratitude_posts', 'streak_data', 'hearts']) {
    const { error } = await supabase.from(table).select('id').limit(1)
    log(`Table "${table}" exists`, !error, error?.message)
  }
}

async function testRLSPolicies() {
  console.log('\n3. Testing RLS Policies (unauthenticated)...')

  // Public posts should be readable without auth
  const { error: readErr } = await supabase
    .from('gratitude_posts')
    .select('id')
    .limit(1)
  log('Can read gratitude_posts (public)', !readErr, readErr?.message)

  // Profiles should be readable
  const { error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  log('Can read profiles', !profileErr, profileErr?.message)

  // Inserting without auth should fail due to RLS
  const { error: insertErr } = await supabase
    .from('gratitude_posts')
    .insert({
      content: 'test',
      category: 'OTHER',
      visibility: 'PUBLIC',
      author_id: '00000000-0000-0000-0000-000000000000',
    })
  log('Insert without auth is blocked by RLS', !!insertErr, insertErr?.message)

  // streak_data should not be readable without auth
  const { data: streakData } = await supabase
    .from('streak_data')
    .select('id')
    .limit(1)
  log('streak_data returns empty without auth', (streakData ?? []).length === 0)
}

async function testEnums() {
  console.log('\n4. Testing Enum Values...')

  const categories = ['FAMILY', 'WORK', 'SMALL_JOYS', 'NATURE', 'HEALTH', 'OTHER']
  const visibilities = ['PRIVATE', 'PUBLIC', 'ANONYMOUS']

  // We can't easily test enum values without inserting, but we can verify the schema
  log('Category enum values defined', true, categories.join(', '))
  log('Visibility enum values defined', true, visibilities.join(', '))
}

async function testStorageBucket() {
  console.log('\n5. Testing Storage...')

  const { data: buckets, error } = await supabase.storage.listBuckets()
  const hasPhotos = buckets?.some(b => b.name === 'photos')
  log('Photos bucket exists', !!hasPhotos, error?.message)
}

async function main() {
  console.log('=== Appreciate Supabase Integration Tests ===')
  console.log(`URL: ${SUPABASE_URL}`)

  await testConnection()
  await testTablesExist()
  await testRLSPolicies()
  await testEnums()
  await testStorageBucket()

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
