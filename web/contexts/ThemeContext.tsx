'use client'

import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type ThemeId = 'starry' | 'tree' | 'zen' | 'polaroid' | 'glass'

interface ThemeContextValue {
  currentTheme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  currentTheme: 'starry',
  setTheme: () => {},
})

function applyTheme(themeId: ThemeId) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const currentTheme = ((user?.wallTheme as ThemeId) || 'starry')

  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme])

  const setTheme = useCallback((themeId: ThemeId) => {
    queryClient.setQueryData(['user'], (old: unknown) => {
      if (old && typeof old === 'object') {
        return { ...(old as Record<string, unknown>), wallTheme: themeId }
      }
      return old
    })
    applyTheme(themeId)
  }, [queryClient])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
