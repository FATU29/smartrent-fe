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
import { Crown, Sparkles, Medal, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecommendedListingsByVip } from '@/hooks/useListings/useRecommendedListingsByVip'

interface VipPropertySectionProps {
  vipType: VipType
}

const VIP_CONFIG = {
  DIAMOND: {
    icon: Crown,
    gradient: 'from-blue-500 to-purple-600',
    bgGradient:
      'from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    titleKey: 'homePage.vipSections.diamond',
  },
  GOLD: {
    icon: Sparkles,
    gradient: 'from-yellow-500 to-orange-600',
    bgGradient:
      'from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    titleKey: 'homePage.vipSections.gold',
  },
  SILVER: {
    icon: Medal,
    gradient: 'from-gray-400 to-gray-600',
    bgGradient:
      'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
    textColor: 'text-gray-600 dark:text-gray-400',
    titleKey: 'homePage.vipSections.silver',
  },
  NORMAL: {
    icon: Star,
    gradient: 'from-slate-400 to-slate-600',
    bgGradient:
      'from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    titleKey: 'homePage.vipSections.normal',
  },
}

const VipPropertySection: React.FC<VipPropertySectionProps> = ({ vipType }) => {
  const t = useTranslations()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const config = VIP_CONFIG[vipType]
  const Icon = config.icon

  // Fetch listings client-side
  const { listings, isLoading } = useRecommendedListingsByVip({
    vipType,
    page: 1,
    size: 10,
    enabled: true,
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
      <section className='mb-8 sm:mb-10'>
        <div className='flex items-center gap-3 mb-4 sm:mb-5'>
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}
          >
            <Icon className='w-5 h-5 text-white' />
          </div>
          <h2 className='text-xl sm:text-2xl font-semibold'>
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
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-center gap-3 mb-4 sm:mb-5'>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient}`}>
          <Icon className='w-5 h-5 text-white' />
        </div>
        <h2 className='text-xl sm:text-2xl font-semibold'>
          {t(config.titleKey)}
        </h2>
        <span className={`ml-auto text-sm font-medium ${config.textColor}`}>
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
