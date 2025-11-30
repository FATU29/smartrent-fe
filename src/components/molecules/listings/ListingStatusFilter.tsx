import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { PostStatus, POST_STATUS } from '@/api/types'

const STATUS_ORDER: PostStatus[] = [
  POST_STATUS.ALL,
  POST_STATUS.EXPIRED,
  POST_STATUS.EXPIRED_SOON,
  POST_STATUS.DISPLAYING,
  POST_STATUS.PENDING_PAYMENT,
  POST_STATUS.REJECTED,
  POST_STATUS.VERIFIED,
  POST_STATUS.IN_REVIEW,
]

export interface ListingStatusFilterProps {
  value: PostStatus
  counts?: Partial<Record<PostStatus, number>>
  onChange: (status: PostStatus) => void
  className?: string
}

export const ListingStatusFilter: React.FC<ListingStatusFilterProps> = ({
  value,
  counts = {},
  onChange,
  className,
}) => {
  const t = useTranslations('seller.listingManagement')
  return (
    <div className='flex flex-col gap-2'>
      <div
        className={cn(
          'inline-flex w-full flex-wrap gap-1 rounded-lg bg-muted/50 p-1 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40',
          className,
        )}
        role='tablist'
        aria-label='listing-status-filter'
      >
        {STATUS_ORDER.map((status) => {
          const active = value === status
          const count = counts[status] ?? 0
          return (
            <button
              key={status}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => onChange(status)}
              className={cn(
                'group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-background shadow-sm text-foreground ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/70',
              )}
            >
              <span>{t(`status.${status}`)}</span>
              {((count ?? 0) > 0 || status === POST_STATUS.ALL) && (
                <span
                  className={cn(
                    'min-w-5 rounded-full border px-1 text-[10px] leading-none py-1 flex items-center justify-center',
                    active
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted border-border/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30',
                  )}
                >
                  {count}
                </span>
              )}
              {active && (
                <span className='pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30' />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
