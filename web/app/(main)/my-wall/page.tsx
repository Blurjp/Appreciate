'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudePost, PostVisibility, StreakData } from '@/types'
import { cn } from '@/lib/utils'
import GratitudePostCard from '@/components/GratitudePostCard'
import StreakCardComponent from '@/components/StreakCard'
import EditPostModal from '@/components/EditPostModal'
import Toast from '@/components/Toast'
import { GratitudeCategory } from '@/types'

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
  })

  const { data: userProfile } = useQuery<{ isPro: boolean }>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })

  const { data: streak } = useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await fetch('/api/streak')
      return res.json()
    },
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

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string
      content?: string
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

  const handleToggleVisibility = (post: GratitudePost) => {
    const newVisibility = post.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE'
    updateMutation.mutate({ id: post.id, visibility: newVisibility })
    showToast(
      newVisibility === 'PRIVATE' ? 'Post is now private' : 'Post is now public',
      newVisibility === 'PRIVATE' ? '🔒' : '🌐'
    )
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleEditSave = (data: {
    id: string
    content: string
    category: GratitudeCategory
    visibility: PostVisibility
    cardTemplateId: string
  }) => {
    updateMutation.mutate(data)
    showToast('Post updated', '✅')
  }

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
              onHeart={(id) =>
                updateMutation.mutate({ id, visibility: post.visibility })
              }
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
