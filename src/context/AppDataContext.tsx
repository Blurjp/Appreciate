import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from './AuthContext'
import type { AppState, BootstrapPayload, Draft, ReactionType, ReportStatus } from '../types'

type AppDataContextValue = {
  state: AppState | null
  isLoading: boolean
  refresh: () => Promise<void>
  createPost: (draft: Draft) => Promise<void>
  addReaction: (postId: number, type: ReactionType) => Promise<void>
  addReport: (postId: number, reason: string) => Promise<void>
  addComment: (postId: number, body: string) => Promise<void>
  claimPost: (postId: number) => Promise<void>
  createClaimInvite: (postId: number) => Promise<string>
  updateReportStatus: (reportId: number, status: ReportStatus) => Promise<void>
  markNotificationRead: (notificationId: number) => Promise<void>
  resetDemo: () => Promise<void>
  refreshAuditLogs: () => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined)

function applyBootstrap(setState: (state: AppState) => void, payload: BootstrapPayload) {
  setState(payload.state)
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [state, setState] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = async () => {
    if (!currentUser) {
      setState(null)
      return
    }
    setIsLoading(true)
    try {
      const payload = await apiClient.bootstrap()
      applyBootstrap(setState, payload)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [currentUser])

  const value = useMemo(
    () => ({
      state,
      isLoading,
      refresh,
      createPost: async (draft: Draft) => {
        const payload = await apiClient.createPost(draft)
        applyBootstrap(setState, payload)
      },
      addReaction: async (postId: number, type: ReactionType) => {
        const payload = await apiClient.addReaction(postId, type)
        applyBootstrap(setState, payload)
      },
      addReport: async (postId: number, reason: string) => {
        const payload = await apiClient.addReport(postId, reason)
        applyBootstrap(setState, payload)
      },
      addComment: async (postId: number, body: string) => {
        const payload = await apiClient.addComment(postId, body)
        applyBootstrap(setState, payload)
      },
      claimPost: async (postId: number) => {
        const payload = await apiClient.claimPost(postId)
        applyBootstrap(setState, payload)
      },
      createClaimInvite: async (postId: number) => {
        const payload = await apiClient.createClaimInvite(postId)
        return payload.inviteLink
      },
      updateReportStatus: async (reportId: number, status: ReportStatus) => {
        const payload = await apiClient.updateReportStatus(reportId, status)
        applyBootstrap(setState, payload)
      },
      markNotificationRead: async (notificationId: number) => {
        const payload = await apiClient.markNotificationRead(notificationId)
        applyBootstrap(setState, payload)
      },
      resetDemo: async () => {
        const payload = await apiClient.resetDemo()
        applyBootstrap(setState, payload)
      },
      refreshAuditLogs: async () => {
        const payload = await apiClient.getAuditLogs()
        setState((currentState) => (currentState ? { ...currentState, auditLogs: payload.auditLogs } : currentState))
      },
    }),
    [currentUser, isLoading, state],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used within AppDataProvider')
  return context
}
