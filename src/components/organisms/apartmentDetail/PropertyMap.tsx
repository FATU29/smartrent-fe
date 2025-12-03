import React from 'react'
import GoogleMapReact from 'google-map-react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { ExternalLink } from 'lucide-react'

interface PropertyMapProps {
  location?: {
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  address?: React.ReactNode
  readOnly?: boolean
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

const PropertyMap: React.FC<PropertyMapProps> = ({ location, address }) => {
  const t = useTranslations('apartmentDetail')

  if (!location?.coordinates) {
    return null
  }

  const { latitude, longitude } = location.coordinates
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

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
    fullscreenControl: false,
    disableDefaultUI: false,
    gestureHandling: 'cooperative' as const,
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3' className='text-xl font-bold'>
          {t('sections.location')}
        </Typography>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.open(googleMapsUrl, '_blank')}
          className='flex items-center gap-2'
        >
          <ExternalLink className='w-4 h-4' />
          {t('map.openInGoogleMaps')}
        </Button>
      </div>

      {address && <div className='space-y-2'>{address}</div>}

      {/* Interactive Google Map */}
      <Card>
        <CardContent className='relative w-full aspect-[16/9] p-0 overflow-hidden rounded-lg'>
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
