import React from 'react'
import { Button } from '@/components/atoms/button'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Moon, Sun } from 'lucide-react'

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()
  const t = useTranslations('homePage.settings.theme')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <Button variant='outline' size='sm' onClick={toggleTheme} className='gap-2'>
      {theme === 'light' ? (
        <Moon className='h-4 w-4' />
      ) : (
        <Sun className='h-4 w-4' />
      )}
      {theme === 'light' ? t('dark') : t('light')}
    </Button>
  )
}

export default ThemeSwitch
