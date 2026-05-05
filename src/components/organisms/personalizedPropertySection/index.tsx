import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import PropertyCard from '@/components/molecules/propertyCard'
import { useAuth } from '@/hooks/useAuth'
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'
import { cn } from '@/lib/utils'

const PersonalizedPropertySection: React.FC = () => {
  const t = useTranslations('homePage.personalized')
  const { isAuthenticated } = useAuth()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const { data, isLoading } = usePersonalizedRecommendations(
    10,
    isAuthenticated,
  )

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

  if (!isAuthenticated) {
    return null
  }

  const listings = (data?.listings || []).filter(
    (listing) => !!listing.listingId,
  )

  if (!isLoading && listings.length === 0) {
    return null
  }

  const handleFavorite = () => {}

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const clickedButton =
      target.closest('[data-action-button]') ||
      target.closest('button') ||
      target.closest('[role="button"]')

    if (clickedButton) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const renderCard = (listing: (typeof listings)[number]) => (
    <Link
      href={`/listing-detail/${listing.listingId}`}
      className='block w-full'
      onClick={handleLinkClick}
    >
      <PropertyCard
        listing={listing}
        onFavorite={handleFavorite}
        className='h-full'
      />
    </Link>
  )

  const displayedListings = listings.slice(0, 10)

  return (
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-start gap-3 mb-5 sm:mb-6'>
        <div className='w-1 h-7 sm:h-8 rounded-full bg-primary mt-0.5' />
        <div>
          <Typography variant='sectionTitle' className='text-foreground'>
            {t('title')}
          </Typography>
          <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>
      </div>

      <Carousel
        className='group'
        opts={{ align: 'start', loop: false }}
        setApi={setApi}
      >
        <CarouselContent>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <CarouselItem
                  key={`personalized-skeleton-${index}`}
                  className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 min-w-[320px] sm:min-w-[360px] flex'
                >
                  <div className='w-full space-y-3'>
                    <Skeleton className='aspect-[4/3] rounded-lg w-full' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-20 w-full' />
                  </div>
                </CarouselItem>
              ))
            : displayedListings.map((listing) => (
                <CarouselItem
                  key={listing.listingId}
                  className='basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 min-w-[320px] sm:min-w-[360px] flex'
                >
                  {renderCard(listing)}
                </CarouselItem>
              ))}
        </CarouselContent>

        <CarouselPrevious className='hidden sm:flex -left-12' />
        <CarouselNext className='hidden sm:flex -right-12' />

        <div className='flex xl:hidden justify-center gap-2 mt-4'>
          {scrollSnaps.map((_, index) => (
            <button
              key={`personalized-indicator-${index}`}
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

export default PersonalizedPropertySection
