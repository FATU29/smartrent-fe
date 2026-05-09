import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Heart, Loader2, UserCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { useToggleFollow } from '@/hooks/useUserFollow'

type FollowButtonVariant = 'primary' | 'outline' | 'compact'

export interface FollowButtonProps {
  /** Target user being followed. When null, the button is disabled (still renders so layouts don't shift). */
  targetUserId: string | null | undefined
  /** Show "12 followers" subtext under/inside the button. */
  showFollowerCount?: boolean
  /** Visual treatment. `compact` is small enough to sit beside an avatar on mobile. */
  variant?: FollowButtonVariant
  className?: string
  /** Override the default icon (heart). Pass `null` to omit the icon. */
  icon?: React.ReactNode | null
  /** Render as a full-width button (defaults to true on `primary`/`outline`). */
  fullWidth?: boolean
}

/**
 * Follow / Unfollow toggle. Optimistically updates and prompts login on first
 * click for unauthenticated users — see `useToggleFollow`.
 */
const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  showFollowerCount = false,
  variant = 'primary',
  className,
  icon,
  fullWidth,
}) => {
  const t = useTranslations('userFollow')
  const router = useRouter()
  const { isFollowing, followerCount, isLoading, isSelf, toggleFollow } =
    useToggleFollow(targetUserId, { returnUrlAfterAuth: router.asPath })

  // Don't render the button when the viewer is the target user — there's
  // nothing to follow. We still expose the count for UX symmetry on profile pages.
  if (isSelf) {
    if (!showFollowerCount) return null
    return (
      <span className='text-xs text-muted-foreground'>
        {t('followerCount', { count: followerCount })}
      </span>
    )
  }

  const label = isFollowing ? t('actions.unfollow') : t('actions.follow')
  const ariaLabel = isFollowing
    ? t('actions.unfollowAria')
    : t('actions.followAria')

  const isCompact = variant === 'compact'
  const buttonVariant =
    variant === 'outline' || isFollowing ? 'outline' : 'default'
  const sizeClass = isCompact ? 'h-8 px-3 text-xs' : 'h-9 md:h-10 text-sm'
  const widthClass = (fullWidth ?? !isCompact) ? 'w-full' : ''

  const renderIcon = () => {
    if (icon === null) return null
    if (icon !== undefined) return icon
    if (isLoading) return <Loader2 className='h-4 w-4 animate-spin' />
    if (isFollowing) return <UserCheck className='h-4 w-4' />
    return isCompact ? (
      <UserPlus className='h-3.5 w-3.5' />
    ) : (
      <Heart className='h-4 w-4' />
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        widthClass,
        showFollowerCount && !isCompact ? 'items-stretch' : 'items-start',
      )}
    >
      <Button
        type='button'
        variant={buttonVariant}
        onClick={toggleFollow}
        disabled={!targetUserId || isLoading}
        aria-label={ariaLabel}
        aria-pressed={isFollowing}
        className={cn(
          'font-semibold transition-colors',
          sizeClass,
          widthClass,
          isFollowing && 'border-primary/40 text-primary hover:bg-primary/5',
          className,
        )}
      >
        {renderIcon()}
        <span>{label}</span>
      </Button>

      {showFollowerCount && (
        <span className='text-xs text-muted-foreground'>
          {t('followerCount', { count: followerCount })}
        </span>
      )}
    </div>
  )
}

export default FollowButton
