import React from 'react'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import Carousel from '@/components/atoms/carousel'
import PropertyCard from '@/components/molecules/propertyCard'
import type { ListingDetail } from '@/api/types/property.type'

interface PropertyCarouselProps {
  listings: ListingDetail[]
  title: string
  onPropertyClick?: (listing: ListingDetail) => void
  isLoading?: boolean
  showEmptyState?: boolean
}

const PropertyCarouselSkeleton: React.FC = () => (
  <div className='space-y-6'>
    <div className='h-8 w-64 bg-gray-200 rounded animate-pulse' />
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[1, 2, 3].map((i) => (
        <Card key={i} className='overflow-hidden'>
          <div className='aspect-[4/3] bg-gray-200 animate-pulse' />
          <CardContent className='p-4 space-y-3'>
            <div className='h-6 bg-gray-200 rounded animate-pulse' />
            <div className='h-4 bg-gray-200 rounded animate-pulse w-3/4' />
            <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

const PropertyCarouselEmpty: React.FC<{ title: string }> = ({ title }) => (
  <div className='space-y-6'>
    <Typography variant='h3' className='text-2xl font-bold'>
      {title}
    </Typography>
    <Card>
      <CardContent className='p-8 text-center'>
        <Typography variant='p' className='text-muted-foreground'>
          Không tìm thấy bất động sản phù hợp
        </Typography>
      </CardContent>
    </Card>
  </div>
)

const PropertyCarousel: React.FC<PropertyCarouselProps> = (props) => {
  const { listings, title, onPropertyClick, isLoading, showEmptyState } = props

  if (isLoading) {
    return <PropertyCarouselSkeleton />
  }

  if (showEmptyState && (!listings || listings.length === 0)) {
    return <PropertyCarouselEmpty title={title} />
  }

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
            className='min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_40%] xl:flex-[0_0_30%] pl-4 first:pl-0'
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
