import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps'
import { MarkerClusterer, type Marker } from '@googlemaps/markerclusterer'
import { Button } from '@/components/atoms/button'
import { useDebounce } from '@/hooks/useDebounce'
import {
  Loader2,
  ExternalLink,
  ChevronsRight,
  X,
  LocateFixed,
  MapPin,
} from 'lucide-react'
import { ENV } from '@/constants/env'
import { useLocationContext } from '@/contexts/location'
import { buildApartmentDetailRoute } from '@/constants/route'
import { ListingDetail, VipType } from '@/api/types/property.type'
import MapMarker from '@/components/molecules/mapMarker'
import MapPropertyCard from '@/components/molecules/mapPropertyCard'
import { ListingService } from '@/api/services/listing.service'
import { Typography } from '@/components/atoms/typography'

// Fallback center used when the device location is unavailable (Đà Nẵng).
const VIETNAM_CENTER = { lat: 16.0544, lng: 108.2022 }
const DEFAULT_ZOOM = 12
// Zoom applied when centering on the user's device location so nearby
// listings load immediately (must be >= MIN_LISTING_FETCH_ZOOM).
const USER_LOCATION_ZOOM = 14
const MAP_HEIGHT = 'h-[calc(100vh-80px)]'
const MAP_INTERACTION_DEBOUNCE_MS = 1000
const MAP_LISTINGS_LIMIT = 200
// Max cards shown in the side panel at once (the map itself shows every cached
// pin via clustering; the list stays bounded for scroll performance).
const SIDEBAR_LISTINGS_LIMIT = 200
// Ordering for the in-view set: VIP tiers first so the panel surfaces the most
// important listings, then stable by id.
const VIP_RENDER_PRIORITY: Record<VipType, number> = {
  DIAMOND: 0,
  GOLD: 1,
  SILVER: 2,
  NORMAL: 3,
}
const MIN_LISTING_FETCH_ZOOM = 11
const MAP_BOUNDS_COORDINATE_PRECISION = 4
// Cap on how many fully-loaded viewports we remember for the "skip already
// loaded" check, so the list can't grow without bound over a long session.
const MAX_COMPLETED_REGIONS = 60
// Slack when testing whether one bounding box contains another, to absorb the
// rounding applied by normalizeViewport.
const BOUNDS_EPSILON = 1e-6
const PROGRAMMATIC_PAN_SUPPRESS_MS = 600
// Selected marker is lifted above the others so it is never hidden when pins
// overlap.
const SELECTED_MARKER_Z_INDEX = 9999

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

// True when `outer` fully encloses `inner`. Used to skip a fetch when the new
// viewport sits entirely inside an area we have already loaded completely.
const boundsContain = (outer: MapViewport, inner: MapViewport): boolean =>
  outer.swLat <= inner.swLat + BOUNDS_EPSILON &&
  outer.swLng <= inner.swLng + BOUNDS_EPSILON &&
  outer.neLat >= inner.neLat - BOUNDS_EPSILON &&
  outer.neLng >= inner.neLng - BOUNDS_EPSILON

// True when a listing's coordinates fall inside the given viewport.
const listingInViewport = (
  listing: ListingDetail,
  viewport: MapViewport,
): boolean => {
  const { latitude, longitude } = listing.address
  return (
    latitude >= viewport.swLat &&
    latitude <= viewport.neLat &&
    longitude >= viewport.swLng &&
    longitude <= viewport.neLng
  )
}

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
  const router = useRouter()

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
                {/* Ensure standard click won't bubble up improperly from the card */}
                <div className='pointer-events-none flex-1'>
                  <MapPropertyCard listing={listing} />
                </div>

                <div className='px-4 pb-4 pt-0'>
                  <div className='flex items-center gap-2 pointer-events-auto'>
                    <Button
                      size='sm'
                      className='flex-1'
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(
                          buildApartmentDetailRoute(String(listing.listingId)),
                        )
                      }}
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      {tCommon('viewDetails')}
                    </Button>
                    {/* Focus this listing's marker on the map (pan + animate) */}
                    <Button
                      type='button'
                      size='icon'
                      variant='secondary'
                      className='shrink-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectListing(listing)
                      }}
                      aria-label={t('showOnMap')}
                      title={t('showOnMap')}
                    >
                      <MapPin className='h-4 w-4' />
                    </Button>
                  </div>
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

