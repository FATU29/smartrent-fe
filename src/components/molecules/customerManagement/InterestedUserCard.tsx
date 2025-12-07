import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar'
import { Badge } from '@/components/atoms/badge'
import { Mail, Phone, CheckCircle2, ExternalLink } from 'lucide-react'
import { getInitials } from './utils'
import type { UserPhoneClickDetail } from '@/api/types/phone-click-detail.type'

interface InterestedUserCardProps {
  user: UserPhoneClickDetail
  listingId: number
  clickCountLabel: string
  onUserClick: (user: UserPhoneClickDetail) => void
}

export function InterestedUserCard({
  user,
  listingId,
  clickCountLabel,
  onUserClick,
}: InterestedUserCardProps) {
  const userClickCount = user.clickedListings
    .filter((l) => l.listingId === listingId)
    .reduce((sum, l) => sum + l.clickCount, 0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onUserClick(user)
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      className='group p-3 bg-muted/50 hover:bg-primary/5 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]'
      onClick={() => onUserClick(user)}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${user.firstName} ${user.lastName}`}
    >
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10 border-2 border-background shadow-sm flex-shrink-0'>
          {user.avatarUrl && (
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
          )}
          <AvatarFallback className='bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-semibold'>
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h4 className='font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate'>
              {user.firstName} {user.lastName}
            </h4>
            {user.contactPhoneVerified && (
              <CheckCircle2 className='h-3.5 w-3.5 text-green-600 flex-shrink-0' />
            )}
          </div>

          <div className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1 truncate'>
              <Mail className='h-3 w-3 flex-shrink-0' />
              <span className='truncate'>{user.email}</span>
            </div>
            {user.contactPhone && (
              <div className='flex items-center gap-1'>
                <Phone className='h-3 w-3 flex-shrink-0' />
                <span>{user.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col items-end gap-1 flex-shrink-0'>
          <Badge variant='secondary' className='text-xs whitespace-nowrap'>
            {userClickCount} {clickCountLabel}
          </Badge>
          <ExternalLink className='h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors' />
        </div>
      </div>
    </div>
  )
}
