import HeroPromoCarousel from '@/components/organisms/heroPromoCarousel'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useListContext } from '@/contexts/list/useListContext'
import LocationBrowseSection from '@/components/organisms/locationBrowseSection'
import PromoFeaturesSection from '@/components/organisms/promoFeaturesSection'
import TopInterestSection from '@/components/organisms/topInterestSection'
import { List } from '@/contexts/list'
import ClearFilterButton from '@/components/atoms/clearFilterButton'
import VipPropertySection from '@/components/organisms/vipPropertySection'

import type {
  ProvinceStatsItem,
  CategoryStatsItem,
  ListingDetail,
} from '@/api/types'
import Image from 'next/image'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'

interface HomepageTemplateProps {
  cities?: ProvinceStatsItem[]
  categoryStats?: CategoryStatsItem[]
  diamondListings?: ListingDetail[]
  goldListings?: ListingDetail[]
  silverListings?: ListingDetail[]
}

const HomepageTemplate: React.FC<HomepageTemplateProps> = ({
  cities,
  categoryStats,
  diamondListings = [],
  goldListings = [],
  silverListings = [],
}) => {
  const t = useTranslations()
  const { pagination } = useListContext()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const clickCountRef = useRef(0)

  const hasNext = pagination.currentPage < pagination.totalPages

  const getLoadMoreHref = useCallback(() => {
    clickCountRef.current += 1
    return clickCountRef.current >= 2
      ? `${PUBLIC_ROUTES.LISTING_LISTING}?page=2`
      : PUBLIC_ROUTES.LISTING_LISTING
  }, [])

  return (
    <div className='w-full'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='py-4 sm:py-6 lg:py-8'>
            <div className='mb-10'>
              <HeroPromoCarousel />
            </div>
            <section className='mb-8 sm:mb-10 relative rounded-2xl overflow-hidden'>
              <div className='absolute inset-0'>
                <Image
                  src='/images/banner-default.jpg'
                  alt='Banner default'
                  fill
                  priority
                  quality={85}
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px'
                />
                <div className='absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-black/20 dark:from-black/70 dark:via-black/60 dark:to-black/30' />
              </div>
              <div className='relative p-5 sm:p-8 lg:p-10'>
                <div className='max-w-2xl mb-5 sm:mb-6'>
                  <h2 className='text-white text-xl sm:text-2xl font-semibold mb-2'>
                    {t('homePage.searchIntro.title')}
                  </h2>
                  <p className='text-white/80 text-sm sm:text-base leading-relaxed'>
                    {t('homePage.searchIntro.description')}
                  </p>
                </div>
                <div className='backdrop-blur-sm bg-white/75 dark:bg-black/50 p-3 sm:p-4 rounded-xl shadow-lg ring-1 ring-white/40 dark:ring-white/10'>
                  <div className='flex flex-col gap-3'>
                    <ResidentialFilterResponsive />
                    <div className='flex justify-between items-center'>
                      <ClearFilterButton show={false} onClick={() => {}} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div id='top-interest'>
              <TopInterestSection categoryStats={categoryStats} />
            </div>

            {/* VIP Property Sections */}
            <div className='space-y-8'>
              <VipPropertySection
                vipType='DIAMOND'
                listings={diamondListings}
                isLoading={false}
              />
              <VipPropertySection
                vipType='GOLD'
                listings={goldListings}
                isLoading={false}
              />
              <VipPropertySection
                vipType='SILVER'
                listings={silverListings}
                isLoading={false}
              />
            </div>

            <div className='mt-8 flex flex-col items-center gap-4'>
              {hasNext && !hasLoadedOnce && (
                <List.LoadMore onAfterLoad={() => setHasLoadedOnce(true)} />
              )}
              {(hasLoadedOnce || !hasNext) && (
                <Link href={getLoadMoreHref()}>
                  <Button className='px-6'>{t('common.loadMore')} ➜</Button>
                </Link>
              )}
            </div>
            <LocationBrowseSection
              cities={cities}
              loading={cities === undefined}
            />
            <PromoFeaturesSection />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomepageTemplate
