import React from 'react'
import { FilePlus2, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import { SELLER_ROUTES, SELLERNET_ROUTES } from '@/constants/route'
import { cn } from '@/lib/utils'

interface ListingEmptyStateProps {
  className?: string
  icon?: React.ReactNode
}

export const ListingEmptyState: React.FC<ListingEmptyStateProps> = ({
  className,
  icon,
}) => {
  const router = useRouter()
  const tRoot = useTranslations('seller')
  const t = (key: string) => tRoot(`listingManagement.${key}`)

  return (
    <div
      className={cn(
        // Single diagonal gradient creates the "interesting" feel without
        // stacking multiple decorative layers (which is what made the
        // original version feel cluttered).
        'relative mt-10 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-16 text-center',
        className,
      )}
    >
      {/* One soft radial accent at the top to pull the eye toward the icon. */}
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.18),transparent_70%)]'
        aria-hidden='true'
      />

      {/* Icon — solid primary surface so it actually reads as a focal point. */}
      <div className='relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25'>
        {icon || <FilePlus2 className='size-8' aria-hidden='true' />}
      </div>

      <Typography
        variant='h4'
        as='h2'
        className='relative mb-2 text-foreground'
      >
        {t('empty.title')}
      </Typography>

      <p className='relative mb-1 max-w-md text-sm text-muted-foreground'>
        {t('empty.description')}
      </p>
      <p className='relative mb-8 text-sm font-medium text-primary'>
        {t('empty.tagline')}
      </p>

      <div className='relative flex flex-col sm:flex-row gap-3'>
        <Button
          variant='outline'
          onClick={() => router.push(SELLERNET_ROUTES.MEMBERSHIP_REGISTER)}
          className='gap-2 bg-background/80 backdrop-blur-sm'
        >
          <ShoppingBag className='size-4' aria-hidden='true' />
          {t('empty.actions.buyPackage')}
        </Button>
        <Button
          onClick={() => router.push(SELLER_ROUTES.CREATE)}
          className='gap-2 shadow-md shadow-primary/20'
        >
          <Plus className='size-4' aria-hidden='true' />
          {t('empty.actions.create')}
        </Button>
      </div>
    </div>
  )
}
