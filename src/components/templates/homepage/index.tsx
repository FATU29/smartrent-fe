import { Typography } from '@/components/atoms/typography'
import PropertyList from '@/components/organisms/propertyList'
import { PropertyCard } from '@/api/types/property.type'
import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list/useListContext'
import ListPagination from '@/contexts/list/index.pagination'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface HomepageTemplateProps {
  onPropertyClick?: (property: PropertyCard) => void
  filterSlot?: React.ReactNode
  carouselSlot?: React.ReactNode
}

const HomepageTemplate: React.FC<HomepageTemplateProps> = ({
  onPropertyClick,
  filterSlot,
  carouselSlot,
}) => {
  const [mounted, setMounted] = useState(false)
  const t = useTranslations()
  const { handleLoadMore, pagination, isLoading } = useListContext()

  // Mobile infinite scroll sentinel
  const onIntersect = useCallback(() => {
    if (!isLoading && pagination.hasNext) {
      handleLoadMore()
    }
  }, [isLoading, pagination.hasNext, handleLoadMore])

  const { ref: sentinelRef } = useIntersectionObserver({
    onIntersect,
    options: { rootMargin: '200px 0px 0px 0px', threshold: 0.1 },
  })

  const handlePropertyClick = (property: PropertyCard) => {
    console.log('Property clicked:', property)
    onPropertyClick?.(property)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className='w-full'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='py-4 sm:py-6 lg:py-8'>
            <div className='text-center mb-6 sm:mb-8'>
              <div className='inline-flex items-center gap-2 mb-3 sm:mb-4'>
                <div className='text-xs sm:text-sm font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full'>
                  🏠 SmartRent Properties
                </div>
              </div>
              <Typography
                variant='h1'
                className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3'
              >
                🏘️ {t('homePage.title')}
              </Typography>
              <Typography
                variant='lead'
                className='text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mb-2'
              >
                {t('homePage.subtitle')}
              </Typography>
              <Typography
                variant='small'
                className='text-xs sm:text-sm text-primary font-medium'
              >
                {t('homePage.instruction')}
              </Typography>
              <div className='mt-2 sm:mt-3'>
                <Typography
                  variant='small'
                  className='text-xs sm:text-sm text-muted-foreground'
                >
                  {t('homePage.description')} •{' '}
                  {t('homePage.propertiesAvailable')}
                </Typography>
              </div>
            </div>
            {carouselSlot && <div className='mb-6 sm:mb-8'>{carouselSlot}</div>}
            {filterSlot && <div className='mb-8 sm:mb-10'>{filterSlot}</div>}

            <PropertyList onPropertyClick={handlePropertyClick} />
            {/* Desktop pagination (hidden on small screens) */}
            <div className='hidden md:block mt-8'>
              <ListPagination />
            </div>
            {/* Mobile infinite scroll sentinel */}
            <div
              ref={sentinelRef as React.RefObject<HTMLDivElement>}
              className='md:hidden h-12 mt-6 flex items-center justify-center'
            >
              {pagination.hasNext ? (
                <span className='text-xs text-muted-foreground'>
                  {isLoading ? t('common.loading') : t('common.loadingMore')}
                </span>
              ) : (
                <span className='text-xs text-muted-foreground'>
                  {t('common.endOfResults')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomepageTemplate
