import React from 'react'
import { Typography } from '@/components/atoms/typography'
import PropertyCard from '@/components/molecules/propertyCard'
import type { SimilarProperty } from '@/types/apartmentDetail.types'
import type { PropertyCard as PropertyCardType } from '@/api/types/property.type'

interface SimilarListingsProps {
  similarProperties: SimilarProperty[]
  onPropertyClick?: (property: SimilarProperty) => void
}

const convertToPropertyCard = (
  property: SimilarProperty,
): PropertyCardType => ({
  id: property.id,
  title: property.title,
  description: property.title,
  property_type: 'apartment',
  address: property.address,
  city: property.city,
  price: property.price,
  currency: property.currency,
  area: property.area,
  bedrooms: property.bedrooms || 0,
  bathrooms: property.bathrooms || 0,
  images: property.images,
  verified: property.verified || false,
  virtual_tour: undefined,
  featured: property.isVip || false,
  views: 0,
  amenities: [],
  distance: undefined,
})

const SimilarListings: React.FC<SimilarListingsProps> = ({
  similarProperties,
  onPropertyClick,
}) => {
  const handlePropertyClick = (propertyCard: PropertyCardType) => {
    const originalProperty = similarProperties.find(
      (p) => p.id === propertyCard.id,
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
            key={property.id}
            property={convertToPropertyCard(property)}
            onClick={handlePropertyClick}
            className='h-full'
          />
        ))}
      </div>
    </div>
  )
}

export default SimilarListings
