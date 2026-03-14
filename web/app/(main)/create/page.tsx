'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GratitudeCategory, PostVisibility } from '@/types'
import CreatePostForm from '@/components/CreatePostForm'

export default function CreatePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: {
      content: string
      feeling: string
      category: GratitudeCategory
      visibility: PostVisibility
      photoUrl?: string
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create post')
      return res.json()
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
          await createMutation.mutateAsync(data)
        }}
        onClose={() => router.push('/my-wall')}
      />
    </div>
  )
}
