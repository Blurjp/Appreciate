import { SupabaseClient } from '@supabase/supabase-js'
import { GratitudePost } from '@/types'

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
    cardTemplateId: (row.card_template_id as string) || 'minimal',
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
    isHeartedByMe: false,
  }
}

async function annotateHearts(
  supabase: SupabaseClient,
  posts: GratitudePost[],
  userId: string
): Promise<GratitudePost[]> {
  if (posts.length === 0) return posts
  const postIds = posts.map((p) => p.id)
  const { data: hearted } = await supabase
    .from('hearts')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)
  const heartedSet = new Set((hearted ?? []).map((h) => h.post_id))
  return posts.map((p) => ({ ...p, isHeartedByMe: heartedSet.has(p.id) }))
}

export async function fetchPosts(
  supabase: SupabaseClient,
  options?: { category?: string; limit?: number; offset?: number; userId?: string }
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
  const posts = (data ?? []).map(mapPost)
  if (options?.userId) return annotateHearts(supabase, posts, options.userId)
  return posts
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
  const posts = (data ?? []).map(mapPost)
  return annotateHearts(supabase, posts, userId)
}

export async function createPost(
  supabase: SupabaseClient,
  data: {
    content: string
    feeling?: string
    category: string
    visibility: string
    photoUrl?: string
    cardTemplateId?: string
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
      card_template_id: data.cardTemplateId || 'minimal',
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
  data: { content?: string; feeling?: string; category?: string; visibility?: string; cardTemplateId?: string }
) {
  const updateData: Record<string, unknown> = {}
  if (data.content !== undefined) updateData.content = data.content
  if (data.feeling !== undefined) updateData.feeling = data.feeling
  if (data.category !== undefined) updateData.category = data.category
  if (data.visibility !== undefined) updateData.visibility = data.visibility
  if (data.cardTemplateId !== undefined) updateData.card_template_id = data.cardTemplateId

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

export async function toggleHeart(
  supabase: SupabaseClient,
  postId: string,
  userId: string
) {
  const { data, error } = await supabase.rpc('toggle_heart', {
    post_id_param: postId,
    user_id_param: userId,
  })
  if (error) throw error
  return data as boolean
}
