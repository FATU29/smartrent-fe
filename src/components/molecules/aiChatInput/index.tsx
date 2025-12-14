import { FC, KeyboardEvent, useState, useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

import AiChatButton from '@/components/atoms/aiChatButton'

type TAiChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isLoading?: boolean
  isMobile?: boolean
  className?: string
}

const AiChatInput: FC<TAiChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  isMobile = false,
  className,
}) => {
  //Init state hook
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations('aiChat')

  //Init event handle
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit(value)
      }
    }
  }

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSubmit(value)
    }
  }

  const handleAttach = () => {
    // Future: File attachment functionality
  }

  //Init effect hook
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [value])

  return (
    <div
      className={cn(
        'flex items-end gap-2 bg-background p-3',
        isMobile ? 'px-3 py-2' : 'p-4',
        className,
      )}
    >
      <AiChatButton
        variant='ghost'
        size='icon'
        onClick={handleAttach}
        className='flex-shrink-0 hover:bg-accent'
        aria-label={t('attachFile')}
        disabled={isLoading}
      >
        <Paperclip className='h-5 w-5 text-muted-foreground' />
      </AiChatButton>

      <div
        className={cn(
          'relative flex-1 rounded-lg border transition-all duration-200',
          isFocused
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-input hover:border-primary/50',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('placeholder')}
          disabled={isLoading}
          rows={1}
          className={cn(
            'max-h-[120px] min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
          )}
          aria-label={t('messageInput')}
        />
      </div>

      <AiChatButton
        variant='default'
        size='icon'
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        isLoading={isLoading}
        className={cn(
          'flex-shrink-0 transition-all duration-200',
          !value.trim() && !isLoading && 'opacity-50',
          value.trim() && !isLoading && 'hover:scale-105',
        )}
        aria-label={t('send')}
      >
        {!isLoading && <Send className='h-5 w-5' />}
      </AiChatButton>
    </div>
  )
}

export default AiChatInput
