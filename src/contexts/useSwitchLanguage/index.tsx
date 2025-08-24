import { useLanguage } from '@/hooks/useLanguage'
import { Locale } from '@/types'
import React, { createContext, ReactNode, useContext } from 'react'

type SwitchLanguageProps = {
  children: ReactNode
}

type SwitchLanguageType = {
  language: Locale
  updateLanguage: (locale: Locale) => void
  switchTranslation: () => void
}

const SwitchLanguageContext = createContext<SwitchLanguageType | undefined>(
  undefined,
)
const SwitchLanguageProvider = ({ children }: SwitchLanguageProps) => {
  const { language, updateLanguage, switchLanguage } = useLanguage()

  const switchTranslation = () => {
    switchLanguage(language)
  }

  return (
    <SwitchLanguageContext.Provider
      value={{
        language: language as Locale,
        updateLanguage,
        switchTranslation,
      }}
    >
      {children}
    </SwitchLanguageContext.Provider>
  )
}

export default SwitchLanguageProvider

export const useSwitchLanguage = () => {
  const context = useContext(SwitchLanguageContext)
  if (!context) {
    throw new Error(
      'useSwitchLanguage must be used within a SwitchLanguageProvider',
    )
  }

  return context
}
