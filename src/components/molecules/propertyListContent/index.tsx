import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { PropertyCard as PropertyCardType } from '@/api/types/property.type'
import PropertyCard from '@/components/molecules/propertyCard'
import ListPagination from '@/contexts/list/index.pagination'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Typography } from '@/components/atoms/typography'
import { Skeleton } from '@/components/atoms/skeleton'

interface PropertyListContentProps {
  onPropertyClick?: (property: PropertyCardType) => void
  onFavorite?: (property: PropertyCardType, isFavorite: boolean) => void
}

const PropertyListContent: React.FC<PropertyListContentProps> = ({
  onPropertyClick,
  onFavorite,
}) => {
  const router = useRouter()
  const t = useTranslations('propertiesPage')
  const { itemsData, isLoading, pagination, handleLoadMore } =
    useListContext<PropertyCardType>()
  const isMobile = useIsMobile()

  const handleLoadMoreCallback = useCallback(() => {
    if (isMobile && pagination.hasNext && !isLoading) {
      handleLoadMore()
    }
  }, [isMobile, pagination.hasNext, isLoading, handleLoadMore])

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: handleLoadMoreCallback,
    options: {
      rootMargin: '100px',
    },
  })

  const handlePropertyClick = (property: PropertyCardType) => {
    if (onPropertyClick) {
      onPropertyClick(property)
    } else {
      router.push(`/properties/${property.id}`)
    }
  }

  const handleFavorite = (property: PropertyCardType, isFavorite: boolean) => {
    onFavorite?.(property, isFavorite)
  }

  const PropertySkeleton = (
    <div className='space-y-4 md:space-y-6'>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className='flex gap-4'>
          <Skeleton className='w-full h-32 md:h-40 flex-shrink-0 rounded-lg' />
        </div>
      ))}
    </div>
  )

  const PropertyNotFound = (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <Typography variant='h3' className='mb-4'>
        {t('noProperties')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground'>
        {t('noPropertiesDescription')}
      </Typography>
    </div>
  )

  if (isLoading && itemsData.length === 0) {
    return PropertySkeleton
  }

  if (itemsData.length === 0) {
    return PropertyNotFound
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3 md:space-y-4'>
        {itemsData.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={handlePropertyClick}
            onFavorite={handleFavorite}
            className='compact'
            imageLayout='top'
            userInfo={{
              name: 'User Name', // TODO: Get from property data
              avatar: undefined, // TODO: Get from property data
              postedDate: 'Đăng hôm nay', // TODO: Format from property.posted_date
            }}
            contactInfo={{
              phone: '0123456789', // TODO: Get from property data
              phoneMasked: '0123 456***', // TODO: Mask phone number
              onShowPhone: () => {
                // TODO: Implement show phone logic
                console.log('Show phone for property:', property.id)
              },
              isPhoneVisible: false, // TODO: Track visibility state
            }}
          />
        ))}

        {/* Infinite Scroll Trigger - Mobile Only */}
        {isMobile && pagination.hasNext && (
          <div
            ref={loadMoreRef as React.RefObject<HTMLDivElement>}
            className='flex justify-center py-4'
          >
            {isLoading && (
              <Typography variant='small' className='text-muted-foreground'>
                {t('loadingMore')}
              </Typography>
            )}
          </div>
        )}
      </div>

      {/* Pagination - Desktop Only */}
      {!isMobile && itemsData.length > 0 && (
        <div className='mt-8'>
          <ListPagination />
        </div>
      )}
    </div>
  )
}

export default PropertyListContent
