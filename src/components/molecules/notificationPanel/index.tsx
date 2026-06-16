import React, { useState, useCallback, useEffect } from 'react'
import { Bell, BellDot, CheckCheck, Inbox, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { ScrollArea } from '@/components/atoms/scroll-area'
import { Separator } from '@/components/atoms/separator'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationItem } from '@/api/types/notification.type'
import { NotificationItemCard } from './NotificationItemCard'
import { buildApartmentDetailRoute } from '@/constants/route'

const MY_LISTINGS_PATH = '/seller/listings'

const NotificationPanel: React.FC = () => {
  const t = useTranslations('notification')
  const router = useRouter()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications()

  // Mobile uses a full-screen overlay — close with Escape and lock body scroll.
  // Desktop uses Popover, which handles both natively.
  useEffect(() => {
    if (!open || !isMobile) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, isMobile])

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      if (!notification.isRead) {
        markAsRead(notification.id)
      }
      // Aggregate summary from the daily expiring-listing scheduler routes the
      // user to their listings page so they can review/renew. It carries no
      // specific listing id (referenceId is null on the backend).
      if (
        notification.type === 'LISTING_EXPIRING' &&
        notification.referenceType === 'LISTING_DAILY_SUMMARY'
      ) {
        setOpen(false)
        router.push(MY_LISTINGS_PATH)
        return
      }
      // Listing-scoped notifications (new post approved, rejected, revision
      // required, etc.) carry the listing id in referenceId — navigate to the
      // public detail page via next/router so the SPA transition is preserved.
      if (
        notification.referenceType === 'LISTING' &&
        notification.referenceId
      ) {
        setOpen(false)
        router.push(buildApartmentDetailRoute(String(notification.referenceId)))
      }
    },
    [markAsRead, router],
  )

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  /* ── Shared content (used in both mobile & desktop views) ── */
  const headerContent = (
    <>
      <div className='flex items-center gap-2'>
        <h3 className='text-base font-semibold sm:text-sm'>{t('title')}</h3>
        {unreadCount > 0 && (
          <Badge variant='secondary' className='text-2xs'>
            {unreadCount} {t('unread')}
          </Badge>
        )}
      </div>
      {unreadCount > 0 && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
                onClick={handleMarkAllRead}
                aria-label={t('markAllRead')}
              >
                <CheckCheck className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>{t('markAllRead')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )

  const listContent = (
    <>
      {isLoading ? (
        <div className='space-y-1 p-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex gap-3 px-3 py-2.5'>
              <Skeleton className='h-5 w-5 shrink-0 rounded-full' />
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-3.5 w-3/4' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-2.5 w-16' />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-10'>
          <Inbox className='h-9 w-9 text-muted-foreground/40' />
          <p className='mt-2 text-sm font-medium text-muted-foreground'>
            {t('empty')}
          </p>
          <p className='mt-1 text-xs text-muted-foreground/70'>
            {t('emptyDescription')}
          </p>
        </div>
      ) : (
        <div className='p-1'>
          {notifications.map((notification: NotificationItem) => (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}

          {/* Load more */}
          {hasNextPage && (
            <div className='px-3 py-2 text-center'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full text-xs text-muted-foreground'
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Skeleton className='h-3 w-20' />
                ) : (
                  t('viewAll')
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  )

  const bellContent =
    unreadCount > 0 ? (
      <>
        <BellDot className='h-5 w-5' />
        <Badge
          variant='destructive'
          className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-2xs font-bold'
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      </>
    ) : (
      <Bell className='h-5 w-5' />
    )

  // Mobile: full-screen overlay (the bell is a plain button; overlay is fixed
  // to the viewport so it escapes any parent stacking context on its own).
  if (isMobile) {
    return (
      <>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-9 w-9 focus:bg-transparent focus-visible:bg-transparent'
          aria-label={t('title')}
          onClick={(e) => {
            // Drop focus so the ghost hover-look doesn't stick after a tap on
            // touch devices that emulate :hover until the next interaction.
            e.currentTarget.blur()
            setOpen((prev) => !prev)
          }}
        >
          {bellContent}
        </Button>

        {open && (
          <div className='fixed inset-0 z-[60] flex flex-col bg-background'>
            <div className='flex items-center gap-2 border-b px-4 py-3'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={() => setOpen(false)}
                aria-label={t('close')}
              >
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <div className='flex flex-1 items-center justify-between'>
                {headerContent}
              </div>
            </div>

            <ScrollArea className='flex-1 overflow-hidden'>
              {listContent}
            </ScrollArea>
          </div>
        )}
      </>
    )
  }

  // Desktop: Popover renders content into a portal at document.body, so the
  // dropdown is not bounded by the sticky header's stacking context.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          // Suppress the ghost hover/focus background while the popover is open
          // so the trigger doesn't look "active" after click — the popover itself
          // is the visible affordance. Hover only kicks in via real mouse move.
          className='relative h-9 w-9 focus:bg-transparent focus-visible:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent'
          aria-label={t('title')}
        >
          {bellContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-[380px] rounded-xl p-0'
      >
        <div className='flex items-center justify-between px-4 py-2.5'>
          {headerContent}
        </div>
        <Separator />
        <ScrollArea className='h-[350px] overflow-hidden'>
          {listContent}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationPanel
