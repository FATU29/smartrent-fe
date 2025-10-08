import React from 'react'
import Carousel from '@/components/atoms/carousel'
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
      <Carousel.Root
        className='px-4'
        options={{ align: 'start', dragFree: true }}
        loop={false}
        autoplay={false}
      >
        {cities.map((c) => (
          <Carousel.Item key={c.id} className='pl-0 flex-[0_0_75%]'>
            <LocationCard
              name={c.name}
              image={c.image}
              listingCount={c.listings}
              listingSuffix={listingSuffix}
              onClick={() => onSelectCity?.(c)}
            />
          </Carousel.Item>
        ))}
      </Carousel.Root>
    </div>
  )
}

export default MobileCarousel
