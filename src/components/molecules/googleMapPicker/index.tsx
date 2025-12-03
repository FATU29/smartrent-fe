import React, { useState, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import GoogleMapReact from 'google-map-react'
import { ENV } from '@/constants/env'

interface GoogleMapPickerProps {
  latitude?: number
  longitude?: number
  onLocationSelect: (lat: number, lng: number) => void
  className?: string
  zoom?: number
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  latitude = 10.762622,
  longitude = 106.660172,
  onLocationSelect,
  className = '',
  zoom = 15,
}) => {
  const hasValidCoordinates = latitude !== 0 && longitude !== 0
  const [markerPos, setMarkerPos] = useState({ lat: latitude, lng: longitude })

  // Handle user click on map
  const handleClick = useCallback(
    (e: { lat: number; lng: number }) => {
      if (e?.lat && e?.lng) {
        setMarkerPos({ lat: e.lat, lng: e.lng })
        onLocationSelect(e.lat, e.lng)
      }
    },
    [onLocationSelect],
  )

  React.useEffect(() => {
    if (latitude && longitude) {
      setMarkerPos({ lat: latitude, lng: longitude })
    }
  }, [latitude, longitude])

  const center = hasValidCoordinates
    ? { lat: latitude, lng: longitude }
    : markerPos

  const Marker: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => (
    <div className='relative -translate-x-1/2 -translate-y-1/2'>
      <div className='w-5 h-5 rounded-full bg-blue-500 shadow ring-2 ring-white dark:ring-gray-800 flex items-center justify-center'>
        <MapPin className='w-3 h-3 text-white' />
      </div>
      <div className='absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-gray-800 text-[10px] px-2 py-0.5 rounded shadow border border-gray-200 dark:border-gray-700'>
        {lat?.toFixed(4)}, {lng?.toFixed(4)}
      </div>
    </div>
  )

  if (
    !ENV.GOOGLE_MAP_KEY ||
    ENV.GOOGLE_MAP_KEY === 'your_google_maps_api_key_here'
  ) {
    return (
      <div className={className}>
        <div className='relative w-full h-64 rounded-xl overflow-hidden border-2 border-red-200 dark:border-red-700 shadow-sm bg-red-50 dark:bg-red-900/20 flex items-center justify-center'>
          <div className='text-center p-4'>
            <MapPin className='w-8 h-8 mx-auto mb-2 text-red-500' />
            <p className='text-sm font-medium text-red-700 dark:text-red-300'>
              Google Maps API key missing
            </p>
            <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
              Set NEXT_PUBLIC_GOOGLE_MAP_KEY in .env
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Map Display */}
      <div className='relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm'>
        <GoogleMapReact
          bootstrapURLKeys={{ key: ENV.GOOGLE_MAP_KEY }}
          defaultCenter={center}
          center={center}
          defaultZoom={zoom}
          zoom={zoom}
          yesIWantToUseGoogleMapApiInternals={false}
          onClick={handleClick}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: true,
          }}
        >
          <Marker lat={markerPos.lat} lng={markerPos.lng} />
        </GoogleMapReact>
      </div>
    </div>
  )
}

export default GoogleMapPicker