interface ClusteredMarkerProps {
  listing: ListingDetail
  isSelected: boolean
  onMarkerClick: (listing: ListingDetail) => void
  setMarkerRef: (marker: Marker | null, listingId: number) => void
}

// A single map pin. Extracted (and memoized) so its `ref` callback identity is
// stable across parent re-renders — an inline ref would make React detach and
// reattach every marker on each render, thrashing the clusterer.
const ClusteredMarker: React.FC<ClusteredMarkerProps> = React.memo(
  ({ listing, isSelected, onMarkerClick, setMarkerRef }) => {
    const handleRef = useCallback(
      (marker: Marker | null) => setMarkerRef(marker, listing.listingId),
      [setMarkerRef, listing.listingId],
    )

    return (
      <AdvancedMarker
        ref={handleRef}
        position={{
          lat: listing.address.latitude,
          lng: listing.address.longitude,
        }}
        zIndex={isSelected ? SELECTED_MARKER_Z_INDEX : undefined}
        onClick={(event) => {
          // Stop the event so the map's own onClick (which closes the card)
          // does not also fire and immediately clear the selection.
          event.stop()
          onMarkerClick(listing)
        }}
      >
        <MapMarker
          vipType={listing.vipType}
          isSelected={isSelected}
          onClick={() => onMarkerClick(listing)}
        />
      </AdvancedMarker>
    )
  },
)
ClusteredMarker.displayName = 'ClusteredMarker'

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
  const router = useRouter()
  const {
    coordinates: userCoordinates,
    isLoading: isLocating,
    requestLocation,
  } = useLocationContext()
  const hasCenteredOnUserRef = useRef(false)
  const isProgrammaticPanRef = useRef(false)
  const panIdleListenerRef = useRef<{ remove: () => void } | null>(null)
  const panSuppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  // Marker clustering: collect the rendered AdvancedMarker elements by
  // listingId and feed them to a MarkerClusterer. Dense areas group into
  // clusters instead of rendering every pin, so the full cached set can be
  // shown at any zoom without overflowing Google's marker.js — and the pins no
  // longer change as you zoom the same spot.
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const [markerElements, setMarkerElements] = useState<Record<string, Marker>>(
    {},
  )

  const setMarkerRef = useCallback(
    (marker: Marker | null, listingId: number) => {
      const key = String(listingId)
      setMarkerElements((prev) => {
        if (marker && prev[key]) return prev
        if (!marker && !prev[key]) return prev
        if (marker) {
          return { ...prev, [key]: marker }
        }
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    [],
  )

  // Lazily create the clusterer once the map is ready, then keep its marker set
  // in sync with what is rendered. Keyed on both `map` and `markerElements` so
  // markers collected before the map loads are still added once it appears.
  useEffect(() => {
    if (!map) return
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map })
    }
    const clusterer = clustererRef.current
    clusterer.clearMarkers()
    clusterer.addMarkers(Object.values(markerElements))
  }, [map, markerElements])

  // Detach the clusterer when the map view unmounts.
  useEffect(() => {
    return () => {
      clustererRef.current?.clearMarkers()
      clustererRef.current = null
    }
  }, [])

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

  const centerOnUser = useCallback(
    (coords: { latitude: number; longitude: number }) => {
      if (!map) return
      map.panTo({ lat: coords.latitude, lng: coords.longitude })
      if ((map.getZoom() ?? 0) < USER_LOCATION_ZOOM) {
        map.setZoom(USER_LOCATION_ZOOM)
      }
    },
    [map],
  )

  // Ask for the device location on first load so the map opens near the user
  // instead of always defaulting to Đà Nẵng. Falls back to the default center
  // when the user denies the prompt or geolocation is unavailable.
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  // Recenter once the first location fix arrives.
  useEffect(() => {
    if (userCoordinates && map && !hasCenteredOnUserRef.current) {
      hasCenteredOnUserRef.current = true
      centerOnUser(userCoordinates)
    }
  }, [userCoordinates, map, centerOnUser])

  const handleLocateClick = useCallback(() => {
    hasCenteredOnUserRef.current = false
    if (userCoordinates) {
      centerOnUser(userCoordinates)
    }
    requestLocation()
  }, [userCoordinates, centerOnUser, requestLocation])

  // Initial fetch triggering
  useEffect(() => {
    handleMapChange()
  }, [handleMapChange])

  // Report the viewport on `idle` (fires once when the map stops moving)
  // rather than on `bounds_changed` (fires on every frame while panning).
  // This avoids re-rendering the whole map/sidebar on each drag frame, which
  // is what made light panning feel laggy.
  useEffect(() => {
    if (!map) return
    const listener = map.addListener('idle', handleMapChange)
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
      {/* My location control */}
      <div className='absolute top-4 right-16 z-20'>
        <Button
          type='button'
          variant='secondary'
          size='icon'
          className='h-10 w-10 rounded-full shadow-lg'
          onClick={handleLocateClick}
          disabled={isLocating}
          aria-label={t('myLocation')}
          title={t('myLocation')}
        >
          {isLocating ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <LocateFixed className='h-5 w-5' />
          )}
        </Button>
      </div>

      {/* Loading Indicator (Top Center) - Visible when loading */}
      {isLoading && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
          <div className='bg-card/90 backdrop-blur-md shadow-lg rounded-full px-5 py-2.5 flex items-center gap-3 border border-border/50'>
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

      {/* Selected property card: bottom sheet on mobile, right-side card on desktop */}
      {selectedListing && (
        <div className='absolute bottom-4 left-4 right-4 z-30 md:left-6 md:right-6 lg:top-20 lg:bottom-auto lg:left-auto lg:right-6 lg:w-[420px] xl:w-[460px]'>
          <div className='relative overflow-hidden bg-background rounded-xl shadow-2xl border border-border/50'>
            <MapPropertyCard
              listing={selectedListing}
              bottomContent={
                <Button
                  className='w-full shadow-sm'
                  variant='default'
                  size='sm'
                  onClick={() =>
                    router.push(
                      buildApartmentDetailRoute(
                        String(selectedListing.listingId),
                      ),
                    )
                  }
                >
                  <ExternalLink className='h-4 w-4 mr-2' />
                  {tCommon('viewDetails')}
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Markers (grouped by the clusterer above) */}
      {listings.map((listing) => (
        <ClusteredMarker
          key={listing.listingId}
          listing={listing}
          isSelected={selectedListing?.listingId === listing.listingId}
          onMarkerClick={onMarkerClick}
          setMarkerRef={setMarkerRef}
        />
      ))}
    </>
  )
}

const MapViewTemplate: React.FC = () => {
  const router = useRouter()
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')
  // Accumulating cache of every listing we have fetched this session, keyed by
  // listingId. Markers are rendered from here so panning back to an
  // already-loaded area is instant and never flickers. A ref (not state) holds
  // the data; `cacheVersion` is bumped to trigger re-renders when it mutates.
  const listingsCacheRef = useRef<Map<number, ListingDetail>>(
    new globalThis.Map(),
  )
  // Viewports we have loaded in full (backend reported no more results). A new
  // viewport contained in one of these is served from cache with no network.
  const completedRegionsRef = useRef<MapViewport[]>([])
  // Filter set the cache was populated under; when it changes the cache is reset.
  const activeFilterKeyRef = useRef<string | null>(null)
  const [cacheVersion, setCacheVersion] = useState(0)
  const [currentViewport, setCurrentViewport] = useState<MapViewport | null>(
    null,
  )
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

  // Stable signature of the active filters. When it changes the accumulated
  // cache no longer applies and must be discarded before the next fetch.
  const filterKey = useMemo(
    () =>
      `${mapFilters.categoryId ?? ''}|${mapFilters.vipType ?? ''}|${mapFilters.verifiedOnly}`,
    [mapFilters],
  )

  const currentZoom = currentViewport?.zoom ?? DEFAULT_ZOOM
  const isBelowMinZoom = currentZoom < MIN_LISTING_FETCH_ZOOM

  // Listings to show right now: everything in the cache that falls inside the
  // current viewport. Derived from the cache (not replaced on every fetch) so
  // pins already loaded stay visible while neighbouring areas load.
  const visibleListings = useMemo<ListingDetail[]>(() => {
    if (!currentViewport || isBelowMinZoom) {
      return []
    }
    const inView: ListingDetail[] = []
    listingsCacheRef.current.forEach((listing) => {
      if (listingInViewport(listing, currentViewport)) {
        inView.push(listing)
      }
    })
    // Return every cached pin in view (clustering renders them all without
    // overflow), ordered VIP-first then stable by id so the set never reshuffles
    // or swaps marker types as the same area is zoomed in and out.
    inView.sort((a, b) => {
      const priorityDelta =
        VIP_RENDER_PRIORITY[a.vipType] - VIP_RENDER_PRIORITY[b.vipType]
      return priorityDelta !== 0 ? priorityDelta : a.listingId - b.listingId
    })
    return inView
    // cacheVersion bumps whenever the (ref-held) cache mutates, forcing recompute.
  }, [cacheVersion, currentViewport, isBelowMinZoom])

  // The side panel stays bounded for scroll performance; the map shows all pins.
  const sidebarListings = useMemo(
    () => visibleListings.slice(0, SIDEBAR_LISTINGS_LIMIT),
    [visibleListings],
  )

  useEffect(() => {
    if (!debouncedViewport) {
      return
    }

    const normalizedViewport = normalizeViewport(debouncedViewport)

    // Filters changed since the cache was filled — drop it so stale pins from a
    // previous filter set don't linger.
    if (activeFilterKeyRef.current !== filterKey) {
      activeFilterKeyRef.current = filterKey
      listingsCacheRef.current.clear()
      completedRegionsRef.current = []
      setCacheVersion((version) => version + 1)
    }

    if (normalizedViewport.zoom < MIN_LISTING_FETCH_ZOOM) {
      setIsLoading(false)
      setError(null)
      return
    }

    // Already fully loaded this area — serve from cache, no network call. This
    // is what stops re-loading points the UI already has.
    const alreadyCovered = completedRegionsRef.current.some((region) =>
      boundsContain(region, normalizedViewport),
    )
    if (alreadyCovered) {
      setIsLoading(false)
      setError(null)
      setHasMore(false)
      return
    }

    let isSubscribed = true

    setIsLoading(true)
    setError(null)

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

        // Merge (not replace) so previously loaded pins are retained.
        const cache = listingsCacheRef.current
        response.data.listings.forEach((listing) => {
          cache.set(listing.listingId, listing)
        })

        // Remember a region only when the backend returned it in full. A capped
        // region is incomplete, so it must be re-queried when the user zooms in.
        if (!response.data.hasMore) {
          const regions = completedRegionsRef.current
          regions.push(normalizedViewport)
          if (regions.length > MAX_COMPLETED_REGIONS) {
            regions.splice(0, regions.length - MAX_COMPLETED_REGIONS)
          }
        }

        setCacheVersion((version) => version + 1)
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
  }, [debouncedViewport, mapFilters, filterKey])

  const handleViewportChange = useCallback((viewport: MapViewport) => {
    // Update the viewport used for filtering immediately (so cached pins for a
    // revisited area appear at once) and queue the debounced fetch.
    setCurrentViewport(normalizeViewport(viewport))
    setPendingViewport(viewport)
  }, [])

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
              listings={sidebarListings}
              selectedListing={selectedListing}
              totalCount={totalCount}
              hasMore={hasMore}
              onSelectListing={handleMarkerClick}
              onClosePanel={() => setIsListingsDrawerOpen(false)}
              error={error}
              isBelowMinZoom={isBelowMinZoom}
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
              listings={visibleListings}
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
