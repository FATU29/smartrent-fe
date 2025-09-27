import React from 'react'
import Carousel from '@/components/atoms/carousel'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface FeaturedCarouselItem {
  id: string
  title: string
  image: string
  subtitle?: string
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[]
  className?: string
  onClickItem?: (item: FeaturedCarouselItem) => void
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  items,
  className,
  onClickItem,
}) => {
  return (
    <Carousel.Root
      autoplay={{ delay: 5000 }}
      options={{ align: 'start' }}
      className={cn('group', className)}
    >
      {items.map((item) => (
        <Carousel.Item key={item.id} className='px-1 md:px-2'>
          <button
            onClick={() => onClickItem?.(item)}
            className='relative w-full h-40 sm:h-52 md:h-60 overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition'
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes='(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />
            <div className='absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-left'>
              <p className='text-sm sm:text-base font-semibold text-white line-clamp-1'>
                {item.title}
              </p>
              {item.subtitle && (
                <p className='text-[10px] sm:text-xs text-white/80 line-clamp-1'>
                  {item.subtitle}
                </p>
              )}
            </div>
          </button>
        </Carousel.Item>
      ))}
      <Carousel.Prev className='opacity-0 group-hover:opacity-100' />
      <Carousel.Next className='opacity-0 group-hover:opacity-100' />
      <Carousel.Indicators />
    </Carousel.Root>
  )
}

export default FeaturedCarousel
