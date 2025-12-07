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
import type { CategoryStatsItem } from '@/api/types'

interface TopInterestItem {
  id: number
  title: string
  image: string
  listings: number
  slug: string
}

interface TopInterestSectionProps {
  categoryStats?: CategoryStatsItem[]
}

const TopInterestSection: React.FC<TopInterestSectionProps> = ({
  categoryStats,
}) => {
  const t = useTranslations('homePage.topInterest')
  const router = useRouter()
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  // Map category stats to display items
  const items: TopInterestItem[] = React.useMemo(() => {
    if (!categoryStats || categoryStats.length === 0) {
      return []
    }

    return categoryStats.map((stat) => {
      // Map categoryId to categoryCode for image lookup
      const categoryCodeMap: Record<number, number> = {
        1: CATEGORY_CODE.CHO_THUE_PHONG_TRO,
        2: CATEGORY_CODE.CHO_THUE_CAN_HO,
        3: CATEGORY_CODE.CHO_THUE_NHA_NGUYEN_CAN,
        4: CATEGORY_CODE.CHO_THUE_VAN_PHONG,
        5: CATEGORY_CODE.CHO_THUE_MAT_BANG,
      }

      const categoryCode = categoryCodeMap[stat.categoryId]
      const image =
        imageMapCategory[categoryCode] || '/images/default-image.jpg'

      return {
        id: stat.categoryId,
        title: stat.categoryName,
        slug: stat.categorySlug,
        image,
        listings: stat.totalListings,
      }
    })
  }, [categoryStats])

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

      {items.length === 0 ? (
        <div className='text-center py-12 px-4 border rounded-lg bg-muted/30'>
          <div className='max-w-md mx-auto'>
            <svg
              className='mx-auto h-12 w-12 text-muted-foreground mb-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
              />
            </svg>
            <h3 className='text-lg font-medium text-foreground mb-2'>
              {t('noCategories')}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {t('noCategoriesDescription')}
            </p>
          </div>
        </div>
      ) : (
        <Carousel
          className='group'
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
        >
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className='basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <button
                  type='button'
                  className='w-full text-left relative rounded-lg overflow-hidden group/card border bg-background shadow-sm hover:shadow-md transition-all'
                  onClick={() =>
                    router.push(
                      `${PUBLIC_ROUTES.LISTING_LISTING}?categoryId=${item.id}`,
                    )
                  }
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
                      <span className='text-white/80 text-[11px] sm:text-xs'>
                        {item.listings.toLocaleString()} {t('listingsSuffix')}
                      </span>
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
      )}
    </section>
  )
}

export default TopInterestSection
