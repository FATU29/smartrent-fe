import * as React from 'react'
import { BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { cn, getUserInitials } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface BrokerAvatarProps {
  avatarUrl?: string | null
  firstName?: string
  lastName?: string
  alt?: string
  sizeClassName?: string
  className?: string
  fallbackClassName?: string
  imageClassName?: string
  showBrokerBadge?: boolean
  badgeClassName?: string
}

const BrokerAvatar: React.FC<BrokerAvatarProps> = ({
  avatarUrl,
  firstName = '',
  lastName = '',
  alt,
  sizeClassName = 'size-10',
  className,
  fallbackClassName,
  imageClassName,
  showBrokerBadge = false,
  badgeClassName,
}) => {
  const t = useTranslations()
  const displayName = alt || `${firstName} ${lastName}`.trim() || 'User'
  const initials = getUserInitials(firstName, lastName) || '?'
  const brokerLabel = t('userMenu.proBroker')

  return (
    <div className='relative inline-flex'>
      <Avatar
        className={cn(
          'overflow-hidden',
          sizeClassName,
          showBrokerBadge
            ? 'ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-background'
            : 'ring-1 ring-border/60',
          className,
        )}
      >
        <AvatarImage
          src={avatarUrl || undefined}
          alt={displayName}
          className={cn('object-cover', imageClassName)}
        />
        <AvatarFallback
          className={cn(
            'bg-primary text-primary-foreground font-semibold',
            fallbackClassName,
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {showBrokerBadge && (
        <span
          className={cn(
            'absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background shadow-sm',
            badgeClassName,
          )}
          aria-label={brokerLabel}
          title={brokerLabel}
        >
          <BadgeCheck className='h-3 w-3' />
        </span>
      )}
    </div>
  )
}

export default BrokerAvatar
