'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProfile } from '@/types'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()
  const supabase = createClient()

  const { data: user } = useQuery<UserProfile & { isPro: boolean; hasStripeCustomer: boolean }>({
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
      if (url) window.location.href = url
    } catch { setIsUpgrading(false) }
  }

  const handleManageSubscription = async () => {
    setIsManaging(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch { setIsManaging(false) }
  }

  return (
    <div className="px-4 pt-6">
      <p className="text-[10px] tracking-[0.3em] uppercase text-brand-text-muted mb-1">Account</p>
      <h1 className="text-title text-brand-text-primary tracking-tight mb-6">Settings</h1>

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

      {/* Subscription Card */}
      <div className="rounded-2xl p-5 mb-4 border border-brand-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-headline text-brand-text-primary font-semibold">
                {user?.isPro ? 'Appreciate Pro' : 'Free Plan'}
              </p>
              {user?.isPro && (
                <span className="text-[9px] tracking-widest uppercase font-semibold bg-brand-primary text-white px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-caption text-brand-text-muted">
              {user?.isPro ? 'AI image generation & more' : 'Upgrade for AI features'}
            </p>
          </div>
          {user?.isPro ? (
            <button
              onClick={handleManageSubscription}
              disabled={isManaging}
              className="text-caption tracking-wide text-brand-text-muted border border-brand-border rounded-full px-3 py-1.5 hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-40"
            >
              {isManaging ? '...' : 'Manage'}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="text-caption tracking-wide text-white bg-brand-primary rounded-full px-3 py-1.5 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isUpgrading ? '...' : 'Upgrade'}
            </button>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-2xl overflow-hidden mb-4 border border-brand-border">
        <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center">
          <span className="text-body text-brand-text-primary">Version</span>
          <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">1.0.0</span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-body text-brand-text-primary">Data Storage</span>
          <span className="text-[10px] tracking-widest uppercase text-brand-text-muted">Cloud</span>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 rounded-full border border-brand-border text-subheadline tracking-wide text-brand-text-secondary hover:border-red-400 hover:text-red-500 transition-all active:scale-[0.98]"
      >
        Sign Out
      </button>

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
              className="w-full px-4 py-3 bg-white rounded-xl text-body text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary border border-brand-border mb-4"
              placeholder="Your name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameEdit(false)}
                className="flex-1 py-3 rounded-full border border-brand-border text-subheadline text-brand-text-primary hover:border-brand-primary transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNameMutation.mutate(newName)}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-full bg-brand-primary text-white text-subheadline disabled:opacity-40 transition-all active:scale-[0.98]"
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
