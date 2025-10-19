'use client'
import setGlobalColorTheme, { ThemeMode } from '@/theme/index.colors'
import { LocalStorage } from '@/utils/localstorage'
import { useTheme } from 'next-themes'
import React, { createContext, useEffect, useState, useMemo } from 'react'

type ThemeColorStateParams = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

type ThemeProviderProps = {
  children: React.ReactNode
}

export const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams,
)

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
    if (typeof window !== 'undefined') {
      LocalStorage.set('themeMode', mode)
    }
  }

  // Initialize theme from LocalStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = LocalStorage.get('themeMode') as ThemeMode
      if (savedTheme) {
        setThemeModeState(savedTheme)
      }
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Use theme from next-themes if available, otherwise use our state
    const currentTheme = (theme as ThemeMode) || themeMode

    // Save theme mode to LocalStorage
    if (typeof window !== 'undefined') {
      LocalStorage.set('themeMode', currentTheme)
    }

    // Apply the global theme
    setGlobalColorTheme(currentTheme)
  }, [themeMode, theme]) // Removed isMounted from dependencies

  const contextValue = useMemo(
    () => ({
      themeMode: (theme as ThemeMode) || themeMode,
      setThemeMode,
    }),
    [theme, themeMode, setThemeMode],
  )

  if (!isMounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
