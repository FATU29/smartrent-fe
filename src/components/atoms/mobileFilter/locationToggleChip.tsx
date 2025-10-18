import React from 'react'
import { useLocation } from '@/hooks/useLocation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'

const LocationToggleChip: React.FC = () => {
  const t = useTranslations('location')
  const { isEnabled, toggleLocation, isLoading, error } = useLocation()

  const getTooltipContent = () => {
    if (error?.translationKey) {
      const key = error.translationKey as
        | 'permissionDenied'
        | 'positionUnavailable'
        | 'timeout'
        | 'unknownError'
        | 'notSupported'
      return t(key)
    }
    if (error) {
      return error.message
    }
    if (isLoading) {
      return t('loading')
    }
    return isEnabled ? t('disableTooltip') : t('enableTooltip')
  }

  const handleClick = async () => {
    await toggleLocation()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
              'px-3 h-9 rounded-full text-sm flex items-center border transition-colors',
              isEnabled
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-foreground/80 hover:text-foreground hover:bg-muted/90 border-transparent',
              isLoading && 'opacity-70 cursor-wait',
            )}
          >
            {t('label')}
          </button>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-xs'>
          <p className={cn(error && 'text-destructive')}>
            {getTooltipContent()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default LocationToggleChip
