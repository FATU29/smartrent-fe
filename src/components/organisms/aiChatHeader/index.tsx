import { FC } from 'react'
import { X, Bot, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import AiChatButton from '@/components/atoms/aiChatButton'

type TAiChatHeaderProps = {
  onClose?: () => void
  onClear?: () => void
  showClear?: boolean
  className?: string
}

const AiChatHeader: FC<TAiChatHeaderProps> = ({
  onClose,
  onClear,
  showClear = true,
  className,
}) => {
  const t = useTranslations('aiChat')

  return (
    <div
      className={cn(
        'flex items-center justify-between border-b bg-primary px-3 py-2.5 text-primary-foreground shadow-sm md:px-4 md:py-3',
        className,
      )}
    >
      <div className='flex items-center gap-2 md:gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 md:h-10 md:w-10'>
          <Bot className='h-4 w-4 md:h-5 md:w-5' />
        </div>

        <div className='flex flex-col'>
          <h2 className='text-sm font-semibold leading-tight'>{t('title')}</h2>
          <p className='text-xs opacity-90 leading-tight'>{t('subtitle')}</p>
        </div>
      </div>

      <div className='flex items-center gap-0.5 md:gap-1'>
        {showClear && onClear && (
          <AiChatButton
            variant='ghost'
            size='icon'
            onClick={onClear}
            className='h-8 w-8 text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary-foreground/10'
            aria-label={t('clearHistory')}
          >
            <Trash2 className='h-4 w-4' />
          </AiChatButton>
        )}

        {onClose && (
          <AiChatButton
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='h-8 w-8 text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary-foreground/10'
            aria-label={t('close')}
          >
            <X className='h-4.5 w-4.5 md:h-5 md:w-5' />
          </AiChatButton>
        )}
      </div>
    </div>
  )
}

export default AiChatHeader
