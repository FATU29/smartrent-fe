import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import LocationBrowseSectionSkeleton from './LocationBrowseSectionSkeleton'
import type { ProvinceStatsItem } from '@/api/types'
import Carousel from '@/components/atoms/carousel'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { useRouter } from 'next/router'
import { PUBLIC_ROUTES } from '@/constants/route'
import { imageMap } from '@/utils/mapper'

interface LocationBrowseSectionProps {
  cities?: ProvinceStatsItem[]
  loading?: boolean
}

const LocationBrowseSection: React.FC<LocationBrowseSectionProps> = ({
  cities,
  loading = false,
}) => {
  const t = useTranslations('homePage.locations')
  const router = useRouter()

  // Show skeleton when loading
  if (loading) {
    return <LocationBrowseSectionSkeleton />
  }

  // Show empty state when no data
  if (!cities || cities.length === 0) {
    return (
      <section className='mt-16'>
        <Typography
          variant='h2'
          className='text-xl sm:text-2xl font-semibold mb-6'
        >
          {t('title')}
        </Typography>
        <div className='text-center py-12 px-4 bg-muted/50 rounded-lg border border-border'>
          <p className='text-muted-foreground text-base mb-2'>{t('noData')}</p>
          <p className='text-muted-foreground/80 text-sm'>
            {t('noDataDescription')}
          </p>
        </div>
      </section>
    )
  }

  const handleProvinceClick = (province: ProvinceStatsItem) => {
    router.push({
      pathname: PUBLIC_ROUTES.LISTING_LISTING,
      query: { provinceId: province.provinceId },
    })
  }

  return (
    <section className='mt-16'>
      <Typography
        variant='h2'
        className='text-xl sm:text-2xl font-semibold mb-6'
      >
        {t('title')}
      </Typography>

      <Carousel.Root className='group' options={{ align: 'start' }} loop>
        {cities.map((city) => (
          <Carousel.Item
            key={city.provinceId || city.provinceCode}
            className='flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2'
          >
            <button
              type='button'
              className='w-full text-left relative rounded-xl overflow-hidden group/card shadow-md hover:shadow-xl transition-shadow'
              onClick={() => handleProvinceClick(city)}
            >
              <div className='relative h-[280px] w-full'>
                <Image
                  src={imageMap[Number(city?.provinceId)]}
                  alt={city?.provinceName}
                  fill
                  className='object-cover'
                  sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
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
                    className='backdrop-blur-sm bg-white/90 text-gray-900 hover:bg-white hover:text-gray-900'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProvinceClick(city)
                    }}
                  >
                    {t('exploreButton') || 'Khám phá'}
                  </Button>
                </div>
              </div>
            </button>
          </Carousel.Item>
        ))}
        <Carousel.Indicators className='mt-4' />
      </Carousel.Root>
    </section>
  )
}

export default LocationBrowseSection
