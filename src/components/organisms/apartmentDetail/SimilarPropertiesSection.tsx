import React from 'react'
import { useTranslations } from 'next-intl'
import PropertyCard from '@/components/molecules/propertyCard'
import Link from 'next/link'
import type { ListingDetail } from '@/api/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { Skeleton } from '@/components/atoms/skeleton'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimilarPropertiesSectionProps {
  listings: ListingDetail[]
  onPropertyClick?: (listing: ListingDetail) => void
  isLoading?: boolean
  showEmptyState?: boolean
}

const SimilarPropertiesSection: React.FC<SimilarPropertiesSectionProps> = ({
  listings,
  onPropertyClick,
  isLoading,
  showEmptyState,
}) => {
  const t = useTranslations()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

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

  const handleFavorite = () => {}

  if (isLoading) {
    const skeletonItems = Array.from({ length: 4 })
    return (
      <section className='mb-8 sm:mb-10'>
        <div className='flex items-center gap-3 mb-4 sm:mb-5'>
          <div className='p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600'>
            <LayoutGrid className='w-5 h-5 text-white' />
          </div>
          <h2 className='text-xl sm:text-2xl font-semibold'>
            {t('apartmentDetail.sections.similarProperties')}
          </h2>
        </div>
        <Carousel
          className='group'
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
        >
          <CarouselContent>
            {skeletonItems.map((_, index) => (
              <CarouselItem
                key={index}
                className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
              >
                <div className='w-full space-y-2 md:space-y-3'>
                  <Skeleton className='aspect-[4/3] rounded-lg w-full' />
                  <div className='p-3 md:p-4 space-y-2 md:space-y-3'>
                    <Skeleton className='h-3 w-3/4 md:h-4' />
                    <Skeleton className='h-2.5 w-1/2 md:h-3' />
                    <Skeleton className='h-4 w-1/3 md:h-6' />
                  </div>
                </div>
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

  if (showEmptyState && (!listings || listings.length === 0)) {
    return null // Don't show section if no listings and empty state is enabled
  }

  if (!listings || listings.length === 0) {
    return null
  }

  return (
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-center gap-3 mb-4 sm:mb-5'>
        <div className='p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600'>
          <LayoutGrid className='w-5 h-5 text-white' />
        </div>
        <h2 className='text-xl sm:text-2xl font-semibold'>
          {t('apartmentDetail.sections.similarProperties')}
        </h2>
        <span className='ml-auto text-sm font-medium text-green-600 dark:text-green-400'>
          {listings.length}
        </span>
      </div>

      <Carousel
        className='group'
        opts={{ align: 'start', loop: true }}
        setApi={setApi}
      >
        <CarouselContent>
          {listings.map((listing) => (
            <CarouselItem
              key={listing.listingId}
              className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
            >
              <Link
                href={`/listing-detail/${listing.listingId}`}
                className='block h-full'
                onClick={() => onPropertyClick?.(listing)}
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
              key={`indicator-mobile-${index}`}
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

export default SimilarPropertiesSection
