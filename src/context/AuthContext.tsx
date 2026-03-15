import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiClient } from '../api/client'
import { apiBaseEnv } from '../env'
import type { LoginPayload, User } from '../types'

type AuthContextValue = {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  signIn: (payload: LoginPayload) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  canResetDemo: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSession = async () => {
    setIsLoading(true)
    try {
      const payload = await apiClient.getSession()
      setCurrentUser(payload.currentUser)
      setError(null)
    } catch (sessionError) {
      setCurrentUser(null)
      setError(sessionError instanceof Error ? sessionError.message : 'Unable to load session')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refreshSession()
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      error,
      signIn: async (payload: LoginPayload) => {
        setIsLoading(true)
        try {
          const nextSession = await apiClient.login(payload)
          setCurrentUser(nextSession.currentUser)
          setError(null)
        } catch (loginError) {
          setCurrentUser(null)
          setError(loginError instanceof Error ? loginError.message : 'Unable to sign in')
          throw loginError
        } finally {
          setIsLoading(false)
        }
      },
      signOut: async () => {
        await apiClient.logout()
        setCurrentUser(null)
      },
      refreshSession,
      canResetDemo: apiBaseEnv !== 'production',
    }),
    [currentUser, error, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
