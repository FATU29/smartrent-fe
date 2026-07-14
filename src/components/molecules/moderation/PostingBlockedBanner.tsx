import React from 'react'
import { useTranslations } from 'next-intl'
import { Ban } from 'lucide-react'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'

interface PostingBlockedBannerProps {
  reason?: string | null
  className?: string
}

export const PostingBlockedBanner: React.FC<PostingBlockedBannerProps> = ({
  reason,
  className,
}) => {
  const t = useTranslations('seller.listingManagement.postingBlockedBanner')

  return (
    <div
      className={cn(
        'rounded-lg border p-4 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
        className,
      )}
    >
      <div className='flex items-start gap-3'>
        <Ban className='w-5 h-5 mt-0.5 shrink-0 text-red-600 dark:text-red-400' />
        <div className='flex-1 min-w-0'>
          <Typography
            variant='p'
            className='font-semibold mb-1 text-red-800 dark:text-red-300'
          >
            {t('title')}
          </Typography>
          <Typography
            variant='small'
            className='block text-red-700 dark:text-red-400'
          >
            {t('message')}
          </Typography>
          {reason && (
            <div className='mt-2 rounded-lg border border-red-200 bg-white/70 p-2.5 dark:border-red-900/50 dark:bg-black/20'>
              <Typography
                variant='small'
                className='block text-xs font-semibold mb-0.5 text-red-700 dark:text-red-400'
              >
                {t('reasonLabel')}
              </Typography>
              <Typography variant='small' className='block text-foreground/80'>
                {reason}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
