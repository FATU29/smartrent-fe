import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Check, Copy, ExternalLink, MapPin } from 'lucide-react'

interface PropertyMapProps {
  location?: {
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  newAddress?: string | null
  legacyAddress?: string | null
}

const Marker: React.FC<{ lat: number; lng: number }> = () => (
  <div
    style={{
      transform: 'translate(-50%, -100%)',
      background: '#ef4444',
      borderRadius: '9999px',
      width: 20,
      height: 20,
      border: '3px solid white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    }}
  />
)

const normalizeAddress = (value?: string | null): string =>
  value?.trim() ? value.trim() : ''

const formatCoordinate = (value: number): string => value.toFixed(6)

const PropertyMap: React.FC<PropertyMapProps> = ({
  location,
  newAddress,
  legacyAddress,
}) => {
  const t = useTranslations('apartmentDetail')
  const [isCopied, setIsCopied] = useState(false)

  if (!location?.coordinates) {
    return null
  }

  const { latitude, longitude } = location.coordinates
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY
  const normalizedNewAddress = normalizeAddress(newAddress)
  const normalizedLegacyAddress = normalizeAddress(legacyAddress)
  const hasNewAddress = Boolean(normalizedNewAddress)
  const hasLegacyAddress = Boolean(normalizedLegacyAddress)
  const displayAddress = normalizedNewAddress || normalizedLegacyAddress

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  const openGoogleMaps = () => {
    if (typeof window === 'undefined') return
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
  }

  const copyAddress = async () => {
    if (
      !displayAddress ||
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.writeText
    )
      return

    try {
      await navigator.clipboard.writeText(displayAddress)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1800)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const defaultCenter = {
    lat: latitude,
    lng: longitude,
  }

  const mapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: true,
    rotateControl: false,
    fullscreenControl: true,
    disableDefaultUI: false,
    gestureHandling: 'auto' as const,
  }

  return (
    <div className='space-y-4 md:space-y-5'>
      <div className='rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <Typography variant='h3' className='text-xl md:text-2xl font-bold'>
              {t('sections.location')}
            </Typography>
            <Typography
              variant='small'
              className='text-muted-foreground leading-relaxed'
            >
              {t('map.description')}
            </Typography>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={openGoogleMaps}
            className='w-full sm:w-auto font-medium'
          >
            <ExternalLink className='w-4 h-4' />
            {t('map.openInGoogleMaps')}
          </Button>
        </div>
      </div>

      {displayAddress && (
        <Card className='border-border/70 shadow-sm py-0'>
          <CardContent className='px-4 py-4 sm:px-5 sm:py-5'>
            <div className='flex items-start gap-3 sm:gap-4'>
              <div className='mt-0.5 rounded-full bg-primary/10 p-2.5 text-primary shrink-0'>
                <MapPin className='w-4 h-4 sm:w-5 sm:h-5' />
              </div>

              <div className='min-w-0 flex-1 space-y-3'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <Typography
                    variant='small'
                    className='text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'
                  >
                    {t('map.addressTitle')}
                  </Typography>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={copyAddress}
                    className='h-8 px-2.5 w-full sm:w-auto'
                  >
                    {isCopied ? (
                      <Check className='w-4 h-4' />
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                    {isCopied ? t('map.addressCopied') : t('map.copyAddress')}
                  </Button>
                </div>

                <div className='space-y-2'>
                  {hasNewAddress && (
                    <div className='rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5'>
                      <Typography
                        variant='p'
                        className='text-sm md:text-base text-muted-foreground flex items-start gap-2'
                      >
                        <span className='font-semibold text-foreground shrink-0'>
                          {t('property.newAddress')}:
                        </span>
                        <span className='flex-1 break-words'>
                          {normalizedNewAddress}
                        </span>
                      </Typography>
                    </div>
                  )}

                  {hasLegacyAddress && (
                    <div className='rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5'>
                      <Typography
                        variant='p'
                        className='text-sm md:text-base text-muted-foreground flex items-start gap-2'
                      >
                        <span className='font-semibold text-foreground shrink-0'>
                          {t('property.legacyAddress')}:
                        </span>
                        <span className='flex-1 break-words'>
                          {normalizedLegacyAddress}
                        </span>
                      </Typography>
                    </div>
                  )}
                </div>

                <Typography
                  variant='small'
                  className='text-xs text-muted-foreground'
                >
                  {t('map.coordinates')}: {formatCoordinate(latitude)},{' '}
                  {formatCoordinate(longitude)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Google Map */}
      <Card className='overflow-hidden shadow-md hover:shadow-lg transition-shadow py-0 border-border/70'>
        <CardContent className='relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] p-0'>
          <GoogleMapReact
            bootstrapURLKeys={apiKey ? { key: apiKey } : undefined}
            defaultCenter={defaultCenter}
            defaultZoom={15}
            options={mapOptions}
            yesIWantToUseGoogleMapApiInternals
          >
            <Marker lat={latitude} lng={longitude} />
          </GoogleMapReact>
        </CardContent>
      </Card>
    </div>
  )
}

export default PropertyMap
