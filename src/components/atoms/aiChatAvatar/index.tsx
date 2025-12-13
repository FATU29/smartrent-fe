import { FC } from 'react'
import { Bot, User } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import { cn } from '@/lib/utils'

type TAiChatAvatarProps = {
  type: 'user' | 'bot'
  className?: string
}

const AiChatAvatar: FC<TAiChatAvatarProps> = ({ type, className }) => {
  const isBot = type === 'bot'

  return (
    <Avatar
      className={cn(
        'h-8 w-8 flex-shrink-0',
        isBot ? 'bg-primary' : 'bg-secondary',
        className,
      )}
    >
      <AvatarFallback
        className={cn('text-white', isBot ? 'bg-primary' : 'bg-secondary')}
      >
        {isBot ? (
          <Bot className='h-4 w-4 text-white' />
        ) : (
          <User className='h-4 w-4 text-white' />
        )}
      </AvatarFallback>
    </Avatar>
  )
}

export default AiChatAvatar
