import React from 'react'
import { useSwitchLanguage } from '@/contexts/useSwitchLanguage'
import { useTranslations } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/atoms/select'

const LanguageSwitch = () => {
  const { language, updateLanguage } = useSwitchLanguage()
  const t = useTranslations('homePage.settings.language')

  const languages = [
    { code: 'vi', flag: '🇻🇳', name: t('vietnamese') },
    { code: 'en', flag: '🇺🇸', name: t('english') },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  const handleLanguageChange = (value: string) => {
    updateLanguage(value as 'vi' | 'en')
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className='w-auto gap-2'>
        <span className='text-lg'>{currentLanguage?.flag}</span>
        {currentLanguage?.name}
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{lang.flag}</span>
              {lang.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitch
