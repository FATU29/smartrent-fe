import { useEffect, useState } from 'react'
import { Locale } from '@/types'
import { LocalStorage } from '@/utils/localstorage'
import { locales } from '@/constants'

const useLanguage = () => {
  const [language, setLanguage] = useState<Locale>('vi')

  useEffect(() => {
    const storedLocale = LocalStorage.get('locale') as Locale
    if (storedLocale && locales.includes(storedLocale)) {
      setLanguage(storedLocale)
    }
  }, [])

  const updateLanguage = (locale: Locale) => {
    if (language === locale || !locales.includes(locale)) return
    setLanguage(locale)
    LocalStorage.set('locale', locale)
  }

  const resetLanguage = () => {
    setLanguage('vi')
    LocalStorage.set('locale', 'vi')
  }

  const switchLanguage = (currentLang: Locale) => {
    const next = currentLang === 'vi' ? 'en' : 'vi'
    setLanguage(next)
    LocalStorage.set('locale', next)
  }

  return {
    language,
    updateLanguage,
    resetLanguage,
    switchLanguage,
  }
}

export { useLanguage }
