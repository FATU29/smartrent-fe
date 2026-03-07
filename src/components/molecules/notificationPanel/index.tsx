import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Bell, BellDot, CheckCheck, Inbox, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { ScrollArea } from '@/components/atoms/scroll-area'
import { Separator } from '@/components/atoms/separator'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationItem } from '@/api/types/notification.type'
import { NotificationItemCard } from './NotificationItemCard'

const NotificationPanel: React.FC = () => {
  const t = useTranslations('notification')
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

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

  // Close on click outside (desktop only — mobile is full-screen overlay)
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(max-width: 639px)')
    if (mq.matches) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      if (!notification.isRead) {
        markAsRead(notification.id)
      }
    },
    [markAsRead],
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
          <Badge variant='secondary' className='text-[10px]'>
            {unreadCount} {t('unread')}
          </Badge>
        )}
      </div>
      {unreadCount > 0 && (
        <Button
          variant='ghost'
          size='sm'
          className='h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground'
          onClick={handleMarkAllRead}
        >
          <CheckCheck className='mr-1 h-3.5 w-3.5' />
          {t('markAllRead')}
        </Button>
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

  return (
    <div ref={panelRef} className='relative'>
      {/* Bell trigger */}
      <Button
        variant='ghost'
        size='icon'
        className='relative h-9 w-9'
        aria-label={t('title')}
        onClick={() => setOpen((prev) => !prev)}
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className='h-5 w-5' />
            <Badge
              variant='destructive'
              className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </>
        ) : (
          <Bell className='h-5 w-5' />
        )}
      </Button>

      {/* ── Mobile: full-screen overlay (< sm) ── */}
      {open && (
        <div className='sm:hidden fixed inset-0 z-[60] flex flex-col bg-background'>
          {/* Mobile header with back button */}
          <div className='flex items-center gap-2 border-b px-4 py-3'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={() => setOpen(false)}
              aria-label='Close'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div className='flex flex-1 items-center justify-between'>
              {headerContent}
            </div>
          </div>

          {/* Mobile scrollable list — fills remaining space */}
          <ScrollArea className='flex-1 overflow-hidden'>
            {listContent}
          </ScrollArea>
        </div>
      )}

      {/* ── Desktop: dropdown anchored under bell (≥ sm) ── */}
      {open && (
        <div className='hidden sm:block absolute right-0 top-full mt-2 z-50 w-[380px] rounded-xl border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'>
          {/* Header */}
          <div className='flex items-center justify-between px-4 py-2.5'>
            {headerContent}
          </div>

          <Separator />

          {/* Notification list */}
          <ScrollArea className='h-[350px] overflow-hidden'>
            {listContent}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default NotificationPanel
