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
      <h1 className="text-title text-brand-charcoal mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-ios-lg shadow-card p-ios-md mb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-title-2">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-headline text-brand-charcoal truncate">
                {displayName}
              </p>
              <button
                onClick={() => {
                  setNewName(displayName)
                  setShowNameEdit(true)
                }}
                className="text-caption text-brand-gold"
              >
                ✏️
              </button>
            </div>
            <p className="text-subheadline text-brand-medium-gray truncate">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-ios-lg shadow-card overflow-hidden mb-4">
        <div className="px-ios-md py-3 border-b border-brand-light-gray">
          <div className="flex justify-between items-center">
            <span className="text-body text-brand-charcoal">Version</span>
            <span className="text-body text-brand-medium-gray">
              1.0.0 (MVP)
            </span>
          </div>
        </div>
        <div className="px-ios-md py-3">
          <div className="flex justify-between items-center">
            <span className="text-body text-brand-charcoal">Data Storage</span>
            <span className="text-body text-brand-medium-gray">Cloud</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full py-3.5 rounded-ios-lg bg-white shadow-card text-headline text-red-500 transition-transform active:scale-[0.98]"
      >
        Sign Out
      </button>

      {/* Edit Name Modal */}
      {showNameEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-ios-xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-title-3 text-brand-charcoal text-center mb-4">
              Edit Display Name
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-brand-light-gray rounded-ios-md text-body text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-gold/50 mb-4"
              placeholder="Your name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameEdit(false)}
                className="flex-1 py-3 rounded-ios-md border border-brand-light-gray text-headline text-brand-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNameMutation.mutate(newName)}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-ios-md bg-gradient-primary text-white text-headline disabled:opacity-50"
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
