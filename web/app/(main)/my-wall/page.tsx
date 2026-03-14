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
  { value: 'PRIVATE', label: '🔒 Private' },
  { value: 'PUBLIC', label: '🌐 Public' },
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
  }) => {
    updateMutation.mutate(data)
    showToast('Post updated', '✅')
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <h1 className="text-title text-brand-charcoal flex items-center gap-2 mb-4">
        🔒 My Gratitude Wall
      </h1>

      {/* Streak Card */}
      {streak && (
        <div className="mb-5">
          <StreakCardComponent streak={streak} />
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-4 py-2 rounded-full text-subheadline font-medium transition-all',
              filter === opt.value
                ? 'bg-brand-gold text-white'
                : 'bg-brand-light-gray text-brand-medium-gray hover:bg-gray-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="text-center py-12">
          <span className="text-[32px] animate-pulse">🙏</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-[48px]">📝</span>
          <p className="text-headline text-brand-charcoal mt-3">
            No posts yet
          </p>
          <p className="text-subheadline text-brand-medium-gray mt-1">
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
          onClose={() => setEditingPost(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-ios-xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-title-3 text-brand-charcoal text-center mb-2">
              Delete Post?
            </h3>
            <p className="text-subheadline text-brand-medium-gray text-center mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-ios-md border border-brand-light-gray text-headline text-brand-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-ios-md bg-red-500 text-white text-headline"
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
