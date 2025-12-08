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
  <div className='space-y-5'>
    <div className='h-7 w-48 bg-muted rounded animate-pulse' />
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[1, 2, 3].map((i) => (
        <Card key={i} className='overflow-hidden'>
          <div className='aspect-[4/3] bg-muted animate-pulse' />
          <CardContent className='p-4 space-y-2.5'>
            <div className='h-5 bg-muted rounded animate-pulse' />
            <div className='h-4 bg-muted rounded animate-pulse w-3/4' />
            <div className='h-4 bg-muted rounded animate-pulse w-1/2' />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

const PropertyCarouselEmpty: React.FC<{ title: string }> = ({ title }) => (
  <div className='space-y-5'>
    <Typography variant='h3' className='text-xl md:text-2xl font-bold'>
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
    <div className='space-y-5'>
      <Typography variant='h3' className='text-xl md:text-2xl font-bold'>
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
        <CarouselContent className='-ml-3'>
          {listings.map((listing) => (
            <CarouselItem
              key={listing.listingId}
              className='pl-3 basis-[85%] sm:basis-[70%] md:basis-1/2 lg:basis-1/3 xl:basis-[30%]'
            >
              <PropertyCard
                listing={listing}
                onClick={onPropertyClick}
                className='h-full'
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons */}
        {listings.length > 1 && (
          <>
            <CarouselPrevious className='h-10 w-10 shadow-md hover:shadow-lg -left-4 border-2 transition-all' />
            <CarouselNext className='h-10 w-10 shadow-md hover:shadow-lg -right-4 border-2 transition-all' />
          </>
        )}
      </Carousel>
    </div>
  )
}

export default PropertyCarousel
