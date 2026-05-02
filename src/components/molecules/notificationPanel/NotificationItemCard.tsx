import React from 'react'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '@/api/types/notification.type'
import { NotificationIcon } from './NotificationIcon'
import { useTimeAgo } from './useTimeAgo'

interface NotificationItemCardProps {
  notification: NotificationItem
  onClick: (notification: NotificationItem) => void
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  notification,
  onClick,
}) => {
  const timeAgo = useTimeAgo(notification.createdAt)

  return (
    <button
      type='button'
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/50',
        !notification.isRead && 'bg-accent/30',
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div className='mt-0.5 shrink-0'>
        <NotificationIcon type={notification.type} size={20} />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <p
          className={cn(
            'text-sm leading-snug',
            !notification.isRead
              ? 'font-semibold text-foreground'
              : 'font-normal text-muted-foreground',
          )}
        >
          {notification.title}
        </p>
        <p className='mt-0.5 line-clamp-2 text-xs text-muted-foreground'>
          {notification.message}
        </p>
        <span className='mt-1 block text-2xs text-muted-foreground/70'>
          {timeAgo}
        </span>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className='mt-2 shrink-0'>
          <span className='block h-2 w-2 rounded-full bg-primary' />
        </div>
      )}
    </button>
  )
}
