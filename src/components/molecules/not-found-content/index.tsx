import React from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { NotFoundIcon } from '@/components/atoms/not-found-icon'
import { cn } from '@/lib/utils'
import { Home, ArrowLeft } from 'lucide-react'

interface NotFoundContentProps {
  className?: string
  title?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
}

export const NotFoundContent: React.FC<NotFoundContentProps> = ({
  className,
  title,
  description,
  showBackButton = true,
  showHomeButton = true,
}) => {
  const router = useRouter()
  const t = useTranslations('notFound')

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 text-center',
        className,
      )}
    >
      {/* Icon */}
      <NotFoundIcon
        size={200}
        className='animate-in fade-in zoom-in duration-500'
      />

      {/* Text Content */}
      <div className='flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100'>
        <Typography
          variant='h1'
          className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'
        >
          {title || t('title')}
        </Typography>

        <Typography
          variant='muted'
          className='text-base md:text-lg max-w-md mx-auto'
        >
          {description || t('description')}
        </Typography>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200'>
        {showBackButton && (
          <Button
            variant='outline'
            size='lg'
            onClick={handleGoBack}
            className='gap-2'
          >
            <ArrowLeft className='size-4' />
            {t('goBack')}
          </Button>
        )}

        {showHomeButton && (
          <Button
            variant='default'
            size='lg'
            onClick={handleGoHome}
            className='gap-2'
          >
            <Home className='size-4' />
            {t('goHome')}
          </Button>
        )}
      </div>
    </div>
  )
}
