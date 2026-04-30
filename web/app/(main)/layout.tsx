'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Plus, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider } from '@/contexts/ThemeContext'

const TABS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/create', label: 'Create', icon: Plus },
  { href: '/my-wall', label: 'Wall', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

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
    }).catch(() => {
      setUser(null)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-page-bg)' }}>
        <svg className="w-10 h-10 animate-pulse text-brand-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="concept-page flex min-h-screen flex-col" style={{ background: 'var(--theme-page-bg)' }}>
        <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 pb-28">
          {children}
        </main>

        <nav
          className="fixed bottom-4 left-0 right-0 z-40 px-4"
          style={{
            backdropFilter: 'var(--theme-backdrop-blur)',
            WebkitBackdropFilter: 'var(--theme-backdrop-blur)',
          }}
        >
          <div
            className="mx-auto flex max-w-2xl items-center rounded-2xl border px-2 py-2 shadow-[0_18px_42px_rgba(48,64,72,0.16)]"
            style={{
              background: 'var(--theme-nav-bg)',
              borderColor: 'var(--theme-nav-border)',
            }}
          >
            {TABS.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl transition-all',
                    isActive ? 'glass-chip text-brand-text-primary' : 'text-brand-text-muted hover:text-brand-text-primary'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.7} />
                  <span
                    className={cn(
                      'mt-1 text-[10px] font-medium uppercase',
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
    </ThemeProvider>
  )
}
