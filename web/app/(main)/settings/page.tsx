'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserProfile } from '@/types'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()

  const { data: user } = useQuery<UserProfile>({
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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/welcome' })
  }

  const displayName = user?.name || session?.user?.name || 'User'
  const email = user?.email || session?.user?.email || ''
  const initial = displayName[0]?.toUpperCase() || 'U'

  return (
    <div className="px-4 pt-6">
      <h1 className="text-title text-brand-text-primary mb-6">Settings</h1>

      {/* Profile Card */}
      <div className="bg-brand-card rounded-2xl shadow-card p-5 mb-4 border border-brand-border">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white text-title-2 shadow-md">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-headline text-brand-text-primary truncate">
                {displayName}
              </p>
              <button
                onClick={() => {
                  setNewName(displayName)
                  setShowNameEdit(true)
                }}
                className="text-caption text-brand-primary font-medium"
              >
                Edit
              </button>
            </div>
            <p className="text-subheadline text-brand-text-secondary truncate">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-brand-card rounded-2xl shadow-card overflow-hidden mb-4 border border-brand-border">
        <div className="px-5 py-4 border-b border-brand-border flex justify-between items-center">
          <span className="text-body text-brand-text-primary">Version</span>
          <span className="text-subheadline text-brand-text-secondary">
            1.0.0
          </span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-body text-brand-text-primary">Data Storage</span>
          <span className="text-subheadline text-brand-text-secondary">Cloud</span>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 rounded-2xl bg-brand-card shadow-card text-headline text-red-500 border border-brand-border transition-all active:scale-[0.98]"
      >
        Sign Out
      </button>

      {/* Edit Name Modal */}
      {showNameEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-brand-card rounded-2xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-fade-in border border-brand-border">
            <h3 className="text-title-3 text-brand-text-primary text-center mb-4">
              Edit Display Name
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-brand-surface rounded-xl text-body text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent border border-brand-border mb-4"
              placeholder="Your name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameEdit(false)}
                className="flex-1 py-3 rounded-xl border border-brand-border text-headline text-brand-text-primary transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNameMutation.mutate(newName)}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-headline disabled:opacity-50 transition-all active:scale-[0.98]"
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
