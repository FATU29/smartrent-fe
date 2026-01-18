import React from 'react'
import PropertyCard from '@/components/molecules/propertyCard'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Skeleton } from '@/components/atoms/skeleton'
import { ListingDetail } from '@/api/types'
import Link from 'next/link'

interface PropertyListProps {
  listings?: ListingDetail[]
  isLoading?: boolean
  initialProperties?: ListingDetail[] // Keep for backward compatibility
}

const PropertyList: React.FC<PropertyListProps> = ({
  listings,
  isLoading = false,
  initialProperties = [],
}) => {
  const t = useTranslations()

  // Use listings prop if provided, otherwise fall back to initialProperties
  const displayedProperties = listings || initialProperties

  const handleFavorite = () => {}

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or interactive elements
    const target = e.target as HTMLElement
    const clickedButton =
      target.closest('[data-action-button]') ||
      target.closest('button') ||
      target.closest('[role="button"]')

    if (clickedButton) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  const PropertyItem = (property: ListingDetail) => (
    <Link
      key={property.listingId}
      href={`/listing-detail/${property.listingId}`}
      className='block h-full'
      onClick={handleLinkClick}
    >
      <PropertyCard listing={property} onFavorite={handleFavorite} />
    </Link>
  )

  const PropertySkeleton = (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='w-full space-y-2 md:space-y-3'>
          <Skeleton className='aspect-[4/3] rounded-lg w-full' />
          <div className='p-3 md:p-4 space-y-2 md:space-y-3'>
            <Skeleton className='h-3 w-3/4 md:h-4' />
            <Skeleton className='h-2.5 w-1/2 md:h-3' />
            <Skeleton className='h-4 w-1/3 md:h-6' />
            <div className='flex gap-1.5 md:gap-2'>
              <Skeleton className='h-4 w-16 md:h-6 md:w-20' />
              <Skeleton className='h-4 w-16 md:h-6 md:w-20' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const PropertyNotFound = (
    <div className='flex flex-col items-center justify-center py-10 text-center'>
      <Typography variant='h3' className='mb-2'>
        {t('homePage.property.noProperties')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground'>
        {t('homePage.property.noPropertiesDescription')}
      </Typography>
    </div>
  )

  return (
    <div className='w-full'>
      <Typography
        variant='h2'
        className='text-lg md:text-xl lg:text-2xl font-bold mb-6'
      >
        {t('homePage.property.listings')} (
        {isLoading ? '...' : displayedProperties.length})
      </Typography>

      {isLoading && PropertySkeleton}
      {!isLoading && displayedProperties.length === 0 && PropertyNotFound}
      {!isLoading && displayedProperties.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
          {displayedProperties.map((p) => PropertyItem(p))}
        </div>
      )}
      <div className='mt-8' />
    </div>
  )
}
export default PropertyList
