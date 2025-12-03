import React, { useState, useMemo } from 'react'
import GoogleMapReact from 'google-map-react'
import { Card, CardContent } from '@/components/atoms/card'
import { Typography } from '@/components/atoms/typography'

interface MapPickerProps {
  latitude?: number
  longitude?: number
  zoom?: number
  title?: string
}

const Marker: React.FC<{ lat: number; lng: number }> = () => (
  <div
    style={{
      transform: 'translate(-50%, -100%)',
      background: '#ef4444',
      borderRadius: '9999px',
      width: 16,
      height: 16,
      border: '2px solid white',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    }}
  />
)

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  zoom = 15,
  title = 'Vị trí trên bản đồ',
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    () => (latitude && longitude ? { lat: latitude, lng: longitude } : null),
  )

  const defaultCenter = useMemo(() => {
    if (coords) return coords
    // Fallback to Ho Chi Minh City if no coordinates available
    return { lat: 10.8231, lng: 106.6297 }
  }, [coords])

  const apiKey = process.env.GOOGLE_MAP_KEY

  const handleMapClick = ({
    lat,
    lng,
  }: {
    lat: number
    lng: number
    x?: number
    y?: number
    event?: MouseEvent
  }) => {
    setCoords({ lat, lng })
  }

  return (
    <div className='space-y-3'>
      <Typography variant='h3' className='text-xl font-bold'>
        {title}
      </Typography>
      <Card>
        <CardContent className='relative w-full aspect-[16/9] p-0 overflow-hidden rounded-lg'>
          <GoogleMapReact
            bootstrapURLKeys={apiKey ? { key: apiKey } : undefined}
            defaultCenter={defaultCenter}
            defaultZoom={zoom}
            onClick={handleMapClick}
          >
            {coords && <Marker lat={coords.lat} lng={coords.lng} />}
          </GoogleMapReact>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapPicker
