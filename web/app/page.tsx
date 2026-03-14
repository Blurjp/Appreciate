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

  // Loading state
  return (
    <div className="min-h-screen bg-brand-warm-white flex items-center justify-center">
      <div className="text-center">
        <span className="text-[64px] animate-pulse">🙏</span>
        <p className="text-title-2 text-brand-charcoal mt-4">Appreciate</p>
      </div>
    </div>
  )
}
