import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { PUBLIC_ROUTES } from '@/constants/route'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
import { Skeleton } from '@/components/atoms/skeleton'
import { Typography } from '@/components/atoms/typography'

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
  const isLoading = categoryStats === undefined
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
    <section className='mb-10 sm:mb-14'>
      <div className='flex items-center justify-between mb-5 sm:mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-7 sm:h-8 rounded-full bg-primary' />
          <Typography variant='sectionTitle' className='text-foreground'>
            {t('title')}
          </Typography>
        </div>
        <Link href={PUBLIC_ROUTES.LISTING_LISTING}>
          <Button
            variant='ghost'
            className='group gap-1 px-0 sm:px-3 text-primary hover:text-primary/80'
          >
            {t('viewAll')}
            <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <TopInterestSectionSkeleton />
      ) : items.length === 0 ? (
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
          opts={{ align: 'start', loop: false }}
          setApi={setApi}
        >
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className='basis-full sm:basis-1/2 lg:basis-1/3'
              >
                <Link
                  href={`${PUBLIC_ROUTES.LISTING_LISTING}?categoryId=${item.id}`}
                  className='block w-full text-left relative rounded-lg overflow-hidden group/card border bg-background shadow-sm hover:shadow-md transition-all'
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
                      <span className='text-white/80 text-2xs sm:text-xs'>
                        {item.listings.toLocaleString()} {t('listingsSuffix')}
                      </span>
                    </div>
                  </div>
                </Link>
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

const TopInterestSectionSkeleton = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className='w-full rounded-lg overflow-hidden border bg-background shadow-sm'
        >
          <Skeleton className='h-40 sm:h-44 lg:h-48 w-full rounded-none' />
          <div className='p-3 space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TopInterestSection
