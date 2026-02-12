import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { ModerationTimelineEvent } from '@/api/types/property.type'
import { cn } from '@/lib/utils'

interface ModerationTimelineProps {
  events: ModerationTimelineEvent[]
  className?: string
}

const ACTION_STYLES: Record<string, { color: string; dotColor: string }> = {
  REJECT: {
    color: 'text-red-700 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
  APPROVE: {
    color: 'text-green-700 dark:text-green-400',
    dotColor: 'bg-green-500',
  },
  REQUEST_REVISION: {
    color: 'text-orange-700 dark:text-orange-400',
    dotColor: 'bg-orange-500',
  },
  RESUBMIT: {
    color: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  SUBMIT: {
    color: 'text-yellow-700 dark:text-yellow-400',
    dotColor: 'bg-yellow-500',
  },
  SUSPEND: {
    color: 'text-gray-700 dark:text-gray-400',
    dotColor: 'bg-gray-500',
  },
}

const DEFAULT_STYLE = {
  color: 'text-muted-foreground',
  dotColor: 'bg-muted-foreground',
}

export const ModerationTimeline: React.FC<ModerationTimelineProps> = ({
  events,
  className,
}) => {
  const t = useTranslations('seller.moderation.timeline')

  if (!events || events.length === 0) return null

  return (
    <div className={cn('space-y-0', className)}>
      <Typography variant='p' className='font-semibold mb-3 text-sm'>
        {t('title')}
      </Typography>
      <div className='relative'>
        {events.map((event, index) => {
          const style = ACTION_STYLES[event.action] || DEFAULT_STYLE
          const isLast = index === events.length - 1
          const date = new Date(event.createdAt)
          const dateStr = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <div key={event.eventId} className='flex gap-3 relative'>
              {/* Line connector */}
              {!isLast && (
                <div className='absolute left-[7px] top-5 w-px h-[calc(100%-4px)] bg-border' />
              )}

              {/* Dot */}
              <div
                className={cn(
                  'w-[15px] h-[15px] rounded-full mt-1 shrink-0 ring-2 ring-background',
                  style.dotColor,
                )}
              />

              {/* Content */}
              <div className='pb-4 flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Typography
                    variant='small'
                    className={cn('font-semibold text-xs', style.color)}
                  >
                    {t(`actions.${event.action}`, {
                      defaultMessage: event.action,
                    })}
                  </Typography>
                  <Typography
                    variant='small'
                    className='text-xs text-muted-foreground'
                  >
                    {dateStr}
                  </Typography>
                </div>

                {event.reasonText && (
                  <Typography
                    variant='small'
                    className='text-xs text-muted-foreground mt-0.5 block'
                  >
                    {event.reasonText}
                  </Typography>
                )}

                {event.notes && (
                  <Typography
                    variant='small'
                    className='text-xs text-muted-foreground/70 mt-0.5 block italic'
                  >
                    {event.notes}
                  </Typography>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
