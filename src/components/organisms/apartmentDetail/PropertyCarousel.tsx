import React from 'react'
import { Typography } from '@/components/atoms/typography'
import { Card, CardContent } from '@/components/atoms/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/atoms/carousel'
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

      <Carousel
        opts={{
          align: 'start',
          skipSnaps: false,
          containScroll: 'trimSnaps',
          loop: false,
        }}
        className='relative'
      >
        <CarouselContent className='-ml-0'>
          {listings.map((listing) => (
            <CarouselItem
              key={listing.listingId}
              className='pl-0 sm:pl-4 basis-full sm:basis-1/2 lg:basis-[40%] xl:basis-[30%]'
            >
              <PropertyCard
                listing={listing}
                onClick={onPropertyClick}
                className='h-full'
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons - Always visible */}
        {listings.length > 3 && (
          <>
            <CarouselPrevious className='h-10 w-10 shadow-lg hover:bg-gray-50 -left-5' />
            <CarouselNext className='h-10 w-10 shadow-lg hover:bg-gray-50 -right-5' />
          </>
        )}
      </Carousel>
    </div>
  )
}

export default PropertyCarousel
