'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { GratitudePost, PostVisibility, StreakData } from '@/types'
import { cn } from '@/lib/utils'
import GratitudePostCard from '@/components/GratitudePostCard'
import Toast from '@/components/Toast'
import { GratitudeCategory } from '@/types'

// Lazy load heavy components for better initial load performance
const StreakCardComponent = dynamic(
  () => import('@/components/StreakCard').then(mod => ({ default: mod.default })),
  { loading: () => <div className="h-24 bg-brand-card rounded-2xl border border-brand-border animate-pulse" /> }
)

const EditPostModal = dynamic(
  () => import('@/components/EditPostModal').then(mod => ({ default: mod.default })),
  { ssr: false }
)

const FILTER_OPTIONS: { value: PostVisibility | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
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

  const { data: userProfile } = useQuery<{ isPro: boolean; id: string; wallTheme: string }>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: streak } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await fetch('/api/streak')
      return res.json()
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
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
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
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
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const showToast = useCallback((message: string, icon = '✓', isError = false) => {
    setToast({ visible: true, message, icon, isError })
  }, [])

  const handleToggleVisibility = useCallback((post: GratitudePost) => {
    const newVisibility = post.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE'
    updateMutation.mutate({ id: post.id, visibility: newVisibility })
    showToast(
      newVisibility === 'PRIVATE' ? 'Post is now private' : 'Post is now public',
      newVisibility === 'PRIVATE' ? '🔒' : '🌐'
    )
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
    <div className="px-4 pt-6">
      {/* Header */}
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Private</p>
      <h1 className="text-title text-brand-text-primary tracking-tight mb-5">My Wall</h1>

      {/* Streak Card */}
      {streak && (
        <div className="mb-5">
          <StreakCardComponent streak={streak} />
        </div>
      )}

      {/* My Wall link */}
      {userProfile?.id && (
        <a
          href={`/tree/${userProfile.id}`}
          className="block mb-5 p-4 rounded-2xl bg-white border border-brand-border shadow-card hover:shadow-card-hover transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warm-cream-200 flex items-center justify-center text-lg">
                {{ starry: '✨', tree: '🌳', zen: '🪨', polaroid: '📸', glass: '🧊' }[userProfile.wallTheme || 'starry'] || '✨'}
              </div>
              <div>
                <p className="text-headline text-brand-text-primary">My Gratitude Wall</p>
                <p className="text-caption text-brand-text-secondary">
                  {{ starry: 'Starry Night', tree: 'Gratitude Tree', zen: 'Zen Garden', polaroid: 'Polaroid Gallery', glass: 'Glassmorphism' }[userProfile.wallTheme || 'starry'] || 'Starry Night'}
                </p>
              </div>
            </div>
            <span className="text-brand-text-muted group-hover:text-brand-primary transition-colors">→</span>
          </div>
        </a>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-medium transition-all border',
              filter === opt.value
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-brand-text-muted border-brand-border hover:border-brand-primary hover:text-brand-primary'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="text-center py-16">
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
