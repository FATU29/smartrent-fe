import React from 'react'
import { FileX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { useRouter } from 'next/router'
import { SELLER_ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

interface DraftEmptyStateProps {
  className?: string
}

export const DraftEmptyState: React.FC<DraftEmptyStateProps> = ({
  className,
}) => {
  const router = useRouter()
  const t = useTranslations('seller.drafts.emptyState')

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
        <FileX className='text-primary drop-shadow-sm' size={40} />
      </div>
      <Typography
        variant='h2'
        className='relative z-10 mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'
      >
        {t('title')}
      </Typography>
      <Typography
        variant='p'
        className='relative z-10 max-w-2xl mb-8 text-muted-foreground'
      >
        {t('description')}
      </Typography>
      <div className='relative z-10'>
        <Button
          onClick={() => router.push(SELLER_ROUTES.CREATE)}
          className='gap-2 shadow-md shadow-primary/20'
        >
          {t('createButton')}
        </Button>
      </div>
    </div>
  )
}
