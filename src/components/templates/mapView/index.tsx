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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from '@/components/atoms/dialog'
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  X,
  List as ListIcon,
  ChevronLeft,
} from 'lucide-react'
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
const MIN_LISTING_FETCH_ZOOM = 10

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
  isBelowMinZoom: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
}

const MapListingsPanelContent: React.FC<MapSidebarProps> = ({
  isLoading,
  listings,
  selectedListing,
  totalCount,
  hasMore,
  onSelectListing,
  onViewDetails,
  onBackToList,
  error,
  isBelowMinZoom,
  t,
}) => {
  return (
    <div className='flex flex-col h-full bg-background overflow-hidden'>
      <div className='p-5 border-b border-border bg-card'>
        <div className='flex items-center justify-between gap-3 mb-4'>
          <Button
            variant='secondary'
            size='sm'
            onClick={onBackToList}
            className='w-fit shadow-sm'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            {t('backToList')}
          </Button>
        </div>
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
        {!isLoading && isBelowMinZoom && (
          <Typography variant='small' className='text-muted-foreground mt-1'>
            Zoom in to load listings in this area.
          </Typography>
        )}
        {!isLoading &&
          !isBelowMinZoom &&
          hasMore &&
          totalCount > listings.length && (
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
  onOpenListingsDrawer: () => void
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
  onOpenListingsDrawer,
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
      <div className='absolute top-20 right-4 z-40'>
        <Button
          variant='secondary'
          size='sm'
          className='shadow-lg'
          onClick={onOpenListingsDrawer}
        >
          <ListIcon className='h-4 w-4 mr-2' />
          {t('properties')}
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
  const [isListingsDrawerOpen, setIsListingsDrawerOpen] = useState(true)
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM)

  const fetchListings = useCallback(
    async (
      neLat: number,
      neLng: number,
      swLat: number,
      swLng: number,
      zoom: number,
    ) => {
      setCurrentZoom(zoom)

      // Don't fetch if too zoomed out
      if (zoom < MIN_LISTING_FETCH_ZOOM) {
        setError(null)
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
      {/* Map Area */}
      <div className='flex-1 relative h-full'>
        <Dialog
          open={isListingsDrawerOpen}
          onOpenChange={setIsListingsDrawerOpen}
        >
          <DialogContent
            showCloseButton={false}
            className='!top-0 !left-0 !translate-x-0 !translate-y-0 h-full w-[92vw] md:w-[540px] xl:w-[680px] max-w-[680px] rounded-none border-r border-border p-0 data-[state=open]:slide-in-from-left-3 data-[state=closed]:slide-out-to-left-3'
          >
            <VisuallyHidden>
              <DialogTitle>Map Listings</DialogTitle>
            </VisuallyHidden>
            <div className='absolute right-4 top-4 z-10'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsListingsDrawerOpen(false)}
                aria-label='Close listings panel'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
            <MapListingsPanelContent
              isLoading={isLoading}
              listings={listings}
              selectedListing={selectedListing}
              totalCount={totalCount}
              hasMore={hasMore}
              onSelectListing={handleMarkerClick}
              onViewDetails={handleViewDetails}
              onBackToList={handleBackToList}
              error={error}
              isBelowMinZoom={currentZoom < MIN_LISTING_FETCH_ZOOM}
              t={t}
            />
          </DialogContent>
        </Dialog>

        {!isListingsDrawerOpen && (
          <div className='absolute top-20 left-4 z-40 hidden lg:block'>
            <Button
              variant='secondary'
              size='sm'
              className='shadow-lg'
              onClick={() => setIsListingsDrawerOpen(true)}
            >
              <ChevronLeft className='h-4 w-4 mr-2' />
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
              onOpenListingsDrawer={() => setIsListingsDrawerOpen(true)}
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
