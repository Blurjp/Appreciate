'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/create', icon: PlusCircle, label: 'Create' },
  { href: '/my-wall', icon: User, label: 'My Wall' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-border z-50 shadow-elevated">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'text-brand-accent'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
