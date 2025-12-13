import { FC } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

type TAiChatTypingIndicatorProps = {
  className?: string
}

const AiChatTypingIndicator: FC<TAiChatTypingIndicatorProps> = ({
  className,
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
      aria-label={t('typing')}
    >
      <div className='h-8 w-8 flex-shrink-0 rounded-full bg-primary' />
      <div className='flex items-center rounded-2xl bg-muted px-4 py-3 shadow-sm'>
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
      </div>
    </div>
  )
}

export default AiChatTypingIndicator
