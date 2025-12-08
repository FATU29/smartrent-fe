import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Heart } from 'lucide-react'

export interface SavedListingsEmptyStateProps {
  onBrowseListings: () => void
}

/**
 * SavedListingsEmptyState
 * Displays empty state when user has no saved listings
 * Follows Atomic Design: Organism component
 */
export const SavedListingsEmptyState: React.FC<
  SavedListingsEmptyStateProps
> = ({ onBrowseListings }) => {
  const t = useTranslations('savedListings')

  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='text-center max-w-md mx-auto'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-muted p-6'>
            <Heart className='w-16 h-16 text-muted-foreground' />
          </div>
        </div>
        <Typography variant='h2' className='mb-4'>
          {t('empty.title')}
        </Typography>
        <Typography variant='p' className='mb-8 text-muted-foreground text-lg'>
          {t('empty.description')}
        </Typography>
        <Button onClick={onBrowseListings} size='lg'>
          {t('empty.action')}
        </Button>
      </div>
    </div>
  )
}

export default SavedListingsEmptyState
