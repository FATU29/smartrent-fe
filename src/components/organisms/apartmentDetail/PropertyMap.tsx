import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Check, Copy } from 'lucide-react'
import SectionHeading from '@/components/atoms/sectionHeading'

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
    className='-translate-x-1/2 -translate-y-full bg-destructive border-[3px] border-background shadow-lg'
    style={{
      borderRadius: '9999px',
      width: 20,
      height: 20,
    }}
  />
)

const normalizeAddress = (value?: string | null): string =>
  value?.trim() ? value.trim() : ''

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
  const displayAddress = normalizedNewAddress || normalizedLegacyAddress

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
    <div className='space-y-4'>
      <SectionHeading title={t('sections.location')}>
        {displayAddress && (
          <Button
            variant='ghost'
            size='sm'
            onClick={copyAddress}
            className='h-8 px-2.5 text-muted-foreground hover:text-foreground'
          >
            {isCopied ? (
              <Check className='w-4 h-4' />
            ) : (
              <Copy className='w-4 h-4' />
            )}
            {isCopied ? t('map.addressCopied') : t('map.copyAddress')}
          </Button>
        )}
      </SectionHeading>

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
