import React from 'react'
import { InteractionType } from '@/api/types/customer.type'
import { Badge } from '@/components/atoms/badge'
import { MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InteractionBadgeProps {
  type: InteractionType
  className?: string
}

const InteractionBadge: React.FC<InteractionBadgeProps> = ({
  type,
  className,
}) => {
  if (type === 'zalo') {
    return (
      <Badge
        className={cn(
          'bg-blue-600 hover:bg-blue-700 text-white gap-1',
          className,
        )}
      >
        <MessageCircle size={12} />
        Zalo Chat
      </Badge>
    )
  }

  return (
    <Badge
      className={cn('bg-black hover:bg-gray-800 text-white gap-1', className)}
    >
      <Phone size={12} />
      Phone Number
    </Badge>
  )
}

export default InteractionBadge
