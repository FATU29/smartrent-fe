import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Autoplay from 'embla-carousel-autoplay'

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
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  React.useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })

    api.on('reInit', () => {
      setScrollSnaps(api.scrollSnapList())
    })
  }, [api])

  return (
    <Carousel
      opts={{ align: 'start' }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className={cn('group', className)}
      setApi={setApi}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.id} className='md:basis-1/2 lg:basis-1/3'>
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
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='opacity-0 group-hover:opacity-100' />
      <CarouselNext className='opacity-0 group-hover:opacity-100' />

      {/* Indicators - only show on mobile/tablet (desktop shows 3 items so dots less useful) */}
      <div className='flex lg:hidden justify-center gap-2 mt-4'>
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              current === index
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Carousel>
  )
}

export default FeaturedCarousel
