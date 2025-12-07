import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import LocationCard from '@/components/molecules/locationCard'
import { CityItem } from './types'

interface MobileCarouselProps {
  cities: CityItem[]
  listingSuffix: string
  onSelectCity?: (city: CityItem) => void
}

const MobileCarousel: React.FC<MobileCarouselProps> = ({
  cities,
  listingSuffix,
  onSelectCity,
}) => {
  if (!cities.length) return null
  return (
    <div className='-mx-4'>
      <Carousel
        className='px-4'
        opts={{ align: 'start', dragFree: true, loop: false }}
      >
        <CarouselContent className='-ml-0'>
          {cities.map((c) => (
            <CarouselItem key={c.id} className='pl-0 basis-3/4'>
              <LocationCard
                name={c.name}
                image={c.image}
                listingCount={c.listings}
                listingSuffix={listingSuffix}
                onClick={() => onSelectCity?.(c)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default MobileCarousel
