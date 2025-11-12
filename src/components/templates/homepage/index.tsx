import HomepageHeader from '@/components/molecules/homepageHeader'
import HeroPromoCarousel from '@/components/organisms/heroPromoCarousel'
import PropertyList from '@/components/organisms/propertyList'
import { PropertyCard } from '@/api/types/property.type'
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
import type { VipTier } from '@/api/types/vip-tier.type'
import type { GetPackagesResponse } from '@/api/types/memembership.type'
import type { CityItem } from '@/components/organisms/locationBrowseSection/types'

interface HomepageTemplateProps {
  onPropertyClick?: (property: PropertyCard) => void
  vipTiers?: VipTier[]
  membershipPackages?: GetPackagesResponse
}

const HomepageTemplate: React.FC<HomepageTemplateProps> = ({
  onPropertyClick,
}) => {
  const t = useTranslations()
  const { pagination } = useListContext()
  const router = useRouter()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const handlePropertyClick = (property: PropertyCard) => {
    console.log('Property clicked:', property)
    onPropertyClick?.(property)
  }

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

            <PropertyList onPropertyClick={handlePropertyClick} />
            <div className='mt-8 flex flex-col items-center gap-4'>
              {pagination.hasNext && !hasLoadedOnce && (
                <List.LoadMore onAfterLoad={() => setHasLoadedOnce(true)} />
              )}
              {(hasLoadedOnce || !pagination.hasNext) && (
                <Button
                  onClick={() => router.push(PUBLIC_ROUTES.RESIDENTIAL_LIST)}
                  className='px-6'
                >
                  {t('common.loadMore')} ➜
                </Button>
              )}
              {!pagination.hasNext && !hasLoadedOnce && (
                <span className='text-xs text-muted-foreground'>
                  {t('common.endOfResults')}
                </span>
              )}
            </div>
            <LocationBrowseSection
              cities={[
                {
                  id: 'hcm',
                  name: 'TP. Hồ Chí Minh',
                  image: '/images/rental-auth-bg.jpg',
                  listings: 71520,
                  projects: [
                    'Vinhomes Central Park',
                    'Vinhomes Grand Park',
                    'Vinhomes Smart City',
                    'Vinhomes Ocean Park',
                    'Vũng Tàu Pearl',
                    'Bcons Green View',
                    'Grandeur Palace',
                  ],
                },
                {
                  id: 'hn',
                  name: 'Hà Nội',
                  image: '/images/example.png',
                  listings: 58023,
                },
                {
                  id: 'dn',
                  name: 'Đà Nẵng',
                  image: '/images/default-image.jpg',
                  listings: 9216,
                },
                {
                  id: 'bd',
                  name: 'Bình Dương',
                  image: '/images/default-image.jpg',
                  listings: 8381,
                },
                {
                  id: 'dnai',
                  name: 'Đồng Nai',
                  image: '/images/example.png',
                  listings: 3457,
                },
              ]}
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
