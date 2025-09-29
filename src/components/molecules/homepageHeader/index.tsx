import { Typography } from '@/components/atoms/typography'
import { useTranslations } from 'next-intl'
import React from 'react'

export interface HomepageHeaderProps {
  badgeText?: string
  showBadge?: boolean
  className?: string
}

/**
 * HomepageHeader - extracted from HomepageTemplate for reuse & clarity.
 * Provides the localized hero title block for the homepage.
 */
const HomepageHeader: React.FC<HomepageHeaderProps> = ({
  badgeText = '🏠 SmartRent Properties',
  showBadge = true,
  className,
}) => {
  const t = useTranslations()

  return (
    <div className={className ? className : 'text-center mb-6 sm:mb-8'}>
      {showBadge && (
        <div className='inline-flex items-center gap-2 mb-3 sm:mb-4'>
          <div className='text-xs sm:text-sm font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full'>
            {badgeText}
          </div>
        </div>
      )}
      <Typography
        variant='h1'
        className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3'
      >
        🏘️ {t('homePage.title')}
      </Typography>
      <Typography
        variant='lead'
        className='text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-2'
      >
        {t('homePage.subtitle')}
      </Typography>
      <Typography
        variant='small'
        className='text-xs sm:text-sm text-primary font-medium'
      >
        {t('homePage.instruction')}
      </Typography>
      <div className='mt-2 sm:mt-3'>
        <Typography
          variant='small'
          className='text-xs sm:text-sm text-muted-foreground'
        >
          {t('homePage.description')} • {t('homePage.propertiesAvailable')}
        </Typography>
      </div>
    </div>
  )
}

export default HomepageHeader
