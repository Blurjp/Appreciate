'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { GratitudePost, PostVisibility } from '@/types'
import { cn } from '@/lib/utils'
import GratitudePostCard from '@/components/GratitudePostCard'
import Toast from '@/components/Toast'
import { GratitudeCategory } from '@/types'
import SkyClient from '../../tree/[userId]/SkyClient'
import TreeClient from '../../tree/[userId]/TreeClient'
import ZenClient, { VisualizationProps } from '../../tree/[userId]/ZenClient'
import PolaroidClient from '../../tree/[userId]/PolaroidClient'
import StickyNotesClient from '../../tree/[userId]/StickyNotesClient'

const EditPostModal = dynamic(
  () => import('@/components/EditPostModal').then(mod => ({ default: mod.default })),
  { ssr: false }
)

const FILTER_OPTIONS: { value: PostVisibility | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'ANONYMOUS', label: 'Anonymous' },
]

export default function MyWallPage() {
  const [filter, setFilter] = useState<PostVisibility | null>(null)
  const [editingPost, setEditingPost] = useState<GratitudePost | null>(null)
  const [toast, setToast] = useState({ visible: false, message: '', icon: '✓', isError: false })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading: postsLoading } = useQuery<GratitudePost[]>({
    queryKey: ['my-wall', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter) params.set('visibility', filter)
      const res = await fetch(`/api/my-wall?${params}`)
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: allWallPosts = [], isLoading: wallPostsLoading } = useQuery<GratitudePost[]>({
    queryKey: ['my-wall-all'],
    queryFn: async () => {
      const res = await fetch('/api/my-wall')
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: userProfile } = useQuery<{
    isPro: boolean
    id: string
    name: string
    avatarUrl: string | null
    wallTheme: string
  }>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const handleWallThemeSaved = useCallback((themeId: string) => {
    queryClient.setQueryData(['user'], (old: unknown) => {
      if (old && typeof old === 'object') {
        return { ...(old as Record<string, unknown>), wallTheme: themeId }
      }
      return old
    })
  }, [queryClient])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
      showToast('Post deleted', '🗑️')
    },
  })

  const heartMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartToggle: true }),
      })
      if (!res.ok) throw new Error('Failed to toggle heart')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      content?: string
      feeling?: string
      category?: GratitudeCategory
      visibility?: PostVisibility
      cardTemplateId?: string
    }) => {
      const { id, ...body } = data
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to update post')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
    onError: () => {
      showToast('Failed to update post', '✗', true)
    },
  })

  const showToast = useCallback((message: string, icon = '✓', isError = false) => {
    setToast({ visible: true, message, icon, isError })
  }, [])

  const handleToggleVisibility = useCallback((post: GratitudePost) => {
    const cycle: Record<PostVisibility, PostVisibility> = {
      PRIVATE: 'PUBLIC',
      PUBLIC: 'ANONYMOUS',
      ANONYMOUS: 'PRIVATE',
    }
    const newVisibility = cycle[post.visibility]
    updateMutation.mutate({ id: post.id, visibility: newVisibility })
    const labels: Record<PostVisibility, { msg: string; icon: string }> = {
      PRIVATE: { msg: 'Post is now private', icon: '🔒' },
      PUBLIC: { msg: 'Post is now public', icon: '🌐' },
      ANONYMOUS: { msg: 'Post is now anonymous', icon: '🎭' },
    }
    showToast(labels[newVisibility].msg, labels[newVisibility].icon)
  }, [updateMutation, showToast])

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirm(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm)
      setDeleteConfirm(null)
    }
  }, [deleteConfirm, deleteMutation])

  const handleEditSave = useCallback((data: {
    id: string
    content: string
    feeling: string
    category: GratitudeCategory
    visibility: PostVisibility
    cardTemplateId: string
  }) => {
    updateMutation.mutate(data)
    showToast('Post updated', '✅')
  }, [updateMutation, showToast])

  return (
    <div className="px-4 pt-5">
      <div className="mb-5">
        <div>
          <p className="mb-1 text-[10px] uppercase text-brand-text-muted">Private</p>
          <h1 className="text-title text-brand-text-primary">My Wall</h1>
        </div>
      </div>

      {userProfile?.id && (
        <div className="mb-5">
          {wallPostsLoading ? (
            <div className="h-[70vh] min-h-[520px] animate-pulse rounded-2xl border border-white/60 bg-white/40 shadow-[0_24px_70px_rgba(62,78,84,0.14)]" />
          ) : (
            <ExactWallEmbed
              data={{
                user: {
                  id: userProfile.id,
                  name: userProfile.name,
                  avatarUrl: userProfile.avatarUrl,
                  wallTheme: userProfile.wallTheme || 'starry',
                },
                posts: allWallPosts.map((post) => ({
                  id: post.id,
                  content: post.content,
                  feeling: post.feeling,
                  category: post.category,
                  createdAt: post.createdAt,
                  heartCount: post.heartCount,
                })),
                stats: {
                  totalPosts: allWallPosts.length,
                  totalHearts: allWallPosts.reduce((sum, post) => sum + (post.heartCount || 0), 0),
                  currentStreak: 0,
                  longestStreak: 0,
                },
              }}
              onThemeSaved={handleWallThemeSaved}
            />
          )}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'rounded-full px-4 py-2 text-[10px] font-medium uppercase transition-all border',
              filter === opt.value
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'glass-chip text-brand-text-muted hover:text-brand-text-primary'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="concept-panel px-6 py-14 text-center">
          <svg className="w-10 h-10 mx-auto text-brand-border animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-brand-border mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-headline text-brand-text-primary">No posts yet</p>
          <p className="text-subheadline text-brand-text-secondary mt-2 max-w-xs mx-auto">
            Start your gratitude journey by creating your first post!
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {posts.map((post) => (
            <GratitudePostCard
              key={post.id}
              post={post}
              showActions
              onHeart={(id) => heartMutation.mutate(id)}
              onEdit={setEditingPost}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen
          isPro={userProfile?.isPro ?? false}
          onClose={() => setEditingPost(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full animate-fade-in border border-brand-border">
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted text-center mb-1">Confirm</p>
            <h3 className="text-title-3 text-brand-text-primary text-center tracking-tight mb-2">Delete Post?</h3>
            <p className="text-subheadline text-brand-text-secondary text-center mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-full border border-brand-border text-subheadline text-brand-text-primary hover:border-brand-primary transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-full border border-brand-primary bg-brand-primary text-white text-subheadline transition-all active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        isVisible={toast.visible}
        message={toast.message}
        icon={toast.icon}
        isError={toast.isError}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  )
}

interface TreeApiResponse {
  user: VisualizationProps['user'] & {
    joinedAt?: string
    wallTheme: string
  }
  posts: VisualizationProps['posts']
  stats: VisualizationProps['stats']
}

function ExactWallEmbed({
  data,
  onThemeSaved,
}: {
  data: TreeApiResponse
  onThemeSaved: (themeId: string) => void
}) {
  const props: VisualizationProps = {
    user: data.user,
    posts: data.posts,
    stats: data.stats,
    isOwner: true,
    currentTheme: data.user.wallTheme,
    embedded: true,
    onThemeSaved,
  }

  const resolvedWallTheme = data.user.wallTheme === 'glass' ? 'sticky-notes' : data.user.wallTheme

  switch (resolvedWallTheme) {
    case 'tree':
      return <TreeClient {...props} />
    case 'zen':
      return <ZenClient {...props} />
    case 'polaroid':
      return <PolaroidClient {...props} />
    case 'sticky-notes':
      return <StickyNotesClient {...props} />
    case 'glass':
      return <StickyNotesClient {...props} />
    case 'starry':
    default:
      return <SkyClient {...props} />
  }
}
