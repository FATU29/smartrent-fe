import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import PropertyCard from '@/components/molecules/propertyCard'
import ListPagination from '@/contexts/list/index.pagination'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Typography } from '@/components/atoms/typography'
import { Skeleton } from '@/components/atoms/skeleton'
import { ListingDetail } from '@/api/types'

interface PropertyListContentProps {
  onPropertyClick?: (property: ListingDetail) => void
  onFavorite?: (property: ListingDetail, isFavorite: boolean) => void
}

const PropertyListContent: React.FC<PropertyListContentProps> = ({
  onPropertyClick,
  onFavorite,
}) => {
  const router = useRouter()
  const t = useTranslations('propertiesPage')
  const { items, isLoading, pagination, loadMore } =
    useListContext<ListingDetail>()
  const isMobile = useIsMobile()

  const { currentPage, totalPages } = pagination
  const hasNext = currentPage < totalPages

  const handleLoadMoreCallback = useCallback(() => {
    if (isMobile && hasNext && !isLoading) {
      loadMore()
    }
  }, [isMobile, hasNext, isLoading, loadMore])

  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: handleLoadMoreCallback,
    options: {
      rootMargin: '100px',
    },
  })

  const handlePropertyClick = useCallback(
    (property: ListingDetail) => {
      if (onPropertyClick) {
        onPropertyClick(property)
      } else {
        router.push(`/listing-detail/${property.listingId}`)
      }
    },
    [onPropertyClick, router],
  )

  const handleFavorite = useCallback(
    (property: ListingDetail, isFavorite: boolean) => {
      onFavorite?.(property, isFavorite)
    },
    [onFavorite],
  )

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

  if (isLoading && items.length === 0) {
    return PropertySkeleton
  }

  if (items.length === 0) {
    return PropertyNotFound
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-3 md:space-y-4'>
        {items.map((property) => (
          <PropertyCard
            key={property.listingId}
            listing={property}
            onClick={handlePropertyClick}
            onFavorite={handleFavorite}
            className='compact'
            imageLayout='top'
          />
        ))}

        {/* Infinite Scroll Trigger - Mobile Only */}
        {isMobile && hasNext && (
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
      {!isMobile && items.length > 0 && (
        <div className='mt-8'>
          <ListPagination />
        </div>
      )}
    </div>
  )
}

export default PropertyListContent
