'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProfile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import ThemePicker from '@/components/ThemePicker'

export default function SettingsPage() {
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [newName, setNewName] = useState('')
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradedBanner(true)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.replace('/settings')
      const t = setTimeout(() => setShowUpgradedBanner(false), 4000)
      return () => clearTimeout(t)
    }
  }, [searchParams, queryClient, router])

  const { data: user, isLoading } = useQuery<UserProfile & { isPro: boolean; hasStripeCustomer: boolean }>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setShowNameEdit(false)
    },
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/welcome')
  }

  const displayName = user?.name || 'User'
  const email = user?.email || ''
  const initial = displayName[0]?.toUpperCase() || 'U'

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        setIsUpgrading(false)
      }
    } catch {
      setIsUpgrading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsManaging(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        setIsManaging(false)
      }
    } catch {
      setIsManaging(false)
    }
  }

  return (
    <div className="px-4 pt-6">
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Account</p>
      <h1 className="text-title text-brand-text-primary tracking-tight mb-6">Settings</h1>

      {showUpgradedBanner && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-brand-primary/10 border border-brand-primary flex items-center gap-3">
          <svg className="w-5 h-5 text-brand-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-subheadline text-brand-primary font-medium">Welcome to Pro! All features are now unlocked.</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl p-5 mb-4 border border-brand-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-brand-text-primary text-title-3 border border-brand-border font-semibold">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-headline text-brand-text-primary truncate">{displayName}</p>
              <button
                onClick={() => { setNewName(displayName); setShowNameEdit(true) }}
                className="text-[9px] tracking-widest uppercase text-brand-text-muted hover:text-brand-primary transition-colors border border-brand-border rounded-full px-2 py-0.5"
              >
                Edit
              </button>
            </div>
            <p className="text-subheadline text-brand-text-secondary truncate mt-0.5">{email}</p>
          </div>
        </div>
      </div>

      {/* Theme Selection Card */}
      {!isLoading && user && (
        <button
          onClick={() => setShowThemePicker(true)}
          className="w-full text-left rounded-2xl p-5 mb-4 border border-brand-border hover:border-brand-primary transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warm-cream-200 flex items-center justify-center text-lg">
                {{ starry: '✨', tree: '🌳', zen: '🪨', polaroid: '📸', glass: '🧊' }[user.wallTheme || 'starry'] || '✨'}
              </div>
              <div>
                <p className="text-headline text-brand-text-primary">Wall Theme</p>
                <p className="text-caption text-brand-text-secondary">
                  {{ starry: 'Starry Night', tree: 'Gratitude Tree', zen: 'Zen Garden', polaroid: 'Polaroid Gallery', glass: 'Glassmorphism' }[user.wallTheme || 'starry'] || 'Starry Night'}
                </p>
              </div>
            </div>
            <span className="text-brand-text-muted group-hover:text-brand-primary transition-colors text-lg">›</span>
          </div>
        </button>
      )}

      {/* Subscription Card */}
      {isLoading ? (
        <div className="rounded-2xl p-5 mb-4 border border-brand-border animate-pulse">
          <div className="h-5 w-32 bg-brand-surface rounded mb-2" />
          <div className="h-3 w-48 bg-brand-surface rounded" />
        </div>
      ) : user?.isPro ? (
        <div className="rounded-2xl p-5 mb-4 border border-brand-primary bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-headline text-brand-text-primary font-semibold">Appreciate Pro</p>
                <span className="text-[9px] tracking-widest uppercase font-semibold bg-brand-primary text-white px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-caption text-brand-text-muted">All features unlocked</p>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={isManaging}
              className="text-caption tracking-wide text-brand-text-muted border border-brand-border rounded-xl px-3 py-1.5 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-40"
            >
              {isManaging ? '...' : 'Manage'}
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              'Unlimited gratitude entries',
              'AI-generated appreciation cards',
              'Custom card backgrounds',
              'Share cards publicly',
              'Priority support',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-caption text-brand-text-secondary">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden mb-4 border border-brand-border">
          {/* Free plan header */}
          <div className="p-5 border-b border-brand-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-headline text-brand-text-primary font-semibold mb-0.5">Free Plan</p>
                <p className="text-caption text-brand-text-muted">Basic journaling features</p>
              </div>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-brand-text-muted border border-brand-border px-2 py-0.5 rounded-full">Current</span>
            </div>
          </div>
          {/* Feature comparison */}
          <div className="p-5 space-y-2.5">
            {[
              { label: 'Unlimited gratitude entries', included: true },
              { label: 'Share cards publicly', included: true },
              { label: 'AI-generated appreciation cards', included: false },
              { label: 'Custom card backgrounds', included: false },
              { label: 'Priority support', included: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                {item.included ? (
                  <svg className="w-4 h-4 text-brand-primary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-brand-border flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                )}
                <span className={`text-caption ${item.included ? 'text-brand-text-secondary' : 'text-brand-text-muted'}`}>
                  {item.label}
                  {!item.included && <span className="ml-1.5 text-[9px] tracking-widest uppercase font-medium text-brand-primary">Pro</span>}
                </span>
              </div>
            ))}
          </div>
          {/* Upgrade CTA */}
          <div className="px-5 pb-5">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full py-3.5 rounded-xl bg-brand-primary text-white text-subheadline font-semibold tracking-wide transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isUpgrading ? 'Redirecting...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      )}

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 rounded-xl border border-brand-border text-subheadline tracking-wide text-brand-text-secondary hover:border-red-400 hover:text-red-500 transition-all active:scale-[0.98]"
      >
        Sign Out
      </button>

      {/* Theme Picker Modal */}
      {showThemePicker && (
        <ThemePicker
          currentTheme={user?.wallTheme || 'starry'}
          onClose={() => setShowThemePicker(false)}
        />
      )}

      {/* Edit Name Modal */}
      {showNameEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full animate-fade-in border border-brand-border">
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted text-center mb-1">Profile</p>
            <h3 className="text-title-3 text-brand-text-primary text-center tracking-tight mb-4">Display Name</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl text-body text-[#3A2E2A] placeholder:text-[#9A8880] focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border mb-4"
              placeholder="Your name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameEdit(false)}
                className="flex-1 py-3 rounded-xl border border-brand-border text-subheadline text-brand-text-primary hover:border-brand-primary transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNameMutation.mutate(newName)}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-subheadline disabled:opacity-40 transition-all active:scale-[0.98]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
