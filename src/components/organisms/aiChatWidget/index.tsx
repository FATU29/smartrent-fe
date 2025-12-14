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

import AiChatHeader from '@/components/organisms/aiChatHeader'
import AiChatInterface from '@/components/organisms/aiChatInterface'
import AiChatButton from '@/components/atoms/aiChatButton'
import AiChatClearDialog from '@/components/molecules/aiChatClearDialog'

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
  const [showClearDialog, setShowClearDialog] = useState(false)

  //Init use hook
  const isMobile = useMediaQuery('(max-width: 768px)')
  const t = useTranslations('aiChat')
  const {
    messages,
    isLoading,
    isTyping,
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
    setShowClearDialog(true)
  }

  const handleConfirmClear = () => {
    clearMessages()
    setShowClearDialog(false)
  }

  const handleCancelClear = () => {
    setShowClearDialog(false)
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
            <DialogTitle className='sr-only'>{t('title')}</DialogTitle>
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
                scrollRef={scrollRef}
                onInputChange={handleInputChange}
                onSendMessage={sendMessage}
                isMobile
                className='flex-1 min-h-0'
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear History Confirmation Dialog */}
        <AiChatClearDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          onConfirm={handleConfirmClear}
          onCancel={handleCancelClear}
        />
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
            className='h-full w-full rounded-xl border-2 border-primary/20 shadow-2xl bg-background hover:border-primary/40 transition-colors'
          >
            <ResizablePanel defaultSize={100} minSize={50} maxSize={100}>
              <div className='flex h-full w-full flex-col overflow-hidden bg-background rounded-xl'>
                <AiChatHeader
                  onClose={handleClose}
                  onClear={handleClear}
                  showClear
                  className='flex-shrink-0 rounded-t-xl'
                />

                <AiChatInterface
                  messages={messages}
                  inputValue={inputValue}
                  isLoading={isLoading}
                  isTyping={isTyping}
                  scrollRef={scrollRef}
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

      {/* Clear History Confirmation Dialog */}
      <AiChatClearDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </>
  )
}

export default AiChatWidget
