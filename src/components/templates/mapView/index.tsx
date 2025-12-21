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
import { ArrowLeft, Loader2, ExternalLink, X } from 'lucide-react'
import { ENV } from '@/constants/env'
import { PUBLIC_ROUTES, buildApartmentDetailRoute } from '@/constants/route'
import { ListingDetail, VipType } from '@/api/types/property.type'
import MapMarker from '@/components/molecules/mapMarker'
import PropertyCard from '@/components/molecules/propertyCard'
import { ListingService } from '@/api/services/listing.service'

const VIETNAM_CENTER = { lat: 16.0544, lng: 108.2022 }
const DEFAULT_ZOOM = 12
const MAP_HEIGHT = 'h-[calc(100vh-80px)]'
const DEBOUNCE_DELAY_MS = 500
const MAP_LISTINGS_LIMIT = 200

const MapContent: React.FC = () => {
  const map = useMap()
  const router = useRouter()
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const [listings, setListings] = useState<ListingDetail[]>([])
  const [selectedListing, setSelectedListing] = useState<ListingDetail | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchListingsInBounds = useCallback(async () => {
    if (!map) return

    const bounds = map.getBounds()
    const zoom = map.getZoom()
    if (!bounds || !zoom) return

    setIsLoading(true)
    setError(null)

    try {
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      // Extract optional filters from query params
      const { categoryId, vipType, verifiedOnly } = router.query

      const response = await ListingService.getMapBounds({
        neLat: ne.lat(),
        neLng: ne.lng(),
        swLat: sw.lat(),
        swLng: sw.lng(),
        zoom,
        limit: MAP_LISTINGS_LIMIT,
        verifiedOnly: verifiedOnly === 'true',
        categoryId: categoryId ? Number(categoryId) : undefined,
        vipType: vipType as VipType | undefined,
      })

      if (response.success && response.data) {
        setListings(response.data.listings)
        setTotalCount(response.data.totalCount)
        setHasMore(response.data.hasMore)
      } else {
        setError('Failed to load properties')
        setListings([])
        setTotalCount(0)
        setHasMore(false)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while loading properties'
      console.error('Error fetching listings:', err)
      setError(errorMessage)
      setListings([])
      setTotalCount(0)
      setHasMore(false)
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

  const handleViewDetails = useCallback(
    (listing: ListingDetail) => {
      const route = buildApartmentDetailRoute(String(listing.listingId))
      router.push(route)
    },
    [router],
  )

  return (
    <>
      {/* Back to List Button */}
      <div className='absolute top-20 left-4 z-50'>
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
            <div className='flex flex-col gap-1'>
              <span className='text-sm font-medium'>
                {listings.length} {t('propertiesFound')}
              </span>
              {hasMore && totalCount > listings.length && (
                <span className='text-xs text-gray-500'>
                  ({totalCount} total, zoom in for more)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Property Card */}
      {selectedListing && (
        <div className='absolute top-4 right-4 z-20 max-w-sm'>
          <div className='relative bg-background rounded-lg shadow-xl'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute -top-2 -right-2 z-30 bg-background hover:bg-background/80 shadow-lg rounded-full w-8 h-8'
              onClick={handleCloseCard}
            >
              <X className='h-4 w-4' />
            </Button>
            <PropertyCard
              listing={selectedListing}
              onClick={handleViewDetails}
              className='compact'
              imageLayout='top'
              bottomContent={
                <Button
                  className='w-full'
                  onClick={() => handleViewDetails(selectedListing)}
                  variant='default'
                  size='sm'
                >
                  <ExternalLink className='h-4 w-4 mr-2' />
                  {tCommon('viewDetails')}
                </Button>
              }
            />
          </div>
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
