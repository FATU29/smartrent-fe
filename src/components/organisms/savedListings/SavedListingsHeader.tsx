import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { ArrowLeft } from 'lucide-react'

export interface SavedListingsHeaderProps {
  totalElements: number
  onBack: () => void
}

/**
 * SavedListingsHeader
 * Header section with title, subtitle, and back button
 * Follows Atomic Design: Organism component
 */
export const SavedListingsHeader: React.FC<SavedListingsHeaderProps> = ({
  totalElements,
  onBack,
}) => {
  const t = useTranslations('savedListings')
  const tCommon = useTranslations('common')

  return (
    <div className='mb-8'>
      <Button variant='ghost' onClick={onBack} className='mb-4 -ml-2'>
        <ArrowLeft className='mr-2' />
        {tCommon('actions.back')}
      </Button>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <Typography variant='h1' className='mb-2'>
            {t('title')}
          </Typography>
          <Typography variant='p' className='text-muted-foreground'>
            {totalElements === 0
              ? t('count.zero')
              : totalElements === 1
                ? t('count.one')
                : t('count.other', { count: totalElements })}
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default SavedListingsHeader
