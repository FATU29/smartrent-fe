import React from 'react'
import { FilePlus2, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { SELLER_ROUTES, SELLERNET_ROUTES } from '@/constants/route'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
        'relative mt-10 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/60 p-12 text-center',
        'bg-gradient-to-b from-background via-background to-primary/5 dark:to-primary/10',
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_0%,theme(colors.primary/15),transparent_70%)] before:opacity-60',
        className,
      )}
    >
      <div className='absolute inset-0 pointer-events-none select-none [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] opacity-40'>
        <div className='absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl' />
      </div>
      <div className='relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 shadow-inner mb-8 backdrop-blur-sm'>
        {icon || (
          <FilePlus2 className='text-primary drop-shadow-sm' size={40} />
        )}
      </div>
      <h2 className='relative z-10 text-2xl font-semibold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
        {t('empty.title')}
      </h2>
      <p className='relative z-10 max-w-2xl text-sm md:text-base text-muted-foreground mb-4'>
        {t('empty.description')}
      </p>
      <p className='relative z-10 mb-8 text-xs md:text-sm font-medium text-primary/80 dark:text-primary/70'>
        {t('empty.tagline')}
      </p>
      <div className='relative z-10 flex flex-col sm:flex-row gap-3'>
        <Button
          variant='outline'
          onClick={() => router.push(SELLERNET_ROUTES.MEMBERSHIP_REGISTER)}
          className='gap-2'
        >
          <ShoppingBag size={16} />
          {t('empty.actions.buyPackage')}
        </Button>
        <Button
          onClick={() => router.push(SELLER_ROUTES.CREATE)}
          className='gap-2 shadow-md shadow-primary/20'
        >
          <Plus size={16} />
          {t('empty.actions.create')}
        </Button>
      </div>
    </div>
  )
}
