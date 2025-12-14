import { FC } from 'react'
import { Bot, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/auth'

type TAiChatAvatarProps = {
  type: 'user' | 'bot'
  className?: string
}

const AiChatAvatar: FC<TAiChatAvatarProps> = ({ type, className }) => {
  const isBot = type === 'bot'
  const { user, isAuthenticated } = useAuthContext()

  // Get user avatar if available
  const userAvatarUrl =
    isAuthenticated && user?.avatarUrl ? user.avatarUrl : null

  return (
    <Avatar
      className={cn(
        'h-8 w-8 flex-shrink-0',
        isBot ? 'bg-primary' : 'bg-muted-foreground',
        className,
      )}
    >
      {/* Show user avatar image if available */}
      {!isBot && userAvatarUrl && (
        <AvatarImage src={userAvatarUrl} alt='User avatar' />
      )}

      <AvatarFallback
        className={cn(
          'text-white',
          isBot ? 'bg-primary' : 'bg-muted-foreground',
        )}
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
