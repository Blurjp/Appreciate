'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { href: '/feed', label: 'Feed', icon: 'HomeIcon' },
  { href: '/create', label: 'Create', icon: 'PlusIcon' },
  { href: '/my-wall', label: 'My Wall', icon: 'LockIcon' },
  { href: '/settings', label: 'Settings', icon: 'SettingsIcon' },
]

function TabIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const cls = cn('w-5 h-5 transition-all', isActive ? 'text-brand-primary' : 'text-brand-text-muted')
  const sw = isActive ? 2 : 1.5

  switch (name) {
    case 'HomeIcon':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'PlusIcon':
      return (
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
          isActive ? 'border-brand-primary bg-brand-primary' : 'border-brand-border bg-brand-surface'
        )}>
          <svg className={cn('w-3.5 h-3.5', isActive ? 'text-white' : 'text-brand-text-muted')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      )
    case 'LockIcon':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    case 'SettingsIcon':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={sw}>
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
  const [user, setUser] = useState<{ id: string } | null | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user === null) {
      router.replace('/welcome')
    }
  }, [user, router])

  if (user === undefined || user === null) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <svg className="w-10 h-10 animate-pulse text-brand-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-background border-t border-brand-border z-40">
        <div className="max-w-2xl mx-auto flex items-end px-4 pt-2 pb-6">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center py-1 transition-all"
              >
                <TabIcon name={tab.icon} isActive={isActive} />
                <span
                  className={cn(
                    'text-[9px] mt-1 tracking-widest uppercase font-medium',
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
