import React from 'react'
import { Typography } from '@/components/atoms/typography'
import PropertyCard from '@/components/molecules/propertyCard'
import { ListingDetail } from '@/api/types'

interface SimilarListingsProps {
  similarProperties: ListingDetail[]
  onPropertyClick?: (property: ListingDetail) => void
}

const SimilarListings: React.FC<SimilarListingsProps> = ({
  similarProperties,
  onPropertyClick,
}) => {
  const handlePropertyClick = (propertyCard: ListingDetail) => {
    const originalProperty = similarProperties.find(
      (p) => p.listingId === propertyCard.listingId,
    )
    if (originalProperty) {
      onPropertyClick?.(originalProperty)
    }
  }

  if (!similarProperties || similarProperties.length === 0) {
    return (
      <div className='space-y-4'>
        <Typography variant='h4' className='font-semibold'>
          Similar Listings
        </Typography>
        <div className='text-center py-8'>
          <Typography variant='p' className='text-muted-foreground'>
            No similar properties found.
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Typography variant='h4' className='font-semibold text-xl'>
        Similar Listings
      </Typography>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {similarProperties.map((property) => (
          <PropertyCard
            key={property.listingId}
            listing={property}
            onClick={handlePropertyClick}
            className='h-full'
          />
        ))}
      </div>
    </div>
  )
}

export default SimilarListings
