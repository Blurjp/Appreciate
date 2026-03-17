'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/feed', label: 'Feed', icon: 'HomeIcon' },
  { href: '/create', label: 'Create', icon: 'PlusIcon' },
  { href: '/my-wall', label: 'My Wall', icon: 'LockIcon' },
  { href: '/settings', label: 'Settings', icon: 'SettingsIcon' },
]

function TabIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const color = isActive ? 'text-brand-primary' : 'text-brand-text-muted'

  switch (name) {
    case 'HomeIcon':
      return (
        <svg className={cn('w-6 h-6', color)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'PlusIcon':
      return (
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg transition-all',
          isActive ? 'bg-brand-primary' : 'bg-brand-accent'
        )}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )
    case 'LockIcon':
      return (
        <svg className={cn('w-6 h-6', color)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    case 'SettingsIcon':
      return (
        <svg className={cn('w-6 h-6', color)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    default:
      return null
  }
}

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
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center animate-pulse">
          <span className="text-[32px]">🙏</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-border z-40">
        <div className="max-w-2xl mx-auto flex items-end px-2 pt-2 pb-6">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center py-2 transition-all"
              >
                <TabIcon name={tab.icon} isActive={isActive} />
                <span
                  className={cn(
                    'text-[10px] mt-1 font-medium',
                    isActive ? 'text-brand-primary' : 'text-brand-text-muted'
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
