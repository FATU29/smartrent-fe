import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'

export type ListingStatus =
  | 'all'
  | 'expired'
  | 'expiring'
  | 'active'
  | 'pending'
  | 'review'
  | 'payment'
  | 'rejected'
  | 'archived'

const STATUS_ORDER: ListingStatus[] = [
  'all',
  'expired',
  'expiring',
  'active',
  'pending',
  'review',
  'payment',
  'rejected',
  'archived',
]

export interface ListingStatusFilterResponsiveProps {
  value: ListingStatus
  counts?: Partial<Record<ListingStatus, number>>
  onChange: (status: ListingStatus) => void
  className?: string
}

export const ListingStatusFilterResponsive: React.FC<
  ListingStatusFilterResponsiveProps
> = ({ value, counts = {}, onChange, className }) => {
  const t = useTranslations('seller.listingManagement')

  const activeStatus = STATUS_ORDER.find((status) => status === value) || 'all'
  const activeCount = counts[activeStatus] ?? 0

  return (
    <div className='flex flex-col gap-2'>
      <div
        className={cn(
          'hidden sm:inline-flex w-full flex-wrap gap-1 rounded-lg bg-muted/50 p-1 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40',
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
              {((count ?? 0) > 0 || status === 'all') && (
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

      <div className='sm:hidden'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='w-full justify-between h-11 px-4 rounded-lg bg-muted/50 border-border/60 hover:bg-muted/70'
            >
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>
                  {t(`status.${activeStatus}`)}
                </span>
                {activeCount > 0 && (
                  <span className='min-w-5 rounded-full bg-primary/10 border border-primary/30 text-primary px-1.5 py-0.5 text-xs leading-none flex items-center justify-center'>
                    {activeCount}
                  </span>
                )}
              </div>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-full min-w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {STATUS_ORDER.map((status) => {
              const active = value === status
              const count = counts[status] ?? 0
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onChange(status)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 cursor-pointer',
                    active && 'bg-accent/50 text-accent-foreground font-medium',
                  )}
                >
                  <span>{t(`status.${status}`)}</span>
                  {((count ?? 0) > 0 || status === 'all') && (
                    <span
                      className={cn(
                        'min-w-5 rounded-full border px-1.5 py-0.5 text-xs leading-none flex items-center justify-center',
                        active
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted border-border/50 text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
