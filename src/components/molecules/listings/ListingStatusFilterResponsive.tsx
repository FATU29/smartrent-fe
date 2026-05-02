import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { POST_STATUS } from '@/api/types'
import {
  STATUS_FILTER_WITH_ALL,
  LISTING_STATUS_MODERATION_MAP,
  getFilterStatusI18nKey,
  getPostStatusI18nKey,
  isModerationFilterStatus,
  hasSubFilters,
  getModerationStatuses,
  toModerationFilterStatus,
  type ListingFilterStatus,
} from '@/constants/postStatus'
import type { PostStatus } from '@/api/types'

export interface ListingStatusFilterResponsiveProps {
  value: ListingFilterStatus
  counts?: Partial<Record<ListingFilterStatus, number>>
  onChange: (status: ListingFilterStatus) => void
  className?: string
  hideCount?: boolean
}

export const ListingStatusFilterResponsive: React.FC<
  ListingStatusFilterResponsiveProps
> = ({ value, counts = {}, onChange, className, hideCount = false }) => {
  const t = useTranslations('seller.listingManagement')

  // The main listing statuses (no moderation ones)
  const listingStatuses: PostStatus[] = STATUS_FILTER_WITH_ALL

  // Determine which main tab is active — map MOD_ values back to their parent status
  const activeMainStatus: PostStatus = isModerationFilterStatus(value)
    ? ((Object.entries(LISTING_STATUS_MODERATION_MAP).find(([, mods]) =>
        (mods as string[]).some(
          (m: string) => toModerationFilterStatus(m as any) === value,
        ),
      )?.[0] as PostStatus) ?? (value as PostStatus))
    : (value as PostStatus)

  // Check if the active main tab has sub-filters
  const activeHasSubFilters = hasSubFilters(activeMainStatus)
  const activeSubFilters = getModerationStatuses(activeMainStatus).map(
    toModerationFilterStatus,
  )

  // For mobile dropdown label
  const activeLabel =
    isModerationFilterStatus(value) && activeHasSubFilters
      ? `${t(`status.${getPostStatusI18nKey(activeMainStatus)}`)} › ${t(`status.${getFilterStatusI18nKey(value)}`)}`
      : t(`status.${getPostStatusI18nKey(activeMainStatus)}`)

  return (
    <div className='flex flex-col gap-2'>
      {/* ═══ DESKTOP: Primary tab bar ═══ */}
      <div
        className={cn(
          // `w-fit max-w-full` sizes the strip to its tabs but still wraps
          // gracefully when the viewport is too narrow. Avoids the giant
          // empty rail on wide screens.
          'hidden sm:inline-flex w-fit max-w-full flex-wrap gap-1 rounded-lg bg-muted/50 p-1 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40',
          className,
        )}
        role='tablist'
        aria-label='listing-status-filter'
      >
        {listingStatuses.map((status) => {
          const active = activeMainStatus === status
          const count = counts[status as ListingFilterStatus] ?? 0
          const showSubIndicator = active && hasSubFilters(status)

          return (
            <button
              key={status}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => onChange(status as ListingFilterStatus)}
              className={cn(
                'group relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && showSubIndicator
                  ? 'bg-orange-50 shadow-sm text-orange-700 ring-1 ring-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-700'
                  : active
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/70',
              )}
            >
              <span>{t(`status.${getPostStatusI18nKey(status)}`)}</span>
              {showSubIndicator && (
                <ChevronDown className='h-3 w-3 opacity-60' />
              )}
              {!hideCount &&
                ((count ?? 0) > 0 || status === POST_STATUS.ALL) && (
                  <span
                    className={cn(
                      'min-w-5 rounded-full border px-1 text-2xs leading-none py-1 flex items-center justify-center',
                      active && showSubIndicator
                        ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300'
                        : active
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-muted border-border/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30',
                    )}
                  >
                    {count}
                  </span>
                )}
              {active && (
                <span
                  className={cn(
                    'pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-gradient-to-r',
                    showSubIndicator
                      ? 'from-orange-300/30 via-orange-500 to-orange-300/30'
                      : 'from-primary/30 via-primary to-primary/30',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ═══ DESKTOP: Moderation sub-filters (visible when active tab has >1 moderation statuses) ═══ */}
      {activeHasSubFilters && (
        <div className='hidden sm:flex items-center gap-1.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200'>
          <ChevronRight className='h-3.5 w-3.5 text-orange-400 shrink-0' />
          <div className='flex flex-wrap gap-1'>
            {activeSubFilters.map((modStatus) => {
              const active = value === modStatus
              const count = counts[modStatus] ?? 0
              return (
                <button
                  key={modStatus}
                  type='button'
                  onClick={() => onChange(modStatus)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border',
                    active
                      ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-sm dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
                      : 'bg-background border-border/60 text-muted-foreground hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 dark:hover:text-orange-400',
                  )}
                >
                  <span>
                    {t(`status.${getFilterStatusI18nKey(modStatus)}`)}
                  </span>
                  {!hideCount && (count ?? 0) > 0 && (
                    <span
                      className={cn(
                        'min-w-4 rounded-full px-1 text-2xs leading-none py-0.5 flex items-center justify-center',
                        active
                          ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ MOBILE: Dropdown for main status ═══ */}
      <div className='sm:hidden'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-between h-11 px-4 rounded-lg border-border/60 hover:bg-muted/70',
                activeHasSubFilters
                  ? 'bg-orange-50/80 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
                  : 'bg-muted/50',
              )}
            >
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'text-sm font-medium',
                    activeHasSubFilters &&
                      'text-orange-700 dark:text-orange-300',
                  )}
                >
                  {activeLabel}
                </span>
              </div>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-full min-w-[--radix-dropdown-menu-trigger-width]'
            align='start'
          >
            {listingStatuses.map((status) => {
              const active = activeMainStatus === status
              const count = counts[status as ListingFilterStatus] ?? 0
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onChange(status as ListingFilterStatus)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 cursor-pointer',
                    active && 'bg-accent/50 text-accent-foreground font-medium',
                  )}
                >
                  <span>{t(`status.${getPostStatusI18nKey(status)}`)}</span>
                  {!hideCount &&
                    ((count ?? 0) > 0 || status === POST_STATUS.ALL) && (
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

      {/* ═══ MOBILE: Moderation sub-filters (horizontal scroll below dropdown) ═══ */}
      {activeHasSubFilters && (
        <div className='sm:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200'>
          <ChevronRight className='h-3.5 w-3.5 text-orange-400 shrink-0' />
          {activeSubFilters.map((modStatus) => {
            const active = value === modStatus
            const count = counts[modStatus] ?? 0
            return (
              <button
                key={modStatus}
                type='button'
                onClick={() => onChange(modStatus)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                  active
                    ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-sm dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
                    : 'bg-background border-border/60 text-muted-foreground hover:border-orange-300 hover:text-orange-600',
                )}
              >
                <span className='whitespace-nowrap'>
                  {t(`status.${getFilterStatusI18nKey(modStatus)}`)}
                </span>
                {!hideCount && (count ?? 0) > 0 && (
                  <span
                    className={cn(
                      'min-w-4 rounded-full px-1 text-2xs leading-none py-0.5 flex items-center justify-center',
                      active
                        ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
