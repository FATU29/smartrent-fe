import { FC, RefObject, useLayoutEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'
import type { TStreamingStatus } from '@/hooks/useChatAi/useChatLogic'
import { getToolLabel } from '@/utils/ai'

import AiChatBubble from '@/components/molecules/aiChatBubble'
import AiChatInput from '@/components/molecules/aiChatInput'
import AiChatTypingIndicator from '@/components/atoms/aiChatTypingIndicator'
import AiChatScrollButton from '@/components/atoms/aiChatScrollButton'
import AiChatListingDetailDialog from '@/components/molecules/aiChatListingDetailDialog'

type TAiChatInterfaceProps = {
  messages: TChatMessage[]
  inputValue: string
  isLoading: boolean
  isTyping: boolean
  streamingStatus?: TStreamingStatus
  scrollRef: RefObject<HTMLDivElement | null>
  bottomRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  reservedSpace: number
  isAtBottom: boolean
  onScrollToBottom: () => void
  onInputChange: (value: string) => void
  onSendMessage: (value: string) => void
  onViewListingDetail?: (listingId: number) => void
  /** Cancel the in-flight SSE stream — wired through to the typing
   * indicator's × button. */
  onStopStreaming?: () => void
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
  contentRef,
  reservedSpace,
  isAtBottom,
  onScrollToBottom,
  onInputChange,
  onSendMessage,
  onViewListingDetail,
  onStopStreaming,
  isMobile = false,
  className,
}) => {
  const t = useTranslations('aiChat')
  const locale = useLocale() as 'vi' | 'en'

  // Prefer the BE-generated localised summary (carries arg context like
  // "quận 765 phòng/căn hộ giá 5-10tr"); fall back to the static per-tool
  // label when the backend didn't send one.
  const statusLabel = (() => {
    if (streamingStatus?.phase !== 'tool_call' || !streamingStatus.tool) {
      return undefined
    }
    if (streamingStatus.summary) {
      return streamingStatus.summary
    }
    return getToolLabel(streamingStatus.tool, locale)
  })()

  // Track initial message count at mount to avoid animating restored messages
  const initialCountRef = useRef(messages.length)

  // Listing-detail dialog state — opened from detail-mode cards in the chat
  // so users can view the full listing without leaving the chat tab.
  const [fullDetailListingId, setFullDetailListingId] = useState<number | null>(
    null,
  )

  // On panel mount (e.g. user reopens the chat after a page refresh and
  // sessionStorage rehydrates prior messages), pin the scroll to the bottom
  // so the most recent turn is visible. Without this, the container starts
  // at scrollTop=0 and the user sees the oldest message instead.
  // rAF-after-rAF: first frame writes scrollTop synchronously before paint;
  // the second covers late layout (listing card images / async fonts) that
  // would otherwise grow the content after our initial scroll-to-bottom.
  useLayoutEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
    const id1 = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
      // Inner rAF intentional — runs after the next layout flush.
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    })
    return () => cancelAnimationFrame(id1)
  }, [scrollRef])

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
              ref={contentRef}
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
                      isLast={index === messages.length - 1}
                      onViewListingDetail={onViewListingDetail}
                      onOpenFullDetail={setFullDetailListingId}
                      onSuggestionClick={onSendMessage}
                    />
                  </div>
                )
              })}

              {isTyping && (
                <div className='animate-in fade-in slide-in-from-bottom-2 duration-200'>
                  <AiChatTypingIndicator
                    statusLabel={statusLabel}
                    onStop={onStopStreaming}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reserved space: lets the just-sent message anchor to the top of
              the viewport; shrinks to fit once the turn completes. */}
          <div aria-hidden style={{ height: reservedSpace }} />

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

      <AiChatListingDetailDialog
        listingId={fullDetailListingId}
        open={fullDetailListingId !== null}
        onOpenChange={(next) => {
          if (!next) setFullDetailListingId(null)
        }}
      />
    </div>
  )
}

export default AiChatInterface
