import { Button } from '@/components/atoms/button'
import LanguageSwitch from '@/components/molecules/languageSwitch'
import ThemeSwitch from '@/components/molecules/themeSwitch'

import { useEffect, useState } from 'react'
import { useDialog } from '@/hooks/useDialog'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'

const AuthDialog = dynamic(() => import('@/components/organisms/authDialog'), {
  ssr: false,
  loading: () => null,
})

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { open, handleOpen, handleClose } = useDialog()
  const t = useTranslations('homePage.buttons')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <AuthDialog
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
      />
      <div className='min-h-screen p-4'>
        <div className='flex justify-between items-center mb-8'>
          <div className='flex gap-2'>
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>
        <div className='flex justify-center items-center h-[calc(100vh-8rem)]'>
          <Button onClick={() => handleOpen()}>{t('openAuth')}</Button>
        </div>
      </div>
    </>
  )
}
