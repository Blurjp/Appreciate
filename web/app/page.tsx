'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.replace('/feed')
    } else {
      router.replace('/welcome')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-[40px]">🙏</span>
        </div>
        <p className="text-title-2 text-brand-text-primary mt-4 font-semibold">Appreciate</p>
        <p className="text-caption text-brand-text-secondary mt-1">Loading...</p>
      </div>
    </div>
  )
}
