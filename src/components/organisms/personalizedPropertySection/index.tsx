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

  return (
    <section className='py-6 sm:py-8'>
      <div className='flex flex-col gap-1 mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
          {t('title')}
        </h2>
        <p className='text-sm text-muted-foreground'>{t('subtitle')}</p>
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
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'>
            <Skeleton className='h-[520px] rounded-xl' />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className='h-[250px] rounded-xl' />
              ))}
            </div>
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
                  <PropertyCard
                    listing={listing}
                    onFavorite={handleFavorite}
                    className='compact h-full min-h-[500px]'
                    imageLayout='top'
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'>
          {listings[0] && (
            <Link
              href={`/listing-detail/${listings[0].listingId}`}
              className='block h-full'
              onClick={handleLinkClick}
            >
              <PropertyCard
                listing={listings[0]}
                onFavorite={handleFavorite}
                className='compact h-full min-h-[520px]'
                imageLayout='top'
              />
            </Link>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            {listings.slice(1, 5).map((listing) => (
              <Link
                key={listing.listingId}
                href={`/listing-detail/${listing.listingId}`}
                className='block h-full'
                onClick={handleLinkClick}
              >
                <PropertyCard
                  listing={listing}
                  onFavorite={handleFavorite}
                  className='compact h-full min-h-[500px]'
                  imageLayout='top'
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default PersonalizedPropertySection
