import React from 'react'
import { useTranslations } from 'next-intl'
import { Locale } from '@/types'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/atoms/select'
import { useSwitchLanguage } from '@/contexts/switchLanguage/index.context'

type LanguageOption = {
  code: Locale
  flagSrc: string
  name: string
}

const LanguageSwitch = () => {
  const { language, updateLanguage } = useSwitchLanguage()
  const t = useTranslations('homePage.settings.language')

  const languages: LanguageOption[] = [
    {
      code: 'vi',
      flagSrc: '/images/flags/vn.svg',
      name: t('vietnamese'),
    },
    {
      code: 'en',
      flagSrc: '/images/flags/us.svg',
      name: t('english'),
    },
  ]

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0]

  const isLanguageCode = (value: string): value is Locale => {
    return languages.some((lang) => lang.code === value)
  }

  const handleLanguageChange = (value: string) => {
    if (!isLanguageCode(value)) return
    updateLanguage(value)
  }

  const renderFlagIcon = (flagSrc: string, name: string) => {
    return (
      <Image
        src={flagSrc}
        alt={name}
        width={24}
        height={18}
        className='block h-[18px] w-6 shrink-0 rounded-[3px] border border-border/60 object-cover'
      />
    )
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className='w-auto min-w-[128px] gap-2 px-2.5'>
        {renderFlagIcon(currentLanguage.flagSrc, currentLanguage.name)}
        <span className='truncate text-sm'>{currentLanguage.name}</span>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className='flex items-center gap-2'>
              {renderFlagIcon(lang.flagSrc, lang.name)}
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitch
