import { useLanguage } from '@/hooks/useLanguage'
import { Locale } from '@/types'
import React, { createContext, ReactNode, useMemo } from 'react'

type SwitchLanguageProps = {
  children: ReactNode
}

type SwitchLanguageType = {
  language: Locale
  updateLanguage: (locale: Locale) => void
  switchTranslation: () => void
}

export const SwitchLanguageContext = createContext<
  SwitchLanguageType | undefined
>(undefined)

const SwitchLanguageProvider = ({ children }: SwitchLanguageProps) => {
  const { language, updateLanguage, switchLanguage } = useLanguage()

  const switchTranslation = () => {
    switchLanguage(language)
  }

  const contextValue = useMemo(
    () => ({
      language: language as Locale,
      updateLanguage,
      switchTranslation,
    }),
    [language, updateLanguage, switchTranslation],
  )

  return (
    <SwitchLanguageContext.Provider value={contextValue}>
      {children}
    </SwitchLanguageContext.Provider>
  )
}

export default SwitchLanguageProvider
