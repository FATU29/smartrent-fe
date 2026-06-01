import { FC } from 'react'
import { Bot, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'

type TAiChatTypingIndicatorProps = {
  className?: string
  statusLabel?: string
  /** Optional handler that cancels the in-flight request. When provided
   * a small × button is rendered to the right of the status text. */
  onStop?: () => void
}

const AiChatTypingIndicator: FC<TAiChatTypingIndicatorProps> = ({
  className,
  statusLabel,
  onStop,
}) => {
  const t = useTranslations('aiChat')

  return (
    <div
      className={cn(
        'flex w-full gap-2 px-3 py-1.5 md:gap-3 md:px-4 md:py-2',
        className,
      )}
      role='status'
      aria-live='polite'
      aria-label={statusLabel || t('typing')}
    >
      {/* Bot Avatar with pulse animation */}
      <Avatar className='h-8 w-8 flex-shrink-0 bg-primary animate-pulse mt-0.5'>
        <AvatarFallback className='bg-primary text-primary-foreground'>
          <Bot className='h-4 w-4' />
        </AvatarFallback>
      </Avatar>

      {/* Typing dots + optional status label + optional stop button */}
      <div className='flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 shadow-sm'>
        <div className='flex space-x-1'>
          <div
            className='h-2 w-2 animate-bounce rounded-full bg-primary'
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <div
            className='h-2 w-2 animate-bounce rounded-full bg-primary'
            style={{ animationDelay: '150ms', animationDuration: '1s' }}
          />
          <div
            className='h-2 w-2 animate-bounce rounded-full bg-primary'
            style={{ animationDelay: '300ms', animationDuration: '1s' }}
          />
        </div>
        {statusLabel && (
          <span className='text-xs text-muted-foreground'>{statusLabel}…</span>
        )}
        {onStop && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='ml-1 h-6 w-6 text-muted-foreground hover:text-foreground'
            onClick={onStop}
            aria-label={t('stop')}
            title={t('stop')}
          >
            <X className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>
    </div>
  )
}

export default AiChatTypingIndicator
