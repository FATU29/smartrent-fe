import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import PropertyCard from '@/components/molecules/propertyCard'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { Skeleton } from '@/components/atoms/skeleton'
import { VipType } from '@/api/types'
import { cn } from '@/lib/utils'
import { useRecommendedListingsByVip } from '@/hooks/useListings/useRecommendedListingsByVip'

interface VipPropertySectionProps {
  vipType: VipType
  mode?: 'vip' | 'newest'
}

const VIP_CONFIG: Record<string, { titleClassName: string; titleKey: string }> =
  {
    DIAMOND: {
      titleClassName: 'text-foreground',
      titleKey: 'homePage.vipSections.diamond',
    },
    GOLD: {
      titleClassName: 'text-foreground',
      titleKey: 'homePage.vipSections.gold',
    },
    SILVER: {
      titleClassName: 'text-foreground',
      titleKey: 'homePage.vipSections.silver',
    },
    NORMAL: {
      titleClassName: 'text-foreground',
      titleKey: 'homePage.vipSections.normal',
    },
    NEWEST: {
      titleClassName: 'text-foreground',
      titleKey: 'homePage.vipSections.newest',
    },
  }

const VipPropertySection: React.FC<VipPropertySectionProps> = ({
  vipType,
  mode = 'vip',
}) => {
  const t = useTranslations()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const isNewest = mode === 'newest'
  const config = VIP_CONFIG[isNewest ? 'NEWEST' : vipType]

  // Fetch listings client-side
  const { listings, isLoading } = useRecommendedListingsByVip({
    vipType,
    page: 1,
    size: 10,
    enabled: true,
    ...(isNewest ? { sortBy: 'NEWEST' } : {}),
  })

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

  if (isLoading) {
    const skeletonItems = Array.from({ length: 4 })
    return (
      <section className='mb-10 sm:mb-14'>
        <div className='flex items-center gap-3 mb-5 sm:mb-6'>
          <div className='w-1 h-7 sm:h-8 rounded-full bg-primary' />
          <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
            {t(config.titleKey)}
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
                className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 min-w-[320px] sm:min-w-[360px]'
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
                key={index}
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

  if (!listings || listings.length === 0) {
    return null // Don't show section if no listings
  }

  return (
    <section className='mb-10 sm:mb-14'>
      <div className='flex items-center justify-between mb-5 sm:mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-7 sm:h-8 rounded-full bg-primary' />
          <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
            {t(config.titleKey)}
          </h2>
        </div>
      </div>

      <Carousel
        className='group'
        opts={{ align: 'start', loop: true }}
        setApi={setApi}
      >
        <CarouselContent className='items-stretch'>
          {listings
            .filter((listing) => !!listing.listingId)
            .map((listing) => (
              <CarouselItem
                key={listing.listingId}
                className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 min-w-[320px] sm:min-w-[360px] flex'
              >
                <Link
                  href={`/listing-detail/${listing.listingId}`}
                  className='block w-full'
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
              key={index}
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

export default VipPropertySection
