import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Typography } from '@/components/atoms/typography'

interface HeaderModuleProps {
  className?: string
}

const HeaderModule: React.FC<HeaderModuleProps> = ({ className }) => {
  const router = useRouter()
  const isUpdateMode = router.pathname.includes('/update-post')

  const tCreate = useTranslations('createPost')
  const tUpdate = useTranslations('updatePost')

  const title = isUpdateMode ? tUpdate('title') : tCreate('title')
  const description = isUpdateMode
    ? tUpdate('description')
    : tCreate('description')

  return (
    <div className={`mb-6 sm:mb-8 ${className || ''}`}>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6'>
        <div className='flex-1'>
          <Typography variant='pageTitle' className='mb-2'>
            {title}
          </Typography>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export { HeaderModule }
export type { HeaderModuleProps }
