import HomepageHeader from '@/components/molecules/homepageHeader'
import HeroPromoCarousel from '@/components/organisms/heroPromoCarousel'
import PropertyList from '@/components/organisms/propertyList'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useState, useCallback } from 'react'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useListContext } from '@/contexts/list/useListContext'
import LocationBrowseSection from '@/components/organisms/locationBrowseSection'
import PromoFeaturesSection from '@/components/organisms/promoFeaturesSection'
import TopInterestSection from '@/components/organisms/topInterestSection'
import { List } from '@/contexts/list'
import ResidentialFilterResponsive from '@/components/molecules/residentialFilterResponsive'
import ClearFilterButton from '@/components/atoms/clearFilterButton'
import type { CityItem } from '@/components/organisms/locationBrowseSection/types'
import { ListingDetail } from '@/api/types'

interface HomepageTemplateProps {
  initialProperties?: ListingDetail[]
  cities?: CityItem[]
}

const HomepageTemplate: React.FC<HomepageTemplateProps> = ({
  initialProperties,
  cities,
}) => {
  const t = useTranslations()
  const { pagination } = useListContext()
  const router = useRouter()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const hasNext = pagination.currentPage < pagination.totalPages

  const handleSelectCity = useCallback(
    (city: CityItem) => {
      router.push({
        pathname: PUBLIC_ROUTES.RESIDENTIAL_LIST,
        query: { city: city.name },
      })
    },
    [router],
  )

  return (
    <div className='w-full'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='py-4 sm:py-6 lg:py-8'>
            <HomepageHeader />
            <div className='mb-10'>
              <HeroPromoCarousel />
            </div>
            <section className='mb-8 sm:mb-10 relative rounded-2xl overflow-hidden'>
              <div className='absolute inset-0'>
                <div
                  className='h-full w-full bg-center bg-cover'
                  style={{
                    backgroundImage: `url(/images/rental-auth-bg.jpg)`,
                  }}
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
                      {/* ClearFilterButton is always present but hidden on homepage by default */}
                      <ClearFilterButton show={false} onClick={() => {}} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <TopInterestSection />

            <PropertyList initialProperties={initialProperties} />
            <div className='mt-8 flex flex-col items-center gap-4'>
              {hasNext && !hasLoadedOnce && (
                <List.LoadMore onAfterLoad={() => setHasLoadedOnce(true)} />
              )}
              {(hasLoadedOnce || !hasNext) && (
                <Button
                  onClick={() => router.push(PUBLIC_ROUTES.RESIDENTIAL_LIST)}
                  className='px-6'
                >
                  {t('common.loadMore')} ➜
                </Button>
              )}
              {!hasNext && !hasLoadedOnce && (
                <span className='text-xs text-muted-foreground'>
                  {t('common.endOfResults')}
                </span>
              )}
            </div>
            <LocationBrowseSection
              cities={cities}
              loading={cities === undefined}
              onSelectCity={handleSelectCity}
            />
            <PromoFeaturesSection />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomepageTemplate
