'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudeCategory, GratitudePost, PostVisibility } from '@/types'
import CreatePostForm from '@/components/CreatePostForm'

export default function CreatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    },
  })

  return (
    <div className="h-[calc(100vh-5rem)]">
      <CreatePostForm
        onSubmit={async (data) => {
          return createMutation.mutateAsync(data)
        }}
        onClose={() => router.push('/my-wall')}
      />
    </div>
  )
}
