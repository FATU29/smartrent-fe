import { FC, RefObject } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'
import { Progress } from '@/components/atoms/progress'

import AiChatBubble from '@/components/molecules/aiChatBubble'
import AiChatInput from '@/components/molecules/aiChatInput'
import AiChatTypingIndicator from '@/components/atoms/aiChatTypingIndicator'

type TAiChatInterfaceProps = {
  messages: TChatMessage[]
  inputValue: string
  isLoading: boolean
  isTyping: boolean
  progress: number
  scrollRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSendMessage: (value: string) => void
  isMobile?: boolean
  className?: string
}

const AiChatInterface: FC<TAiChatInterfaceProps> = ({
  messages,
  inputValue,
  isLoading,
  isTyping,
  progress,
  scrollRef,
  onInputChange,
  onSendMessage,
  isMobile = false,
  className,
}) => {
  const t = useTranslations('aiChat')

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden',
        isMobile ? 'relative' : '',
        className,
      )}
    >
      {/* Messages area */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'scroll-smooth scrollbar-thin scrollbar-thumb-rounded-full',
          'scrollbar-track-transparent scrollbar-thumb-gray-300',
          isMobile ? 'pb-2' : '',
        )}
        role='log'
        aria-live='polite'
        aria-label={t('chatMessages')}
      >
        <div className='flex min-h-full flex-col justify-end'>
          <div className='flex flex-col gap-1 py-2'>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className='animate-in fade-in slide-in-from-bottom-4 duration-300'
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <AiChatBubble message={message} />
              </div>
            ))}

            {isTyping && (
              <div className='animate-in fade-in slide-in-from-bottom-2 duration-200'>
                <AiChatTypingIndicator />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {isLoading && progress > 0 && (
        <div className='border-t bg-background px-4 py-2'>
          <Progress value={progress} className='h-1' />
        </div>
      )}

      {/* Input area - Fixed on mobile */}
      <div
        className={cn(
          'border-t bg-background',
          isMobile
            ? 'sticky bottom-0 left-0 right-0 z-10 safe-bottom'
            : 'flex-shrink-0',
        )}
      >
        <AiChatInput
          value={inputValue}
          onChange={onInputChange}
          onSubmit={onSendMessage}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

export default AiChatInterface
