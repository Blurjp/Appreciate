import { SupabaseClient } from '@supabase/supabase-js'
import { GratitudePost } from '@/types'

// All queries use Supabase's PostgREST API with RLS enforcement.
// The authenticated user's JWT is passed automatically via the Supabase client.

const POST_SELECT = '*, profiles(id, name, avatar_url)'

function mapPost(row: Record<string, unknown>): GratitudePost {
  const profiles = row.profiles as { id: string; name: string; avatar_url: string | null } | null
  return {
    id: row.id as string,
    content: row.content as string,
    feeling: (row.feeling as string) || null,
    category: row.category as GratitudePost['category'],
    visibility: row.visibility as GratitudePost['visibility'],
    photoUrl: (row.photo_url as string) || null,
    authorId: row.author_id as string,
    author: {
      id: profiles?.id ?? '',
      name: profiles?.name ?? 'Unknown',
      avatarUrl: profiles?.avatar_url ?? null,
    },
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    heartCount: (row.heart_count as number) ?? 0,
    isBookmarked: (row.is_bookmarked as boolean) ?? false,
  }
}

export async function fetchPosts(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number; offset?: number }
) {
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  let query = supabase
    .from('gratitude_posts')
    .select(POST_SELECT)
    .or('visibility.eq.PUBLIC,visibility.eq.ANONYMOUS')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function fetchMyPosts(
  supabase: SupabaseClient,
  userId: string,
  options?: { visibility?: string }
) {
  let query = supabase
    .from('gratitude_posts')
    .select(POST_SELECT)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (options?.visibility) {
    query = query.eq('visibility', options.visibility)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapPost)
}

export async function createPost(
  supabase: SupabaseClient,
  data: {
    content: string
    feeling?: string
    category: string
    visibility: string
    photoUrl?: string
    authorId: string
  }
) {
  const { data: post, error } = await supabase
    .from('gratitude_posts')
    .insert({
      content: data.content,
      feeling: data.feeling || null,
      category: data.category,
      visibility: data.visibility,
      photo_url: data.photoUrl || null,
      author_id: data.authorId,
    })
    .select(POST_SELECT)
    .single()

  if (error) throw error
  return mapPost(post)
}

export async function updatePost(
  supabase: SupabaseClient,
  id: string,
  data: { content?: string; category?: string; visibility?: string }
) {
  const updateData: Record<string, unknown> = {}
  if (data.content !== undefined) updateData.content = data.content
  if (data.category !== undefined) updateData.category = data.category
  if (data.visibility !== undefined) updateData.visibility = data.visibility

  const { data: post, error } = await supabase
    .from('gratitude_posts')
    .update(updateData)
    .eq('id', id)
    .select(POST_SELECT)
    .single()

  if (error) throw error
  return mapPost(post)
}

export async function deletePost(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('gratitude_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/// Toggle heart: inserts or deletes from the hearts table.
/// The heart_count on gratitude_posts should be updated via a trigger or RPC.
export async function toggleHeart(
  supabase: SupabaseClient,
  postId: string,
  userId: string
) {
  // Check if already hearted
  const { data: existing } = await supabase
    .from('hearts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (existing && existing.length > 0) {
    // Un-heart
    await supabase
      .from('hearts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    // Decrement count
    await supabase
      .from('gratitude_posts')
      .update({ heart_count: supabase.rpc ? undefined : 0 })
      .eq('id', postId)

    // Use RPC for atomic decrement
    await supabase.rpc('decrement_heart_count', { post_id_param: postId })

    return false
  } else {
    // Heart
    await supabase
      .from('hearts')
      .insert({ post_id: postId, user_id: userId })

    // Use RPC for atomic increment
    await supabase.rpc('increment_heart_count', { post_id_param: postId })

    return true
  }
}
