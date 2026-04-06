import { FC } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface AiChatScrollButtonProps {
  onScrollToBottom: () => void
  className?: string
}

const AiChatScrollButton: FC<AiChatScrollButtonProps> = ({
  onScrollToBottom,
  className,
}) => {
  const t = useTranslations('aiChat')

  return (
    <button
      onClick={onScrollToBottom}
      className={cn(
        'absolute bottom-2 right-3 z-10',
        'flex h-8 w-8 items-center justify-center',
        'rounded-full border bg-background shadow-md',
        'text-muted-foreground hover:text-foreground',
        'transition-all duration-200 hover:shadow-lg hover:scale-105',
        'animate-in fade-in slide-in-from-bottom-2 duration-200',
        className,
      )}
      aria-label={t('scrollToBottom')}
    >
      <ChevronDown className='h-4 w-4' />
    </button>
  )
}

export default AiChatScrollButton
