import HeroPromoCarousel from '@/components/organisms/heroPromoCarousel'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useListContext } from '@/contexts/list/useListContext'
import LocationBrowseSection from '@/components/organisms/locationBrowseSection'
import PromoFeaturesSection from '@/components/organisms/promoFeaturesSection'
import TopInterestSection from '@/components/organisms/topInterestSection'
import { List } from '@/contexts/list'
import dynamic from 'next/dynamic'
import ClearFilterButton from '@/components/atoms/clearFilterButton'
import { useRecommendedListingsByVip } from '@/hooks/useListings'
import VipPropertySection from '@/components/organisms/vipPropertySection'

const ResidentialFilterResponsive = dynamic(
  () => import('@/components/molecules/residentialFilterResponsive'),
  {
    ssr: false,
  },
)

import type { ProvinceStatsItem } from '@/api/types'
import Image from 'next/image'

interface HomepageTemplateProps {
  cities?: ProvinceStatsItem[]
}

const HomepageTemplate: React.FC<HomepageTemplateProps> = ({ cities }) => {
  const t = useTranslations()
  const { pagination } = useListContext()
  const router = useRouter()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const clickCountRef = useRef(0)

  const diamondListings = useRecommendedListingsByVip({
    vipType: 'DIAMOND',
    size: 4,
  })

  const goldListings = useRecommendedListingsByVip({
    vipType: 'GOLD',
    size: 4,
  })

  const silverListings = useRecommendedListingsByVip({
    vipType: 'SILVER',
    size: 4,
  })

  const hasNext = pagination.currentPage < pagination.totalPages

  const handleLoadMoreClick = useCallback(() => {
    clickCountRef.current += 1

    if (clickCountRef.current >= 2) {
      router.push(`${PUBLIC_ROUTES.LISTING_LISTING}?page=2`)
    } else {
      router.push(PUBLIC_ROUTES.LISTING_LISTING)
    }
  }, [router])

  const handleFilterApply = useCallback(() => {
    router.push(PUBLIC_ROUTES.LISTING_LISTING)
  }, [router])

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
                  fetchPriority='high'
                  loading='eager'
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
                    <ResidentialFilterResponsive onApply={handleFilterApply} />
                    <div className='flex justify-between items-center'>
                      <ClearFilterButton show={false} onClick={() => {}} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div id='top-interest'>
              <TopInterestSection />
            </div>

            {/* VIP Property Sections */}
            <div className='space-y-8'>
              <VipPropertySection
                vipType='DIAMOND'
                listings={diamondListings.listings}
                isLoading={diamondListings.isLoading}
              />
              <VipPropertySection
                vipType='GOLD'
                listings={goldListings.listings}
                isLoading={goldListings.isLoading}
              />
              <VipPropertySection
                vipType='SILVER'
                listings={silverListings.listings}
                isLoading={silverListings.isLoading}
              />
            </div>

            <div className='mt-8 flex flex-col items-center gap-4'>
              {hasNext && !hasLoadedOnce && (
                <List.LoadMore onAfterLoad={() => setHasLoadedOnce(true)} />
              )}
              {(hasLoadedOnce || !hasNext) && (
                <Button onClick={handleLoadMoreClick} className='px-6'>
                  {t('common.loadMore')} ➜
                </Button>
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
