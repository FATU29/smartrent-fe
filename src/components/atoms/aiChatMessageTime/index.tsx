import { FC } from 'react'

import { cn } from '@/lib/utils'

type TAiChatMessageTimeProps = {
  timestamp: Date
  className?: string
}

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const AiChatMessageTime: FC<TAiChatMessageTimeProps> = ({
  timestamp,
  className,
}) => {
  return (
    <time
      dateTime={timestamp.toISOString()}
      className={cn('text-xs text-muted-foreground', className)}
    >
      {formatTime(timestamp)}
    </time>
  )
}

export default AiChatMessageTime
