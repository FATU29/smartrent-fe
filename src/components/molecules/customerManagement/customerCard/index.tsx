import React from 'react'
import { Customer } from '@/api/types/customer.type'
import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import { Badge } from '@/components/atoms/badge'
import { Card } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import { MessageCircle, Phone, Mail, Calendar } from 'lucide-react'

interface CustomerCardProps {
  customer: Customer
  isSelected?: boolean
  onClick: () => void
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  isSelected,
  onClick,
}) => {
  const latestInteraction = customer.interactions[0]
  const interactionIcon =
    latestInteraction?.type === 'zalo' ? (
      <MessageCircle size={14} className='text-blue-600' />
    ) : (
      <Phone size={14} className='text-green-600' />
    )

  return (
    <Card
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 py-4',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'hover:border-primary/50',
        customer.hasUnviewed && !isSelected && 'bg-blue-500/5',
      )}
    >
      <div className='flex items-start gap-3'>
        {/* Avatar */}
        <div className='relative'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {customer.initials}
            </AvatarFallback>
          </Avatar>
          {customer.hasUnviewed && (
            <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white' />
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2 mb-1'>
            <h3 className='font-semibold text-foreground truncate'>
              {customer.name}
            </h3>
            <div className='flex flex-col items-end gap-1 shrink-0'>
              <span className='text-xs text-muted-foreground'>
                {customer.latestInteraction}
              </span>
              {customer.totalInteractions > 0 && (
                <Badge
                  variant='secondary'
                  className='h-5 min-w-[20px] px-1.5 text-xs'
                >
                  {customer.totalInteractions}
                </Badge>
              )}
            </div>
          </div>

          <div className='flex items-center gap-1.5 text-sm text-muted-foreground mb-1'>
            <Phone size={14} className='text-muted-foreground/70' />
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground truncate'>
              <Mail size={14} className='text-muted-foreground/70' />
              <span className='truncate'>{customer.email}</span>
            </div>
          )}

          {/* Latest interaction */}
          {latestInteraction && (
            <div className='mt-2 pt-2 border-t border-border'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-1'>
                <Calendar size={12} className='text-muted-foreground/70' />
                <span className='font-medium'>Latest:</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='truncate flex-1 text-xs text-foreground'>
                  {latestInteraction.listingTitle}
                </span>
                <div className='flex items-center gap-1 shrink-0'>
                  {interactionIcon}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default CustomerCard
