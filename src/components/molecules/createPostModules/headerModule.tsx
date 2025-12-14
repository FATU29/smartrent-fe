import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'

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
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-2'>
            {title}
          </h1>
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
