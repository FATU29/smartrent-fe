import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react'

import { Card, CardContent } from '@/components/atoms/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import type { ChatListing } from '@/api/types/ai.type'

interface AiChatContactCardProps {
  listing: ChatListing
  className?: string
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const AiChatContactCard: React.FC<AiChatContactCardProps> = ({
  listing,
  className,
}) => {
  const t = useTranslations('chat.contact')
  const { user, ownerContactPhoneNumber, ownerZaloLink } = listing

  if (!user) return null

  const displayName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || t('landlord')
  const phone = ownerContactPhoneNumber || user.phoneNumber
  const email = user.email
  const zaloLink = ownerZaloLink
  const sellerPageUrl = `/properties/seller/${user.userId}`

  return (
    <Card
      className={cn(
        'overflow-hidden border border-border/40 bg-card py-0',
        className,
      )}
    >
      <CardContent className='p-3'>
        {/* Header: Avatar + Name */}
        <div className='flex items-center gap-3 mb-3'>
          <Avatar className='h-10 w-10 ring-2 ring-primary/15'>
            <AvatarImage src={undefined} alt={displayName} />
            <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-foreground truncate'>
              {displayName}
            </p>
            <p className='text-[11px] text-muted-foreground'>{t('landlord')}</p>
          </div>
        </div>

        {/* Contact info */}
        <div className='space-y-1.5 mb-3'>
          {phone && (
            <a
              href={`tel:${phone.replace(/[\s.-]/g, '')}`}
              className='flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors rounded-md px-2 py-1.5 hover:bg-muted/60'
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className='w-3.5 h-3.5 text-primary flex-shrink-0' />
              <span>{phone}</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className='flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors rounded-md px-2 py-1.5 hover:bg-muted/60'
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className='w-3.5 h-3.5 text-primary flex-shrink-0' />
              <span className='truncate'>{email}</span>
            </a>
          )}

          {zaloLink && (
            <a
              href={zaloLink}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors rounded-md px-2 py-1.5 hover:bg-muted/60'
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className='w-3.5 h-3.5 text-primary flex-shrink-0' />
              <span>Zalo</span>
            </a>
          )}
        </div>

        {/* CTA: View seller page */}
        <Link
          href={sellerPageUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='block'
        >
          <Button
            size='sm'
            variant='ghost'
            className='w-full text-xs h-8 text-primary hover:text-primary hover:bg-primary/5 justify-between'
          >
            <span>{t('viewSellerPage')}</span>
            <ArrowRight className='w-3.5 h-3.5' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default AiChatContactCard
