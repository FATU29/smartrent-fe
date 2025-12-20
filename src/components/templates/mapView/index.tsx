import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps'
import { Button } from '@/components/atoms/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ENV } from '@/constants/env'
import { PUBLIC_ROUTES } from '@/constants/route'
import { ListingDetail } from '@/api/types/property.type'
import MapMarker from '@/components/molecules/mapMarker'
import MapPropertyCard from '@/components/molecules/mapPropertyCard'
import { ListingService } from '@/api/services/listing.service'
import {
  mapFrontendToBackendRequest,
  mapBackendToFrontendResponse,
} from '@/utils/property/mapListingResponse'
import { getFiltersFromQuery } from '@/utils/queryParams'

const VIETNAM_CENTER = { lat: 16.0544, lng: 108.2022 }
const DEFAULT_ZOOM = 12
const MAP_HEIGHT = 'h-[calc(100vh-80px)]'
const DEBOUNCE_DELAY_MS = 500
const MAP_LISTINGS_PAGE_SIZE = 200

// Helper function to check if listing is within map bounds
const isListingInBounds = (
  listing: ListingDetail,
  ne: google.maps.LatLng,
  sw: google.maps.LatLng,
): boolean => {
  if (!listing.address?.latitude || !listing.address?.longitude) {
    return false
  }

  const lat = listing.address.latitude
  const lng = listing.address.longitude

  return (
    lat <= ne.lat() && lat >= sw.lat() && lng <= ne.lng() && lng >= sw.lng()
  )
}

const MapContent: React.FC = () => {
  const map = useMap()
  const router = useRouter()
  const t = useTranslations('navigation')
  const [listings, setListings] = useState<ListingDetail[]>([])
  const [selectedListing, setSelectedListing] = useState<ListingDetail | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchListingsInBounds = useCallback(async () => {
    if (!map) return

    const bounds = map.getBounds()
    if (!bounds) return

    setIsLoading(true)
    setError(null)

    try {
      const filters = getFiltersFromQuery(router.query)
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      const backendRequest = mapFrontendToBackendRequest({
        ...filters,
        page: 1,
        size: MAP_LISTINGS_PAGE_SIZE,
      })

      const response = await ListingService.search(backendRequest)

      if (response.success && response.data) {
        const frontendResponse = mapBackendToFrontendResponse(response.data)
        const listingsInBounds = (frontendResponse.listings || []).filter(
          (listing) => isListingInBounds(listing, ne, sw),
        )
        setListings(listingsInBounds)
      } else {
        setError('Failed to load properties')
        setListings([])
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while loading properties'
      console.error('Error fetching listings:', err)
      setError(errorMessage)
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }, [map, router.query])

  const handleMapChange = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchListingsInBounds()
    }, DEBOUNCE_DELAY_MS)
  }, [fetchListingsInBounds])

  // Initial fetch
  useEffect(() => {
    fetchListingsInBounds()
  }, [fetchListingsInBounds])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Map bounds change listener
  useEffect(() => {
    if (!map) return

    const listener = map.addListener('bounds_changed', handleMapChange)

    return () => {
      if (listener && typeof google !== 'undefined' && google.maps?.event) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, handleMapChange])

  const handleBackToList = useCallback(() => {
    router.push(PUBLIC_ROUTES.PROPERTIES_PREFIX)
  }, [router])

  const handleMarkerClick = useCallback(
    (listing: ListingDetail) => {
      setSelectedListing(listing)
      if (map) {
        map.panTo({
          lat: listing.address.latitude,
          lng: listing.address.longitude,
        })
      }
    },
    [map],
  )

  const handleCloseCard = useCallback(() => {
    setSelectedListing(null)
  }, [])

  return (
    <>
      {/* Back to List Button */}
      <div className='absolute top-4 left-4 z-10'>
        <Button
          variant='secondary'
          size='sm'
          onClick={handleBackToList}
          className='shadow-lg'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          {t('backToList')}
        </Button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <div className='bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm'>{t('loadingProperties')}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <div className='bg-red-50 border border-red-200 shadow-lg rounded-lg px-4 py-2 flex items-center gap-2'>
            <span className='text-sm text-red-600'>{error}</span>
          </div>
        </div>
      )}

      {/* Property Count Badge */}
      {!isLoading && listings.length > 0 && (
        <div className='absolute top-20 left-4 z-10'>
          <div className='bg-white shadow-lg rounded-lg px-4 py-2'>
            <span className='text-sm font-medium'>
              {listings.length} {t('propertiesFound')}
            </span>
          </div>
        </div>
      )}

      {/* Selected Property Card */}
      {selectedListing && (
        <div className='absolute top-4 right-4 z-10'>
          <MapPropertyCard
            listing={selectedListing}
            onClose={handleCloseCard}
          />
        </div>
      )}

      {/* Markers */}
      {listings.map((listing) => (
        <AdvancedMarker
          key={listing.listingId}
          position={{
            lat: listing.address.latitude,
            lng: listing.address.longitude,
          }}
          onClick={() => handleMarkerClick(listing)}
        >
          <MapMarker
            price={listing.price}
            vipType={listing.vipType}
            isSelected={selectedListing?.listingId === listing.listingId}
            onClick={() => handleMarkerClick(listing)}
          />
        </AdvancedMarker>
      ))}
    </>
  )
}

const MapViewTemplate: React.FC = () => {
  return (
    <div className={`relative w-full ${MAP_HEIGHT}`}>
      <APIProvider apiKey={ENV.GOOGLE_MAP_KEY}>
        <Map
          defaultCenter={VIETNAM_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId={ENV.GOOGLE_MAP_KEY}
          disableDefaultUI={false}
          gestureHandling='greedy'
          className='w-full h-full'
        >
          <MapContent />
        </Map>
      </APIProvider>
    </div>
  )
}

export default MapViewTemplate
