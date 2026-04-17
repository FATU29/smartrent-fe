import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import PropertyCard from '@/components/molecules/propertyCard'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import { Skeleton } from '@/components/atoms/skeleton'

const PersonalizedPropertySection: React.FC = () => {
  const t = useTranslations('homePage.personalized')
  const isMobile = useIsMobile()
  const { isAuthenticated } = useAuth()

  const { data, isLoading } = usePersonalizedRecommendations(5, isAuthenticated)

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

  const renderCard = (
    listing: (typeof listings)[number],
    extraClassName?: string,
  ) => (
    <Link
      href={`/listing-detail/${listing.listingId}`}
      className={extraClassName || 'block h-full'}
      onClick={handleLinkClick}
    >
      <PropertyCard
        listing={listing}
        onFavorite={handleFavorite}
        className='h-full'
      />
    </Link>
  )

  const desktopListings = listings.slice(0, 5)

  return (
    <section className='mb-10 sm:mb-14'>
      <div className='flex items-start gap-3 mb-5 sm:mb-6'>
        <div className='w-1 h-7 sm:h-8 rounded-full bg-primary mt-0.5' />
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
            {t('title')}
          </h2>
          <p className='text-sm text-muted-foreground mt-1'>{t('subtitle')}</p>
        </div>
      </div>

      {isLoading ? (
        isMobile ? (
          <div className='flex gap-3 overflow-hidden'>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className='w-[78%] shrink-0 space-y-3'>
                <Skeleton className='aspect-[4/3] rounded-lg w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-5'>
            <Skeleton className='h-[260px] rounded-xl xl:col-span-4' />
            <Skeleton className='h-[260px] rounded-xl xl:col-span-4' />
            <Skeleton className='h-[260px] rounded-xl xl:col-span-4' />
            <Skeleton className='h-[260px] rounded-xl xl:col-span-4 xl:col-start-3' />
            <Skeleton className='h-[260px] rounded-xl xl:col-span-4 xl:col-start-7' />
          </div>
        )
      ) : isMobile ? (
        <Carousel
          opts={{ align: 'start', loop: false, dragFree: true }}
          className='w-full'
        >
          <CarouselContent className='-ml-3'>
            {listings.map((listing) => (
              <CarouselItem
                key={listing.listingId}
                className='pl-3 basis-[85%] min-[480px]:basis-[70%]'
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
        </Carousel>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-5'>
          {desktopListings[0] && (
            <div className='xl:col-span-4'>
              {renderCard(desktopListings[0])}
            </div>
          )}
          {desktopListings[1] && (
            <div className='xl:col-span-4'>
              {renderCard(desktopListings[1])}
            </div>
          )}
          {desktopListings[2] && (
            <div className='xl:col-span-4'>
              {renderCard(desktopListings[2])}
            </div>
          )}
          {desktopListings[3] && (
            <div className='xl:col-span-4 xl:col-start-3'>
              {renderCard(desktopListings[3])}
            </div>
          )}
          {desktopListings[4] && (
            <div className='xl:col-span-4 xl:col-start-7'>
              {renderCard(desktopListings[4])}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default PersonalizedPropertySection
