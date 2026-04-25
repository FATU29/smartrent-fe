import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import LocationBrowseSectionSkeleton from './LocationBrowseSectionSkeleton'
import type { ProvinceStatsItem } from '@/api/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import Link from 'next/link'
import { PUBLIC_ROUTES } from '@/constants/route'
import { imageMap, imageMapByProvinceId } from '@/utils/mapper'
import { cn } from '@/lib/utils'

interface LocationBrowseSectionProps {
  cities?: ProvinceStatsItem[]
  loading?: boolean
}

const LocationBrowseSection: React.FC<LocationBrowseSectionProps> = ({
  cities,
  loading = false,
}) => {
  const t = useTranslations('homePage.locations')
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

  // Show skeleton when loading
  if (loading) {
    return <LocationBrowseSectionSkeleton />
  }

  // Show empty state when no data
  const uniqueCities = cities
    ? cities.filter(
        (city, idx, arr) =>
          arr.findIndex((c) => c.provinceId === city.provinceId) === idx,
      )
    : []

  if (!cities || uniqueCities.length === 0) {
    return (
      <section className='mb-10 sm:mb-14'>
        <div className='flex items-center gap-3 mb-5 sm:mb-6'>
          <div className='w-1 h-7 sm:h-8 rounded-full bg-primary' />
          <Typography
            variant='h2'
            className='text-xl sm:text-2xl font-bold text-foreground'
          >
            {t('title')}
          </Typography>
        </div>
        <div className='text-center py-12 px-4 bg-muted/50 rounded-lg border border-border'>
          <p className='text-muted-foreground text-base mb-2'>{t('noData')}</p>
          <p className='text-muted-foreground/80 text-sm'>
            {t('noDataDescription')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className='mb-10 sm:mb-14'>
      <div className='flex items-center gap-3 mb-5 sm:mb-6'>
        <div className='w-1 h-7 sm:h-8 rounded-full bg-primary' />
        <Typography
          variant='h2'
          className='text-xl sm:text-2xl font-bold text-foreground'
        >
          {t('title')}
        </Typography>
      </div>

      <Carousel
        className='group'
        opts={{ align: 'start', loop: false }}
        setApi={setApi}
      >
        <CarouselContent>
          {uniqueCities.map((city, idx) => {
            const queryParts = []
            if (city.provinceCode)
              queryParts.push(`provinceCode=${city.provinceCode}`)
            if (city.provinceId)
              queryParts.push(`provinceId=${city.provinceId}`)
            const queryParam = queryParts.join('&')
            const provinceUrl = `${PUBLIC_ROUTES.LISTING_LISTING}?${queryParam}`
            const imageByProvinceCode = city.provinceCode
              ? imageMap[Number(city.provinceCode)]
              : undefined
            const imageByProvinceId = city.provinceId
              ? imageMapByProvinceId[Number(city.provinceId)]
              : undefined
            const cityImage =
              imageByProvinceCode ||
              imageByProvinceId ||
              '/images/default-image.jpg'
            return (
              <CarouselItem
                key={`city-${city.provinceCode ?? city.provinceId ?? idx}`}
                className='basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <Link
                  href={provinceUrl}
                  className='block w-full text-left relative rounded-xl overflow-hidden group/card shadow-md hover:shadow-xl transition-shadow'
                >
                  <div className='relative h-[280px] w-full'>
                    <Image
                      src={cityImage}
                      alt={city?.provinceName}
                      fill
                      className='object-cover'
                      sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                      loading='lazy'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent' />
                    <div className='absolute bottom-6 left-6 right-6 text-white'>
                      <Typography
                        variant='h3'
                        className='text-2xl font-bold mb-2 text-white drop-shadow'
                      >
                        {city.provinceName}
                      </Typography>
                      <Typography
                        variant='p'
                        className='text-sm text-white/90 mb-3'
                      >
                        {city.totalListings} {t('listingsSuffix')}
                      </Typography>
                      <Button
                        size='sm'
                        className='backdrop-blur-sm bg-white/90 text-foreground hover:bg-card hover:text-foreground pointer-events-none'
                      >
                        {t('exploreButton') || 'Khám phá'}
                      </Button>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious className='hidden sm:flex -left-12' />
        <CarouselNext className='hidden sm:flex -right-12' />

        {/* Indicators - only show on mobile/tablet */}
        <div className='flex lg:hidden justify-center gap-2 mt-4'>
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

export default LocationBrowseSection
