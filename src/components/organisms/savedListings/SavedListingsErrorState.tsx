import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'

export interface SavedListingsErrorStateProps {
  error: Error
}

/**
 * SavedListingsErrorState
 * Error state display for saved listings page
 * Follows Atomic Design: Organism component
 */
export const SavedListingsErrorState: React.FC<
  SavedListingsErrorStateProps
> = () => {
  const tCommon = useTranslations('common')
  const router = useRouter()

  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='text-center max-w-md mx-auto'>
        <Typography variant='h3' className='mb-4 text-destructive'>
          {tCommon('error.title')}
        </Typography>
        <Typography variant='p' className='mb-6 text-muted-foreground'>
          {tCommon('error.description')}
        </Typography>
        <Button onClick={() => router.reload()}>
          {tCommon('actions.retry')}
        </Button>
      </div>
    </div>
  )
}

export default SavedListingsErrorState
