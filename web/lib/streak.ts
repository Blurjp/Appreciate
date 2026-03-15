// This file is kept for backwards compatibility.
// The primary streak logic now lives in lib/db/streak.ts and uses Supabase.
// The streak_data table is auto-updated by a Supabase database trigger on post creation.
export { fetchStreak } from './db/streak'
