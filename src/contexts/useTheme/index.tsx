'use client'
import setGlobalColorTheme, { ThemeMode } from '@/theme/index.colors'
import { LocalStorage } from '@/utils/localstorage'
import { useTheme } from 'next-themes'
import React, { createContext, useContext, useEffect, useState } from 'react'

type ThemeColorStateParams = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

type ThemeProviderProps = {
  children: React.ReactNode
}

const ThemeContext = createContext<ThemeColorStateParams>(
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

    if (!isMounted) {
      setIsMounted(true)
    }
  }, [themeMode, theme, isMounted])

  if (!isMounted) {
    return null
  }

  return (
    <ThemeContext.Provider
      value={{ themeMode: (theme as ThemeMode) || themeMode, setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useCustomTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeDataProvider')
  }
  return context
}
