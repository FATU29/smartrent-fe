import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps'
import { Button } from '@/components/atoms/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Loader2, ExternalLink, ChevronsRight, X } from 'lucide-react'
import { ENV } from '@/constants/env'
import { buildApartmentDetailRoute } from '@/constants/route'
import { ListingDetail, VipType } from '@/api/types/property.type'
import MapMarker from '@/components/molecules/mapMarker'
import PropertyCard from '@/components/molecules/propertyCard'
import { ListingService } from '@/api/services/listing.service'
import { Typography } from '@/components/atoms/typography'

const VIETNAM_CENTER = { lat: 16.0544, lng: 108.2022 }
const DEFAULT_ZOOM = 12
const MAP_HEIGHT = 'h-[calc(100vh-80px)]'
const MAP_INTERACTION_DEBOUNCE_MS = 1000
const MAP_LISTINGS_LIMIT = 200
const MIN_LISTING_FETCH_ZOOM = 13
const MAP_BOUNDS_COORDINATE_PRECISION = 4
const PROGRAMMATIC_PAN_SUPPRESS_MS = 600

interface MapViewport {
  neLat: number
  neLng: number
  swLat: number
  swLng: number
  zoom: number
}

interface MapFilters {
  categoryId?: number
  vipType?: VipType
  verifiedOnly: boolean
}

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(MAP_BOUNDS_COORDINATE_PRECISION))

const normalizeViewport = (viewport: MapViewport): MapViewport => ({
  neLat: roundCoordinate(viewport.neLat),
  neLng: roundCoordinate(viewport.neLng),
  swLat: roundCoordinate(viewport.swLat),
  swLng: roundCoordinate(viewport.swLng),
  zoom: Math.round(viewport.zoom),
})

interface MapSidebarProps {
  isLoading: boolean
  listings: ListingDetail[]
  selectedListing: ListingDetail | null
  totalCount: number
  hasMore: boolean
  onSelectListing: (listing: ListingDetail) => void
  onClosePanel: () => void
  error: string | null
  isBelowMinZoom: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tCommon: any
}

