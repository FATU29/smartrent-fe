import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useRouter } from 'next/router'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/atoms/carousel'
import { cn } from '@/lib/utils'
import { CATEGORY_CODE, imageMapCategory } from '@/utils/mapper'

interface TopInterestItem {
  id: string
  title: string
  image: string
  listings?: number
}

const mockItems: TopInterestItem[] = [
  {
    id: 'room',
    title: 'Cho thuê phòng trọ',
    categoryCode: CATEGORY_CODE.CHO_THUE_PHONG_TRO,
    listings: 1280,
  },
  {
    id: 'apartment',
    title: 'Cho thuê căn hộ',
    categoryCode: CATEGORY_CODE.CHO_THUE_CAN_HO,
    listings: 980,
  },
  {
    id: 'house',
    title: 'Cho thuê nhà nguyên căn',
    categoryCode: CATEGORY_CODE.CHO_THUE_NHA_NGUYEN_CAN,
    listings: 742,
  },
  {
    id: 'office',
    title: 'Cho thuê văn phòng',
    categoryCode: CATEGORY_CODE.CHO_THUE_VAN_PHONG,
    listings: 650,
  },
  {
    id: 'store',
    title: 'Cho thuê mặt bằng',
    categoryCode: CATEGORY_CODE.CHO_THUE_MAT_BANG,
    listings: 312,
  },
].map((item) => ({
  ...item,
  image: imageMapCategory[item.categoryCode] || '/images/default-image.jpg',
}))

const TopInterestSection = () => {
  const t = useTranslations('homePage.topInterest')
  const router = useRouter()
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
    <section className='mb-8 sm:mb-10'>
      <div className='flex items-center justify-between mb-4 sm:mb-5'>
        <h2 className='text-xl sm:text-2xl font-semibold'>{t('title')}</h2>
        <Button
          variant='ghost'
          size='sm'
          className='text-sm'
          onClick={() => router.push(PUBLIC_ROUTES.LISTING_LISTING)}
        >
          {t('viewAll')}
        </Button>
      </div>
      <Carousel
        className='group'
        opts={{ align: 'start', loop: true }}
        setApi={setApi}
      >
        <CarouselContent>
          {mockItems.map((item) => (
            <CarouselItem
              key={item.id}
              className='basis-full sm:basis-1/2 lg:basis-1/3'
            >
              <button
                type='button'
                className='w-full text-left relative rounded-lg overflow-hidden group/card border bg-background shadow-sm hover:shadow-md transition-all'
                onClick={() => router.push(PUBLIC_ROUTES.LISTING_LISTING)}
              >
                <div className='relative h-40 sm:h-44 lg:h-48 w-full'>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className='object-cover'
                    sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                    loading='lazy'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
                  <div className='absolute bottom-2 left-2 right-2'>
                    <p className='text-white font-medium text-sm sm:text-base drop-shadow'>
                      {item.title}
                    </p>
                    {item.listings && (
                      <span className='text-white/80 text-[11px] sm:text-xs'>
                        {item.listings.toLocaleString()} {t('listingsSuffix')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='hidden sm:flex -left-12' />
        <CarouselNext className='hidden sm:flex -right-12' />

        {/* Indicators - only show on mobile/tablet */}
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
    </section>
  )
}

export default TopInterestSection
