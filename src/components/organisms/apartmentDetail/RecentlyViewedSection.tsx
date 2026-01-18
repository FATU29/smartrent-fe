import React from 'react'
import { useTranslations } from 'next-intl'
import PropertyCard from '@/components/molecules/propertyCard'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import Link from 'next/link'
import type { ListingDetail } from '@/api/types'
import { mapRecentlyViewedToListing } from '@/utils/recentlyViewed/mapper'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/atoms/skeleton'

interface RecentlyViewedSectionProps {
  currentListingId?: string | number
}

const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  currentListingId,
}) => {
  const t = useTranslations()
  const { recentlyViewed, isLoading, refresh } = useRecentlyViewed()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const prevListingIdRef = React.useRef<string | number | undefined>(
    currentListingId,
  )

  React.useEffect(() => {
    if (
      currentListingId !== prevListingIdRef.current &&
      currentListingId &&
      refresh
    ) {
      prevListingIdRef.current = currentListingId
      refresh()
    }
  }, [currentListingId, refresh])

  React.useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })

    api.on('reInit', () => {
      setScrollSnaps(api.scrollSnapList())
    })
  }, [api])

  const filteredListings = currentListingId
    ? recentlyViewed.filter(
        (item) => String(item.listingId) !== String(currentListingId),
      )
    : recentlyViewed

  const listingsData = filteredListings.map((listing) =>
    mapRecentlyViewedToListing(listing),
  ) as ListingDetail[]

  const handleFavorite = () => {}

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    const target = e.target as HTMLElement
    const clickedButton =
      target.closest('[data-action-button]') ||
      target.closest('button') ||
      target.closest('[role="button"]')

    if (clickedButton) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className='mb-8 sm:mb-10'>
        <div className='flex items-center gap-3 mb-4 sm:mb-5'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600'>
            <History className='w-5 h-5 text-white' />
          </div>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='ml-auto h-5 w-8' />
        </div>

        <Carousel
          className='group'
          opts={{ align: 'start', loop: false }}
          setApi={setApi}
        >
          <CarouselContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <CarouselItem
                key={index}
                className='basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <div className='space-y-2'>
                  <Skeleton className='aspect-[4/3] rounded-lg w-full' />
                  <div className='p-3 space-y-2'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                    <Skeleton className='h-5 w-1/3' />
                    <div className='flex gap-2'>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>
    )
  }

  // Don't show section if no listings
  if (filteredListings.length === 0) {
    return null
  }

  return (
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-center gap-3 mb-4 sm:mb-5'>
        <div className='p-2 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600'>
          <History className='w-5 h-5 text-white' />
        </div>
        <h2 className='text-xl sm:text-2xl font-semibold'>
          {t('apartmentDetail.recentlyViewed.title') || 'Tin đăng đã xem'}
        </h2>
        <span className='ml-auto text-sm font-medium text-slate-600 dark:text-slate-400'>
          {listingsData.length}
        </span>
      </div>

      <Carousel
        className='group'
        opts={{ align: 'start', loop: false }}
        setApi={setApi}
      >
        <CarouselContent>
          {listingsData.map((listing) => (
            <CarouselItem
              key={listing.listingId}
              className='basis-full sm:basis-1/2 lg:basis-1/3'
            >
              <Link
                href={`/listing-detail/${listing.listingId}`}
                className='block h-full'
                onClick={handleLinkClick}
              >
                <PropertyCard listing={listing} onFavorite={handleFavorite} />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='hidden sm:flex -left-12' />
        <CarouselNext className='hidden sm:flex -right-12' />

        {/* Indicators - only show on mobile/tablet */}
        <div className='flex xl:hidden justify-center gap-2 mt-4'>
          {scrollSnaps.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type='button'
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                current === index
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}

export default RecentlyViewedSection
