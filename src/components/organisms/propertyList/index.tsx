import React from 'react'
import PropertyCard from '@/components/molecules/propertyCard'
import { PropertyCard as PropertyCardType } from '@/api/types/property.type'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import { Skeleton } from '@/components/atoms/skeleton'
import { useListContext } from '@/contexts/list/useListContext'

interface PropertyListProps {
  onPropertyClick?: (property: PropertyCardType) => void
}

const PropertyList: React.FC<PropertyListProps> = ({ onPropertyClick }) => {
  const t = useTranslations()
  const { itemsData } = useListContext<PropertyCardType>()

  const handleFavorite = () => {}

  const PropertyItem = (property: PropertyCardType) => (
    <PropertyCard
      key={property.id}
      property={property}
      onClick={onPropertyClick}
      onFavorite={handleFavorite}
    />
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

  const PropertyNotFound = null

  return (
    <div className='w-full'>
      <Typography
        variant='h2'
        className='text-lg md:text-xl lg:text-2xl font-bold mb-6'
      >
        {t('homePage.property.listings')} ({itemsData.length})
      </Typography>

      {itemsData.length === 0 && PropertyNotFound}
      {itemsData.length === 0 && PropertySkeleton}
      {itemsData.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
          {itemsData.map((p) => PropertyItem(p))}
        </div>
      )}
      <div className='mt-8' />
    </div>
  )
}
export default PropertyList
