import React from 'react'
import { useTranslations } from 'next-intl'
import PropertyCard from '@/components/molecules/propertyCard'
import Carousel from '@/components/atoms/carousel'
import { Skeleton } from '@/components/atoms/skeleton'
import { ListingDetail, VipType } from '@/api/types'
import { useRouter } from 'next/router'
import { Crown, Sparkles, Award } from 'lucide-react'

interface VipPropertySectionProps {
  vipType: VipType
  listings: ListingDetail[]
  isLoading: boolean
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
    icon: Award,
    gradient: 'from-gray-400 to-gray-600',
    bgGradient:
      'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
    textColor: 'text-gray-600 dark:text-gray-400',
    titleKey: 'homePage.vipSections.silver',
  },
  NORMAL: {
    icon: Award,
    gradient: 'from-gray-400 to-gray-600',
    bgGradient:
      'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20',
    textColor: 'text-gray-600 dark:text-gray-400',
    titleKey: 'homePage.vipSections.normal',
  },
}

const VipPropertySection: React.FC<VipPropertySectionProps> = ({
  vipType,
  listings,
  isLoading,
}) => {
  const t = useTranslations()
  const router = useRouter()
  const config = VIP_CONFIG[vipType]
  const Icon = config.icon

  const handleFavorite = () => {}

  const handleOnClick = (property: ListingDetail) => {
    router.push(`/listing-detail/${property.listingId}`)
  }

  if (isLoading) {
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
        <Carousel.Root className='group' options={{ align: 'start' }} loop>
          {Array.from({ length: 4 }).map((_, index) => (
            <Carousel.Item
              key={index}
              className='flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] px-2'
            >
              <div className='w-full space-y-2 md:space-y-3'>
                <Skeleton className='aspect-[4/3] rounded-lg w-full' />
                <div className='p-3 md:p-4 space-y-2 md:space-y-3'>
                  <Skeleton className='h-3 w-3/4 md:h-4' />
                  <Skeleton className='h-2.5 w-1/2 md:h-3' />
                  <Skeleton className='h-4 w-1/3 md:h-6' />
                </div>
              </div>
            </Carousel.Item>
          ))}
          <Carousel.Indicators className='mt-4' />
        </Carousel.Root>
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

      <Carousel.Root className='group' options={{ align: 'start' }} loop>
        {listings.map((listing) => (
          <Carousel.Item
            key={listing.listingId}
            className='flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] px-2'
          >
            <PropertyCard
              listing={listing}
              onFavorite={handleFavorite}
              onClick={() => handleOnClick(listing)}
            />
          </Carousel.Item>
        ))}
        <Carousel.Indicators className='mt-4' />
      </Carousel.Root>
    </section>
  )
}

export default VipPropertySection
