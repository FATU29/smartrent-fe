import { FC, RefObject, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'
import type { TStreamingStatus } from '@/hooks/useChatAi/useChatLogic'
import { getToolLabel } from '@/utils/ai'

import AiChatBubble from '@/components/molecules/aiChatBubble'
import AiChatInput from '@/components/molecules/aiChatInput'
import AiChatTypingIndicator from '@/components/atoms/aiChatTypingIndicator'
import AiChatScrollButton from '@/components/atoms/aiChatScrollButton'

type TAiChatInterfaceProps = {
  messages: TChatMessage[]
  inputValue: string
  isLoading: boolean
  isTyping: boolean
  streamingStatus?: TStreamingStatus
  scrollRef: RefObject<HTMLDivElement | null>
  bottomRef: RefObject<HTMLDivElement | null>
  isAtBottom: boolean
  onScrollToBottom: () => void
  onInputChange: (value: string) => void
  onSendMessage: (value: string) => void
  onViewListingDetail?: (listingId: number) => void
  isMobile?: boolean
  className?: string
}

const AiChatInterface: FC<TAiChatInterfaceProps> = ({
  messages,
  inputValue,
  isLoading,
  isTyping,
  streamingStatus,
  scrollRef,
  bottomRef,
  isAtBottom,
  onScrollToBottom,
  onInputChange,
  onSendMessage,
  onViewListingDetail,
  isMobile = false,
  className,
}) => {
  const t = useTranslations('aiChat')
  const locale = useLocale() as 'vi' | 'en'

  const statusLabel =
    streamingStatus?.phase === 'tool_call' && streamingStatus.tool
      ? getToolLabel(streamingStatus.tool, locale)
      : undefined

  // Track initial message count at mount to avoid animating restored messages
  const initialCountRef = useRef(messages.length)

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden',
        isMobile ? 'relative' : '',
        className,
      )}
    >
      {/* Messages area */}
      <div className='relative flex-1 min-h-0'>
        <div
          ref={scrollRef}
          className={cn(
            'h-full overflow-y-auto overflow-x-hidden',
            'scroll-smooth scrollbar-thin scrollbar-thumb-rounded-full',
            'scrollbar-track-transparent scrollbar-thumb-gray-300',
            isMobile ? 'pb-2' : '',
          )}
          role='log'
          aria-live='polite'
          aria-label={t('chatMessages')}
        >
          <div className='flex min-h-full flex-col justify-end'>
            <div
              className={cn('flex flex-col py-2', isMobile ? 'gap-1' : 'gap-2')}
            >
              {messages.map((message, index) => {
                // Only animate messages added after mount (not session-restored)
                const isNew = index >= initialCountRef.current - 1
                return (
                  <div
                    key={message.id}
                    data-message-id={message.id}
                    className={
                      isNew
                        ? 'animate-in fade-in slide-in-from-bottom-4 duration-300'
                        : undefined
                    }
                    style={
                      isNew
                        ? {
                            animationDelay: `${(index - initialCountRef.current + 1) * 50}ms`,
                            animationFillMode: 'backwards',
                          }
                        : undefined
                    }
                  >
                    <AiChatBubble
                      message={message}
                      onViewListingDetail={onViewListingDetail}
                    />
                  </div>
                )
              })}

              {isTyping && (
                <div className='animate-in fade-in slide-in-from-bottom-2 duration-200'>
                  <AiChatTypingIndicator statusLabel={statusLabel} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom sentinel for IntersectionObserver */}
          <div ref={bottomRef} className='h-px' />
        </div>

        {/* Scroll-to-bottom button */}
        {!isAtBottom && (
          <AiChatScrollButton onScrollToBottom={onScrollToBottom} />
        )}
      </div>

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
