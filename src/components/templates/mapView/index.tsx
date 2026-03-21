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
import { Typography } from '@/components/atoms/typography'

const VIETNAM_CENTER = { lat: 16.0544, lng: 108.2022 }
const DEFAULT_ZOOM = 12
const MAP_HEIGHT = 'h-[calc(100vh-80px)]'
const DEBOUNCE_DELAY_MS = 500
const MAP_LISTINGS_LIMIT = 200

interface MapSidebarProps {
  isLoading: boolean
  listings: ListingDetail[]
  selectedListing: ListingDetail | null
  totalCount: number
  hasMore: boolean
  onSelectListing: (listing: ListingDetail) => void
  onViewDetails: (listing: ListingDetail) => void
  onBackToList: () => void
  error: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tCommon: any
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  isLoading,
  listings,
  selectedListing,
  totalCount,
  hasMore,
  onSelectListing,
  onViewDetails,
  onBackToList,
  error,
  t,
}) => {
  return (
    <div className='hidden lg:flex flex-col w-[540px] xl:w-[680px] h-full bg-background border-r border-border overflow-hidden z-20 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0'>
      <div className='p-5 border-b border-border bg-card'>
        <Button
          variant='secondary'
          size='sm'
          onClick={onBackToList}
          className='mb-5 w-fit shadow-sm'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          {t('backToList')}
        </Button>
        <div className='flex items-center justify-between'>
          <Typography
            variant='h4'
            className='text-lg font-semibold tracking-tight'
          >
            {listings.length} {t('propertiesFound')}
          </Typography>
          {isLoading && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>
        {!isLoading && hasMore && totalCount > listings.length && (
          <Typography variant='small' className='text-muted-foreground mt-1'>
            {`(${totalCount} total, zoom in for more)`}
          </Typography>
        )}
        {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-muted/20'>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {listings.map((listing) => {
            const isSelected = selectedListing?.listingId === listing.listingId
            return (
              <div
                key={listing.listingId}
                className={`flex flex-col h-full cursor-pointer transition-all duration-200 rounded-xl border bg-card overflow-hidden ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-border/50 hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => onSelectListing(listing)}
              >
                {/* Ensure standard click won't bubble up improperly from PropertyCard */}
                <div className='pointer-events-none flex-1'>
                  <PropertyCard
                    listing={listing}
                    onClick={(l) => onViewDetails(l)}
                    className='compact border-0 shadow-none h-full'
                    imageLayout='top'
                  />
                </div>

                <div className='px-4 pb-4 pt-0'>
                  <Button
                    size='sm'
                    className='w-full pointer-events-auto'
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewDetails(listing)
                    }}
                  >
                    {t('properties')}{' '}
                    {/* Placeholder for view details context if tCommon fails, usually fallback */}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        {listings.length === 0 && !isLoading && !error && (
          <div className='flex flex-col items-center justify-center h-40 text-muted-foreground space-y-3'>
            <Typography variant='p' className='text-sm text-center'>
              No listings found in this area.
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

interface MapContentProps {
  listings: ListingDetail[]
  selectedListing: ListingDetail | null
  isLoading: boolean
  error: string | null
  fetchListings: (
    neLat: number,
    neLng: number,
    swLat: number,
    swLng: number,
    zoom: number,
  ) => void
  onMarkerClick: (listing: ListingDetail) => void
  onCloseCard: () => void
  onViewDetails: (listing: ListingDetail) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tCommon: any
  handleBackToList: () => void
}

const MapContent: React.FC<MapContentProps> = ({
  listings,
  selectedListing,
  isLoading,
  error,
  fetchListings,
  onMarkerClick,
  onCloseCard,
  onViewDetails,
  t,
  tCommon,
  handleBackToList,
}) => {
  const map = useMap()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMapChange = useCallback(() => {
    if (!map) return
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    if (!bounds || !zoom) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      fetchListings(ne.lat(), ne.lng(), sw.lat(), sw.lng(), zoom)
    }, DEBOUNCE_DELAY_MS)
  }, [map, fetchListings])

  // Initial fetch triggering
  useEffect(() => {
    handleMapChange()
  }, [])

  // Setup bounds listener
  useEffect(() => {
    if (!map) return
    const listener = map.addListener('bounds_changed', handleMapChange)
    return () => {
      if (listener && typeof google !== 'undefined' && google.maps?.event) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [map, handleMapChange])

  // Auto-pan to selected listing when clicked from sidebar
  useEffect(() => {
    if (selectedListing && map) {
      // Only pan if it's slightly outside the center to prevent jitter on marker click
      map.panTo({
        lat: selectedListing.address.latitude,
        lng: selectedListing.address.longitude,
      })
    }
  }, [selectedListing, map])

  return (
    <>
      {/* Mobile Back Button */}
      <div className='absolute top-20 left-4 z-40 lg:hidden'>
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

      {/* Loading Indicator (Top Center) - Visible when loading */}
      {isLoading && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <div className='bg-white/90 backdrop-blur-md shadow-lg rounded-full px-5 py-2.5 flex items-center gap-3 border border-border/50'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            <span className='text-sm font-medium'>
              {t('loadingProperties')}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <div className='bg-destructive/10 border border-destructive/20 shadow-lg rounded-full px-4 py-2 flex items-center gap-2'>
            <span className='text-sm text-destructive font-medium'>
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Selected Property Card Overlay */}
      {selectedListing && (
        <div className='absolute bottom-6 left-4 right-4 z-30 lg:top-4 lg:bottom-auto lg:right-4 lg:left-auto lg:w-80'>
          <div className='relative bg-background rounded-xl shadow-2xl border border-border/50'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute -top-3 -right-3 z-40 bg-background hover:bg-muted shadow-lg rounded-full w-8 h-8 border border-border'
              onClick={onCloseCard}
            >
              <X className='h-4 w-4' />
            </Button>
            <PropertyCard
              listing={selectedListing}
              onClick={onViewDetails}
              className='compact border-0 shadow-none'
              imageLayout='top'
              bottomContent={
                <Button
                  className='w-full shadow-sm'
                  onClick={() => onViewDetails(selectedListing)}
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
          onClick={() => onMarkerClick(listing)}
        >
          <MapMarker
            price={listing.price}
            vipType={listing.vipType}
            isSelected={selectedListing?.listingId === listing.listingId}
            onClick={() => onMarkerClick(listing)}
          />
        </AdvancedMarker>
      ))}
    </>
  )
}

const MapViewTemplate: React.FC = () => {
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

  const fetchListings = useCallback(
    async (
      neLat: number,
      neLng: number,
      swLat: number,
      swLng: number,
      zoom: number,
    ) => {
      // Don't fetch if too zoomed out
      if (zoom < 3) {
        setListings([])
        setTotalCount(0)
        setHasMore(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const { categoryId, vipType, verifiedOnly } = router.query

        const response = await ListingService.getMapBounds({
          neLat,
          neLng,
          swLat,
          swLng,
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
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while loading properties',
        )
        setListings([])
      } finally {
        setIsLoading(false)
      }
    },
    [router.query],
  )

  const handleBackToList = useCallback(() => {
    router.push(PUBLIC_ROUTES.PROPERTIES_PREFIX)
  }, [router])

  const handleMarkerClick = useCallback((listing: ListingDetail) => {
    setSelectedListing(listing)
  }, [])

  const handleCloseCard = useCallback(() => {
    setSelectedListing(null)
  }, [])

  const handleViewDetails = useCallback(
    (listing: ListingDetail) => {
      router.push(buildApartmentDetailRoute(String(listing.listingId)))
    },
    [router],
  )

  return (
    <div
      className={`relative flex w-full ${MAP_HEIGHT} overflow-hidden bg-background`}
    >
      {/* Sidebar - Hidden on mobile, takes 420px on Desktop */}
      <MapSidebar
        isLoading={isLoading}
        listings={listings}
        selectedListing={selectedListing}
        totalCount={totalCount}
        hasMore={hasMore}
        onSelectListing={handleMarkerClick}
        onViewDetails={handleViewDetails}
        onBackToList={handleBackToList}
        error={error}
        t={t}
        tCommon={tCommon}
      />

      {/* Map Area */}
      <div className='flex-1 relative h-full'>
        <APIProvider apiKey={ENV.GOOGLE_MAP_KEY}>
          <Map
            defaultCenter={VIETNAM_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            mapId={ENV.GOOGLE_MAP_KEY}
            disableDefaultUI={false}
            gestureHandling='greedy'
            className='w-full h-full outline-none'
          >
            <MapContent
              listings={listings}
              selectedListing={selectedListing}
              isLoading={isLoading}
              error={error}
              fetchListings={fetchListings}
              onMarkerClick={handleMarkerClick}
              onCloseCard={handleCloseCard}
              onViewDetails={handleViewDetails}
              t={t}
              tCommon={tCommon}
              handleBackToList={handleBackToList}
            />
          </Map>
        </APIProvider>
      </div>
    </div>
  )
}

export default MapViewTemplate
