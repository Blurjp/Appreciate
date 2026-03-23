import { createClient } from '@/lib/supabase/server'
import { GratitudePost } from '@/types'

export async function fetchSharedPost(id: string): Promise<GratitudePost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gratitude_posts')
    .select('*, profiles(id, name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const profiles = data.profiles as { id: string; name: string; avatar_url: string | null } | null
  return {
    id: data.id,
    content: data.content,
    feeling: data.feeling || null,
    category: data.category,
    visibility: data.visibility,
    photoUrl: data.photo_url || null,
    cardTemplateId: data.card_template_id || 'minimal',
    authorId: data.author_id,
    author: {
      id: profiles?.id ?? '',
      name: profiles?.name ?? 'Someone',
      avatarUrl: profiles?.avatar_url ?? null,
    },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    heartCount: data.heart_count ?? 0,
    isBookmarked: false,
  }
}
