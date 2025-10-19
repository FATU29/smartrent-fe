import React from 'react'
import { MapPin, MapPinOff, Loader2, AlertCircle } from 'lucide-react'
import { useLocation } from '@/hooks/useLocation'
import { Switch } from '@/components/atoms/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/atoms/tooltip'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface LocationSwitchProps {
  showCoordinates?: boolean
  className?: string
  onLocationChange?: (latitude: number | null, longitude: number | null) => void
}

export const LocationSwitch: React.FC<LocationSwitchProps> = ({
  showCoordinates = false,
  className,
  onLocationChange,
}) => {
  const t = useTranslations('location')
  const { coordinates, isEnabled, toggleLocation, isLoading, error } =
    useLocation()

  React.useEffect(() => {
    if (onLocationChange) {
      if (coordinates) {
        onLocationChange(coordinates.latitude, coordinates.longitude)
      } else {
        onLocationChange(null, null)
      }
    }
  }, [coordinates, onLocationChange])

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className='size-4 text-muted-foreground animate-spin' />
    }
    if (error) {
      return <AlertCircle className='size-4 text-destructive' />
    }
    if (isEnabled) {
      return <MapPin className='size-4 text-primary' />
    }
    return <MapPinOff className='size-4 text-muted-foreground' />
  }

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

  const handleToggle = async () => {
    await toggleLocation()
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='flex items-center gap-2'>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='cursor-help inline-flex'>{getIcon()}</span>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-xs'>
              <p className={cn(error && 'text-destructive')}>
                {getTooltipContent()}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showCoordinates && coordinates && !error && (
        <span className='text-xs text-muted-foreground font-mono'>
          {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
        </span>
      )}
    </div>
  )
}

export default LocationSwitch
