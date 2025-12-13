import { FC } from 'react'

import { cn } from '@/lib/utils'
import { TChatMessage } from '@/hooks/useChatAi'

import AiChatAvatar from '@/components/atoms/aiChatAvatar'
import AiChatMessageTime from '@/components/atoms/aiChatMessageTime'

type TAiChatBubbleProps = {
  message: TChatMessage
  className?: string
}

const AiChatBubble: FC<TAiChatBubbleProps> = ({ message, className }) => {
  const isBot = message.sender === 'bot'

  return (
    <div
      className={cn(
        'flex w-full gap-2 px-3 py-1.5 md:gap-3 md:px-4 md:py-2',
        isBot ? 'justify-start' : 'justify-end',
        className,
      )}
    >
      {isBot && <AiChatAvatar type='bot' className='mt-0.5' />}

      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1 md:max-w-[75%]',
          isBot ? 'items-start' : 'items-end',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3 py-2 shadow-sm transition-all duration-200 md:px-4',
            isBot
              ? 'bg-muted text-foreground hover:bg-muted/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          <p className='whitespace-pre-wrap break-words text-sm leading-relaxed'>
            {message.content}
          </p>
        </div>

        <AiChatMessageTime timestamp={message.timestamp} className='px-1' />
      </div>

      {!isBot && <AiChatAvatar type='user' className='mt-0.5' />}
    </div>
  )
}

export default AiChatBubble
