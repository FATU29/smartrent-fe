import { FC, useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/atoms/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useChatLogic } from '@/hooks/useChatAi'

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
    progress,
    inputValue,
    scrollRef,
    sendMessage,
    handleInputChange,
    clearMessages,
  } = useChatLogic()

  //Init event handle
  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleClear = () => {
    if (window.confirm(t('confirmClear'))) {
      clearMessages()
    }
  }

  //Init effect hook
  useEffect(() => {
    setIsMounted(true)
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
    <AiChatButton
      variant='default'
      size='icon'
      onClick={handleToggle}
      className={cn(
        'fixed z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300',
        'hover:scale-110 hover:shadow-xl active:scale-95',
        'animate-in fade-in zoom-in duration-500',
        positionClasses[position],
        className,
      )}
      aria-label={t('openChat')}
    >
      <MessageCircle className='h-6 w-6 transition-transform duration-300 group-hover:rotate-12' />
    </AiChatButton>
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
            <div className='flex h-full w-full flex-col overflow-hidden bg-background'>
              <AiChatHeader
                onClose={handleClose}
                onClear={handleClear}
                showClear
                className='flex-shrink-0'
              />

              <AiChatInterface
                messages={messages}
                inputValue={inputValue}
                isLoading={isLoading}
                isTyping={isTyping}
                progress={progress}
                scrollRef={scrollRef}
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

  // Desktop: Popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{FloatingButton}</PopoverTrigger>

      <PopoverContent
        side='top'
        align='end'
        sideOffset={16}
        className='h-[600px] w-[400px] overflow-hidden rounded-xl border-2 p-0 shadow-2xl'
        aria-describedby='chat-interface-desktop'
      >
        <div className='flex h-full flex-col overflow-hidden bg-background'>
          <AiChatHeader
            onClose={handleClose}
            onClear={handleClear}
            showClear
            className='flex-shrink-0'
          />

          <AiChatInterface
            messages={messages}
            inputValue={inputValue}
            isLoading={isLoading}
            isTyping={isTyping}
            progress={progress}
            scrollRef={scrollRef}
            onInputChange={handleInputChange}
            onSendMessage={sendMessage}
            isMobile={false}
            className='flex-1 min-h-0'
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AiChatWidget
