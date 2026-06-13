'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudePost } from '@/types'
export function usePosts() {
  return useQuery<GratitudePost[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      content: string
      feeling?: string
      category: string
      visibility: string
      photoUrl?: string
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create post')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      content?: string
      category?: string
      visibility?: string
    }) => {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update post')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete post')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}

export function useToggleHeart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartToggle: true }),
      })
      if (!res.ok) throw new Error('Failed to toggle heart')
      return res.json()
    },
    onMutate: async (postId: string) => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10)
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      const prev = queryClient.getQueryData<GratitudePost[]>(['posts'])
      queryClient.setQueryData<GratitudePost[]>(['posts'], (old) =>
        (old ?? []).map((p) => {
          if (p.id !== postId) return p
          const wasHearted = p.isHeartedByMe ?? false
          return {
            ...p,
            isHeartedByMe: !wasHearted,
            heartCount: Math.max(0, p.heartCount + (wasHearted ? -1 : 1)),
          }
        })
      )
      return { prev }
    },
    onError: (_err, _postId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['posts'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
