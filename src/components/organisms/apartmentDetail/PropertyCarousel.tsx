import React from 'react'
import { Typography } from '@/components/atoms/typography'
import Carousel from '@/components/atoms/carousel'
import PropertyCard from '@/components/molecules/propertyCard'
import type { SimilarProperty } from '@/types/apartmentDetail.types'
import type { PropertyCard as PropertyCardType } from '@/api/types/property.type'

interface PropertyCarouselProps {
  properties: SimilarProperty[]
  title: string
  onPropertyClick?: (property: SimilarProperty) => void
}

const convertToPropertyCard = (
  property: SimilarProperty,
): PropertyCardType => ({
  id: property.id,
  title: property.title,
  description: property.title,
  property_type: 'apartment',
  address: property.district,
  city: property.city,
  price: property.price,
  currency: 'VND',
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

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  properties,
  title,
  onPropertyClick,
}) => {
  if (!properties || properties.length === 0) {
    return null
  }

  const handleClick = (propertyCard: PropertyCardType) => {
    const originalProperty = properties.find((p) => p.id === propertyCard.id)
    if (originalProperty) {
      onPropertyClick?.(originalProperty)
    }
  }

  return (
    <div className='space-y-6'>
      <Typography variant='h3' className='text-2xl font-bold'>
        {title}
      </Typography>

      <Carousel.Root
        options={{
          align: 'start',
          skipSnaps: false,
          containScroll: 'trimSnaps',
        }}
        loop={false}
        className='relative'
      >
        {properties.map((property) => (
          <Carousel.Item
            key={property.id}
            className='min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 first:pl-0'
          >
            <PropertyCard
              property={convertToPropertyCard(property)}
              onClick={handleClick}
              className='h-full'
            />
          </Carousel.Item>
        ))}

        {/* Navigation Buttons - Always visible */}
        {properties.length > 3 && (
          <>
            <Carousel.Prev className='h-10 w-10 shadow-lg hover:bg-gray-50 -left-5' />
            <Carousel.Next className='h-10 w-10 shadow-lg hover:bg-gray-50 -right-5' />
          </>
        )}
      </Carousel.Root>
    </div>
  )
}

export default PropertyCarousel
