import React from 'react'
import { Typography } from '@/components/atoms/typography'
import Carousel from '@/components/atoms/carousel'
import PropertyCard from '@/components/molecules/propertyCard'
import type { ListingDetail } from '@/api/types/property.type'

interface PropertyCarouselProps {
  listings: ListingDetail[]
  title: string
  onPropertyClick?: (listing: ListingDetail) => void
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = (props) => {
  const { listings, title, onPropertyClick } = props

  if (!listings || listings.length === 0) {
    return null
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
        {listings.map((listing) => (
          <Carousel.Item
            key={listing.listingId}
            className='min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4 first:pl-0'
          >
            <PropertyCard
              listing={listing}
              onClick={onPropertyClick}
              className='h-full'
            />
          </Carousel.Item>
        ))}

        {/* Navigation Buttons - Always visible */}
        {listings.length > 3 && (
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