const MapListingsPanelContent: React.FC<MapSidebarProps> = ({
  isLoading,
  listings,
  selectedListing,
  totalCount,
  hasMore,
  onSelectListing,
  onClosePanel,
  error,
  isBelowMinZoom,
  t,
  tCommon,
}) => {
  const isDesktopCard = useMediaQuery('(min-width: 1024px)') ?? false

  return (
    <div className='flex flex-col h-full bg-background overflow-hidden'>
      <div className='p-5 border-b border-border bg-card'>
        <div className='flex items-center justify-between gap-2'>
          <Typography
            variant='h4'
            className='text-lg font-semibold tracking-tight'
          >
            {listings.length} {t('propertiesFound')}
          </Typography>
          <div className='flex items-center gap-1'>
            {isLoading && (
              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
            )}
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={onClosePanel}
              aria-label={t('closeListingsPanel')}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
        {!isLoading && isBelowMinZoom && (
          <Typography variant='small' className='text-muted-foreground mt-1'>
            {t('zoomInToLoadListings')}
          </Typography>
        )}
        {!isLoading &&
          !isBelowMinZoom &&
          hasMore &&
          totalCount > listings.length && (
            <Typography variant='small' className='text-muted-foreground mt-1'>
              {t('totalCountZoomHint', { totalCount })}
            </Typography>
          )}
        {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
      </div>

      <div className='flex-1 overflow-y-auto p-4 bg-muted/20'>
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
          {listings.map((listing) => {
            const isSelected = selectedListing?.listingId === listing.listingId
            return (
              <div
                key={listing.listingId}
                role='button'
                tabIndex={0}
                className={`flex flex-col h-full cursor-pointer transition-all duration-200 rounded-xl border bg-card overflow-hidden ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-border/50 hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => onSelectListing(listing)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectListing(listing)
                  }
                }}
              >
                {/* Ensure standard click won't bubble up improperly from PropertyCard */}
                <div className='pointer-events-none flex-1'>
                  <PropertyCard
                    listing={listing}
                    className={`${isDesktopCard ? '' : 'compact '}border-0 shadow-none h-full`}
                    imageLayout='top'
                  />
                </div>

                <div className='px-4 pb-4 pt-0'>
                  <Button
                    size='sm'
                    className='w-full pointer-events-auto'
                    asChild
                  >
                    <Link
                      href={buildApartmentDetailRoute(
                        String(listing.listingId),
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      {tCommon('viewDetails')}
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        {listings.length === 0 && !isLoading && !error && (
          <div className='flex flex-col items-center justify-center h-40 text-muted-foreground space-y-3'>
            <Typography variant='p' className='text-sm text-center'>
              {isBelowMinZoom
                ? t('zoomInToLoadListings')
                : t('noListingsInArea')}
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
  onViewportChange: (viewport: MapViewport) => void
  onMarkerClick: (listing: ListingDetail) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tCommon: any
}

const MapContent: React.FC<MapContentProps> = ({
  listings,
  selectedListing,
  isLoading,
  error,
  onViewportChange,
  onMarkerClick,
  t,
  tCommon,
}) => {
  const map = useMap()
  const isDesktopCard = useMediaQuery('(min-width: 1024px)') ?? false
  const isProgrammaticPanRef = useRef(false)
  const panIdleListenerRef = useRef<{ remove: () => void } | null>(null)
  const panSuppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const handleMapChange = useCallback(() => {
    if (!map) return
    if (isProgrammaticPanRef.current) return

    const bounds = map.getBounds()
    const zoom = map.getZoom()
    if (!bounds || zoom === null || zoom === undefined) return

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    onViewportChange({
      neLat: ne.lat(),
      neLng: ne.lng(),
      swLat: sw.lat(),
      swLng: sw.lng(),
      zoom,
    })
  }, [map, onViewportChange])

  // Initial fetch triggering
  useEffect(() => {
    handleMapChange()
  }, [handleMapChange])

  // Setup bounds listener
  useEffect(() => {
    if (!map) return
    const listener = map.addListener('bounds_changed', handleMapChange)
    return () => {
      if (listener?.remove) {
        listener.remove()
      }
    }
  }, [map, handleMapChange])

  // Auto-pan to selected listing when clicked from sidebar
  useEffect(() => {
    if (selectedListing && map) {
      isProgrammaticPanRef.current = true
      if (panSuppressTimeoutRef.current) {
        clearTimeout(panSuppressTimeoutRef.current)
      }
      if (panIdleListenerRef.current?.remove) {
        panIdleListenerRef.current.remove()
      }

      panIdleListenerRef.current = map.addListener('idle', () => {
        isProgrammaticPanRef.current = false
        if (panIdleListenerRef.current?.remove) {
          panIdleListenerRef.current.remove()
        }
        panIdleListenerRef.current = null
        if (panSuppressTimeoutRef.current) {
          clearTimeout(panSuppressTimeoutRef.current)
          panSuppressTimeoutRef.current = null
        }
      })

      // Fallback release in case idle does not fire (e.g. tiny/no-op pan).
      panSuppressTimeoutRef.current = setTimeout(() => {
        isProgrammaticPanRef.current = false
        panSuppressTimeoutRef.current = null
      }, PROGRAMMATIC_PAN_SUPPRESS_MS)

      // Only pan if it's slightly outside the center to prevent jitter on marker click
      map.panTo({
        lat: selectedListing.address.latitude,
        lng: selectedListing.address.longitude,
      })
    }
  }, [selectedListing, map])

  useEffect(() => {
    return () => {
      if (panIdleListenerRef.current?.remove) {
        panIdleListenerRef.current.remove()
      }
      if (panSuppressTimeoutRef.current) {
        clearTimeout(panSuppressTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
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
        <div className='absolute bottom-4 left-4 right-4 z-30 md:left-6 md:right-6 lg:top-6 lg:bottom-auto lg:left-auto lg:right-6 lg:w-[420px] xl:w-[460px]'>
          <div className='relative bg-background rounded-xl shadow-2xl border border-border/50'>
            <PropertyCard
              listing={selectedListing}
              className={`${isDesktopCard ? '' : 'compact '}border-0 shadow-none`}
              imageLayout='top'
              bottomContent={
                <Button
                  className='w-full shadow-sm'
                  variant='default'
                  size='sm'
                  asChild
                >
                  <Link
                    href={buildApartmentDetailRoute(
                      String(selectedListing.listingId),
                    )}
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    {tCommon('viewDetails')}
                  </Link>
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
  const [isListingsDrawerOpen, setIsListingsDrawerOpen] = useState(true)
  const [pendingViewport, setPendingViewport] = useState<MapViewport | null>(
    null,
  )
  const debouncedViewport = useDebounce(
    pendingViewport,
    MAP_INTERACTION_DEBOUNCE_MS,
  )

  const mapFilters = useMemo<MapFilters>(() => {
    const categoryIdQuery = Array.isArray(router.query.categoryId)
      ? router.query.categoryId[0]
      : router.query.categoryId
    const vipTypeQuery = Array.isArray(router.query.vipType)
      ? router.query.vipType[0]
      : router.query.vipType
    const verifiedOnlyQuery = Array.isArray(router.query.verifiedOnly)
      ? router.query.verifiedOnly[0]
      : router.query.verifiedOnly

    const parsedCategoryId = categoryIdQuery ? Number(categoryIdQuery) : NaN

    return {
      categoryId: Number.isFinite(parsedCategoryId)
        ? parsedCategoryId
        : undefined,
      vipType: vipTypeQuery as VipType | undefined,
      verifiedOnly: verifiedOnlyQuery === 'true',
    }
  }, [router.query.categoryId, router.query.vipType, router.query.verifiedOnly])

  useEffect(() => {
    if (!debouncedViewport) {
      return
    }

    const normalizedViewport = normalizeViewport(debouncedViewport)

    if (normalizedViewport.zoom < MIN_LISTING_FETCH_ZOOM) {
      setIsLoading(false)
      setError(null)
      setListings([])
      setTotalCount(0)
      setHasMore(false)
      return
    }

    let isSubscribed = true

    setIsLoading(true)
    setError(null)

    setListings([])
    setTotalCount(0)
    setHasMore(false)
    setSelectedListing(null)

    const fetchMapBoundsListings = async () => {
      try {
        const response = await ListingService.getMapBounds({
          ...normalizedViewport,
          limit: MAP_LISTINGS_LIMIT,
          verifiedOnly: mapFilters.verifiedOnly,
          categoryId: mapFilters.categoryId,
          vipType: mapFilters.vipType,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load properties')
        }

        if (!isSubscribed) {
          return
        }

        setListings(response.data.listings)
        setTotalCount(response.data.totalCount)
        setHasMore(response.data.hasMore)
      } catch (err) {
        if (!isSubscribed) {
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while loading properties',
        )
        setListings([])
        setTotalCount(0)
        setHasMore(false)
      } finally {
        if (isSubscribed) {
          setIsLoading(false)
        }
      }
    }

    fetchMapBoundsListings()

    return () => {
      isSubscribed = false
    }
  }, [debouncedViewport, mapFilters])

  const handleViewportChange = useCallback((viewport: MapViewport) => {
    setPendingViewport(viewport)
  }, [])

  const currentZoom = pendingViewport?.zoom ?? DEFAULT_ZOOM

  const handleMarkerClick = useCallback((listing: ListingDetail) => {
    setSelectedListing(listing)
  }, [])

  const handleCloseCard = useCallback(() => {
    setSelectedListing(null)
  }, [])

  return (
    <div
      className={`relative flex w-full ${MAP_HEIGHT} overflow-hidden bg-background`}
    >
      {/* Map Area */}
      <div className='flex-1 relative h-full'>
        <div className='absolute inset-y-0 left-0 z-40 pointer-events-none'>
          <aside
            className={`pointer-events-auto h-full w-[92vw] md:w-[600px] xl:w-[760px] max-w-[760px] border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
              isListingsDrawerOpen
                ? 'translate-x-0'
                : '-translate-x-[calc(100%+1rem)]'
            }`}
            aria-label={t('listingsPanelAriaLabel')}
          >
            <MapListingsPanelContent
              isLoading={isLoading}
              listings={listings}
              selectedListing={selectedListing}
              totalCount={totalCount}
              hasMore={hasMore}
              onSelectListing={handleMarkerClick}
              onClosePanel={() => setIsListingsDrawerOpen(false)}
              error={error}
              isBelowMinZoom={currentZoom < MIN_LISTING_FETCH_ZOOM}
              t={t}
              tCommon={tCommon}
            />
          </aside>
        </div>

        {!isListingsDrawerOpen && (
          <div className='absolute left-4 z-40 top-32 lg:top-20'>
            <Button
              variant='secondary'
              size='sm'
              className='shadow-lg'
              onClick={() => setIsListingsDrawerOpen(true)}
            >
              <ChevronsRight className='h-4 w-4 mr-2' />
              {t('properties')}
            </Button>
          </div>
        )}

        <APIProvider apiKey={ENV.GOOGLE_MAP_KEY}>
          <Map
            defaultCenter={VIETNAM_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            mapId={ENV.GOOGLE_MAP_KEY}
            disableDefaultUI={false}
            gestureHandling='greedy'
            className='w-full h-full outline-none'
            onClick={handleCloseCard}
          >
            <MapContent
              listings={listings}
              selectedListing={selectedListing}
              isLoading={isLoading}
              error={error}
              onViewportChange={handleViewportChange}
              onMarkerClick={handleMarkerClick}
              t={t}
              tCommon={tCommon}
            />
          </Map>
        </APIProvider>
      </div>
    </div>
  )
}

export default MapViewTemplate
