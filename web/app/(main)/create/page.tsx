'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GratitudeCategory, GratitudePost, PostVisibility } from '@/types'
import CreatePostForm from '@/components/CreatePostForm'

export default function CreatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user } = useQuery<{ isPro: boolean }>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: async (data: {
      content: string
      category: GratitudeCategory
      visibility: PostVisibility
      photoUrl?: string
      cardTemplateId?: string
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create post')
      return res.json() as Promise<GratitudePost>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall'] })
      queryClient.invalidateQueries({ queryKey: ['my-wall-all'] })
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })

  return (
    <div className="px-4 pt-5">
      <div className="concept-panel h-[calc(100vh-8.5rem)]">
      <CreatePostForm
        isPro={user?.isPro ?? false}
        onSubmit={async (data) => {
          return createMutation.mutateAsync(data)
        }}
        onClose={() => router.push('/my-wall')}
      />
      </div>
    </div>
  )
}
