import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Heart, Loader2, UserCheck, UserPlus } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { useToggleFollow } from '@/hooks/useUserFollow'

type ButtonVariantProps = VariantProps<typeof buttonVariants>
type ButtonVisualVariant = NonNullable<ButtonVariantProps['variant']>
type ButtonSize = NonNullable<ButtonVariantProps['size']>

export interface FollowButtonProps {
  /** Target user being followed. When null, the button stays disabled. */
  targetUserId: string | null | undefined
  /** Show "12 followers" subtext below the button (full-width by default). */
  showFollowerCount?: boolean
  /**
   * Visual treatment when NOT following. Once isFollowing flips, the button
   * always renders as `outline` so it reads as a confirmed-toggle state.
   * Same enum as shadcn Button.
   */
  variant?: ButtonVisualVariant
  /** Mirrors shadcn Button's size scale. Default `default`. */
  size?: ButtonSize
  /**
   * Lands on the inner Button's className — use this to match the height /
   * padding / text-size of sibling buttons in the same card.
   */
  className?: string
  /** Override the default leading icon. Pass `null` to omit it. */
  icon?: React.ReactNode | null
  /** Defaults to true when `showFollowerCount` is true, false otherwise. */
  fullWidth?: boolean
}

/**
 * Follow / Unfollow toggle. Optimistically updates and prompts login on first
 * click for unauthenticated users — see `useToggleFollow`.
 *
 * Sizing convention: this component does not pick its own height; pass `size`
 * + `className` so it visually matches the buttons it sits next to.
 */
const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  showFollowerCount = false,
  variant = 'default',
  size = 'default',
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

  const effectiveVariant: ButtonVisualVariant = isFollowing
    ? 'outline'
    : variant
  const isFullWidth = fullWidth ?? showFollowerCount

  // Use `size-*` (not h-/w-) so the icon survives Button's
  // `[&_svg:not([class*='size-'])]:size-4` enforcement.
  const iconSizeClass = size === 'sm' || size === 'icon' ? 'size-3.5' : 'size-4'

  const renderIcon = () => {
    if (icon === null) return null
    if (icon !== undefined) return icon
    if (isLoading) {
      return <Loader2 className={cn(iconSizeClass, 'animate-spin')} />
    }
    if (isFollowing) return <UserCheck className={iconSizeClass} />
    return size === 'sm' || size === 'icon' ? (
      <UserPlus className={iconSizeClass} />
    ) : (
      <Heart className={iconSizeClass} />
    )
  }

  const buttonNode = (
    <Button
      type='button'
      variant={effectiveVariant}
      size={size}
      onClick={toggleFollow}
      disabled={!targetUserId || isLoading}
      aria-label={ariaLabel}
      aria-pressed={isFollowing}
      className={cn(
        'font-semibold transition-colors',
        isFullWidth && 'w-full',
        isFollowing && 'border-primary/40 text-primary hover:bg-primary/5',
        className,
      )}
    >
      {renderIcon()}
      <span>{label}</span>
    </Button>
  )

  if (!showFollowerCount) return buttonNode

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isFullWidth ? 'items-stretch' : 'items-start',
      )}
    >
      {buttonNode}
      <span className='text-xs text-muted-foreground'>
        {t('followerCount', { count: followerCount })}
      </span>
    </div>
  )
}

export default FollowButton
