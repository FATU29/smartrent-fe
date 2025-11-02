import React, { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface GoogleMapPickerProps {
  latitude?: number
  longitude?: number
  onLocationSelect: (lat: number, lng: number) => void
  className?: string
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  latitude = 10.762622,
  longitude = 106.660172,
  onLocationSelect,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const hasValidCoordinates = latitude !== 0 && longitude !== 0

  useEffect(() => {
    if (!mapRef.current || !hasValidCoordinates) return

    const initMap = () => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      })

      const markerInstance = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstance,
        draggable: true,
      })

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat() || 0
        const lng = e.latLng?.lng() || 0
        markerInstance.setPosition({ lat, lng })
        onLocationSelect(lat, lng)
      })

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition()
        if (position) {
          onLocationSelect(position.lat(), position.lng())
        }
      })

      setMap(mapInstance)
      setMarker(markerInstance)
    }

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [hasValidCoordinates])

  useEffect(() => {
    if (marker && map) {
      const newPosition = { lat: latitude, lng: longitude }
      marker.setPosition(newPosition)
      map.setCenter(newPosition)
    }
  }, [latitude, longitude, marker, map])

  return (
    <div className={className}>
      {/* Map Display */}
      {hasValidCoordinates ? (
        <div className='space-y-3'>
          {/* Google Maps */}
          <div className='relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm'>
            <div ref={mapRef} className='w-full h-full' />
            <div className='absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg text-xs shadow-lg'>
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-blue-500' />
                <span className='text-gray-700 dark:text-gray-300 font-medium'>
                  Click trên bản đồ để chọn vị trí
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty state - no coordinates yet
        <div className='w-full h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center relative'>
          <div className='text-center space-y-4 p-6'>
            <MapPin className='w-12 h-12 text-blue-500 mx-auto' />
            <div>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Chưa có vị trí
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Nhập địa chỉ để hiển thị bản đồ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleMapPicker
