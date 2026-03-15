'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/feed', label: 'Feed', icon: '🌟', activeIcon: '🌟' },
  { href: '/create', label: 'Create', icon: '➕', activeIcon: '➕' },
  { href: '/my-wall', label: 'My Wall', icon: '🔒', activeIcon: '🔒' },
  { href: '/settings', label: 'Settings', icon: '⚙️', activeIcon: '⚙️' },
]

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/welcome')
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-brand-warm-white flex items-center justify-center">
        <span className="text-[48px] animate-pulse">🙏</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-warm-white flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Tab Bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-light-gray safe-bottom z-40">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex-1 flex flex-col items-center py-2 pt-3 transition-colors',
                  isActive ? 'text-brand-gold' : 'text-brand-medium-gray'
                )}
              >
                <span className="text-[20px]">
                  {isActive ? tab.activeIcon : tab.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] mt-0.5',
                    isActive ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
