import { FC, useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog'
import {
  ResizablePanelGroup,
  ResizablePanel,
} from '@/components/atoms/resizable'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useChatLogic } from '@/hooks/useChatAi'
import { OPEN_AI_CHAT_WIDGET_EVENT } from '@/constants/events'

import AiChatHeader from '@/components/organisms/aiChatHeader'
import AiChatInterface from '@/components/organisms/aiChatInterface'
import AiChatButton from '@/components/atoms/aiChatButton'

type TAiChatWidgetProps = {
  className?: string
  position?: 'bottom-right' | 'bottom-left'
}

const AiChatWidget: FC<TAiChatWidgetProps> = ({
  className,
  position = 'bottom-right',
}) => {
  //Init state hook
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  //Init use hook
  const isMobile = useMediaQuery('(max-width: 768px)')
  const t = useTranslations('aiChat')
  const {
    messages,
    isLoading,
    isTyping,
    inputValue,
    scrollRef,
    bottomRef,
    isAtBottom,
    scrollToBottom,
    sendMessage,
    handleInputChange,
  } = useChatLogic()

  //Init event handle
  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  //Init effect hook
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleOpenAiChat = () => {
      setIsOpen(true)
    }

    window.addEventListener(OPEN_AI_CHAT_WIDGET_EVENT, handleOpenAiChat)

    return () => {
      window.removeEventListener(OPEN_AI_CHAT_WIDGET_EVENT, handleOpenAiChat)
    }
  }, [])

  // Prevent SSR mismatch
  if (!isMounted) {
    return null
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  }

  // Floating Action Button
  const FloatingButton = (
    <div className={cn('fixed z-50 group', positionClasses[position])}>
      {/* Tooltip */}
      {!isOpen && (
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
          {t('openChat')}
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground' />
        </div>
      )}

      <AiChatButton
        variant='default'
        size='icon'
        onClick={handleToggle}
        className={cn(
          'relative h-14 w-14 rounded-full shadow-2xl transition-all duration-300',
          'hover:scale-110 hover:shadow-xl active:scale-95',
          !isOpen &&
            'animate-bounce [animation-duration:2s] [animation-iteration-count:3]',
          className,
        )}
        aria-label={t('openChat')}
      >
        {/* Pulse ring - inside button so it bounces together */}
        {!isOpen && (
          <span className='absolute inset-0 rounded-full bg-primary/30 animate-ping' />
        )}
        <MessageCircle
          className={cn(
            'h-6 w-6 transition-transform duration-300 relative z-10',
            isOpen ? 'rotate-0' : 'group-hover:rotate-12',
          )}
        />
      </AiChatButton>
    </div>
  )

  // Mobile: Full-screen Dialog
  if (isMobile) {
    return (
      <>
        {FloatingButton}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className='h-[100dvh] max-h-[100dvh] w-full max-w-full border-0 p-0 rounded-none'
            aria-describedby='chat-interface-mobile'
            showCloseButton={false}
          >
            <DialogTitle className='sr-only'>{t('title')}</DialogTitle>
            <div className='flex h-full w-full flex-col overflow-hidden bg-background'>
              <AiChatHeader onClose={handleClose} className='flex-shrink-0' />

              <AiChatInterface
                messages={messages}
                inputValue={inputValue}
                isLoading={isLoading}
                isTyping={isTyping}
                scrollRef={scrollRef}
                bottomRef={bottomRef}
                isAtBottom={isAtBottom}
                onScrollToBottom={scrollToBottom}
                onInputChange={handleInputChange}
                onSendMessage={sendMessage}
                isMobile
                className='flex-1 min-h-0'
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop: Resizable Floating Window
  return (
    <>
      {FloatingButton}

      {/* Floating Resizable Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 animate-in fade-in slide-in-from-bottom-8 duration-300',
            'resize overflow-auto',
            position === 'bottom-right'
              ? 'bottom-24 right-6'
              : 'bottom-24 left-6',
          )}
          style={{
            width: '450px',
            height: '600px',
            minWidth: '350px',
            minHeight: '450px',
            maxWidth: '90vw',
            maxHeight: '85vh',
          }}
        >
          <ResizablePanelGroup
            direction='vertical'
            className='h-full w-full rounded-2xl border-2 border-primary/20 shadow-2xl bg-background hover:border-primary/40 transition-colors overflow-hidden'
          >
            <ResizablePanel defaultSize={100} minSize={50} maxSize={100}>
              <div className='flex h-full w-full flex-col overflow-hidden bg-background rounded-2xl'>
                <AiChatHeader
                  onClose={handleClose}
                  className='flex-shrink-0 rounded-t-2xl'
                />

                <AiChatInterface
                  messages={messages}
                  inputValue={inputValue}
                  isLoading={isLoading}
                  isTyping={isTyping}
                  scrollRef={scrollRef}
                  bottomRef={bottomRef}
                  isAtBottom={isAtBottom}
                  onScrollToBottom={scrollToBottom}
                  onInputChange={handleInputChange}
                  onSendMessage={sendMessage}
                  isMobile={false}
                  className='flex-1 min-h-0'
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </>
  )
}

export default AiChatWidget
