'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { useToggleSaveListing } from '@/hooks/useSavedListings'
import { cn } from '@/lib/utils'

interface SaveListingButtonProps {
  listingId: number | null | undefined
  variant?: 'default' | 'icon' | 'compact'
  showLabel?: boolean
  className?: string
  iconClassName?: string
  onSaved?: () => void
  onUnsaved?: () => void
  disabled?: boolean
}

/**
 * SaveListingButton Component
 * Reusable button to save/unsave listings with heart icon
 * Supports multiple variants for different UI contexts
 */
export const SaveListingButton: React.FC<SaveListingButtonProps> = ({
  listingId,
  variant = 'icon',
  showLabel = false,
  className,
  iconClassName,
  onSaved,
  onUnsaved,
  disabled = false,
}) => {
  const t = useTranslations('savedListings')
  const { isSaved, isLoading, toggleSave } = useToggleSaveListing(listingId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!listingId || disabled || isLoading) return

    await toggleSave()

    // Call callbacks after toggle
    if (isSaved) {
      onUnsaved?.()
    } else {
      onSaved?.()
    }
  }

  const buttonContent = (
    <>
      <Heart
        className={cn(
          'transition-all duration-200',
          isSaved
            ? 'fill-red-500 stroke-red-500'
            : 'fill-none stroke-current hover:stroke-red-500',
          isLoading && 'animate-pulse',
          iconClassName,
        )}
        size={variant === 'compact' ? 16 : 20}
      />
      {showLabel && (
        <span className='ml-2'>
          {isSaved ? t('actions.saved') : t('actions.save')}
        </span>
      )}
    </>
  )

  // Compact variant - just the icon, inline with text
  if (variant === 'compact') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              disabled={disabled || isLoading || !listingId}
              className={cn(
                'inline-flex items-center justify-center',
                'hover:scale-110 active:scale-95',
                'transition-transform duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className,
              )}
              aria-label={isSaved ? t('tooltip.saved') : t('tooltip.save')}
            >
              {buttonContent}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSaved ? t('tooltip.saved') : t('tooltip.save')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Icon variant - for cards and listing detail
  if (variant === 'icon') {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleClick}
              disabled={disabled || isLoading || !listingId}
              className={cn(
                'hover:bg-background/80 hover:scale-110 active:scale-95',
                'transition-all duration-200',
                'rounded-full',
                className,
              )}
              aria-label={isSaved ? t('tooltip.saved') : t('tooltip.save')}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSaved ? t('tooltip.saved') : t('tooltip.save')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Default variant - full button with optional label
  return (
    <Button
      variant='outline'
      size='default'
      onClick={handleClick}
      disabled={disabled || isLoading || !listingId}
      className={cn(
        'hover:scale-105 active:scale-95',
        'transition-all duration-200',
        className,
      )}
      aria-label={isSaved ? t('tooltip.saved') : t('tooltip.save')}
    >
      {buttonContent}
    </Button>
  )
}

export default SaveListingButton
