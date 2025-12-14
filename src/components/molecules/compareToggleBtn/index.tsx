import { useEffect, useState } from 'react'
import { CheckCircle, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/atoms/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { ListingApi } from '@/api/types/property.type'
import { useCompareStore } from '@/store/compare/useCompareStore'
import { cn } from '@/lib/utils'

interface CompareToggleBtnProps {
  listing: ListingApi
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

const CompareToggleBtn: React.FC<CompareToggleBtnProps> = ({
  listing,
  variant = 'ghost',
  size = 'icon',
  className,
  showLabel = false,
}) => {
  const t = useTranslations('compare')
  // Subscribe to compareList to trigger re-renders when it changes
  const compareList = useCompareStore((state) => state.compareList)
  const { addToCompare, removeFromCompare } = useCompareStore()
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration: Zustand persist may not be ready on first render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Compute isInList from compareList - this will update when compareList changes
  const isInList = compareList.some(
    (item) => item.listingId === listing.listingId,
  )

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isMounted) return

    if (isInList) {
      removeFromCompare(listing.listingId)
      toast.success(t('messages.removed'))
    } else {
      const success = addToCompare(listing)
      if (success) {
        toast.success(t('messages.added'))
      } else {
        toast.warning(t('messages.limitReached'))
      }
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('shrink-0', className)}
        disabled
      >
        {showLabel && (
          <span className='sr-only'>{t('actions.addToCompare')}</span>
        )}
      </Button>
    )
  }

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'shrink-0 transition-all',
        isInList && 'text-primary hover:text-primary',
        className,
      )}
      onClick={handleToggle}
    >
      {isInList ? (
        <CheckCircle className='w-4 h-4' />
      ) : (
        <PlusCircle className='w-4 h-4' />
      )}
      {showLabel && (
        <span className='ml-2'>
          {isInList
            ? t('actions.removeFromCompare')
            : t('actions.addToCompare')}
        </span>
      )}
    </Button>
  )

  if (showLabel) {
    return buttonContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>
            {isInList
              ? t('actions.removeFromCompare')
              : t('actions.addToCompare')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CompareToggleBtn
