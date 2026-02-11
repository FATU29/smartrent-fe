import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Typography } from '@/components/atoms/typography'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'
import NewsGridItem from '@/components/atoms/newsGridItem'
import NewsGridItemSkeleton from '@/components/atoms/newsGridItem/NewsGridItemSkeleton'
import { PUBLIC_ROUTES } from '@/constants/route'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { NewsItem } from '@/api/types/news.type'

interface NewsGridSectionProps {
  news: NewsItem[]
  loading?: boolean
  /** Number of skeleton cards to show during loading */
  skeletonCount?: number
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  NEWS: 'news',
  BLOG: 'blog',
  MARKET_TREND: 'marketTrend',
  GUIDE: 'guide',
  ANNOUNCEMENT: 'announcement',
}

interface NewsGridContentProps {
  isMobile: boolean
  news: NewsItem[]
  featuredItem: NewsItem | null
  restItems: NewsItem[]
  getCategoryLabel: (category: string) => string
}

const NewsGridContent: React.FC<NewsGridContentProps> = ({
  isMobile,
  news,
  featuredItem,
  restItems,
  getCategoryLabel,
}) => {
  if (isMobile) {
    return (
      <Carousel
        opts={{ align: 'start', loop: false, dragFree: true }}
        className='w-full'
      >
        <CarouselContent className='-ml-3'>
          {news.slice(0, 5).map((item: NewsItem) => (
            <CarouselItem
              key={item.newsId}
              className='pl-3 basis-[75%] min-[480px]:basis-[60%]'
            >
              <NewsGridItem
                news={item}
                getCategoryLabel={getCategoryLabel}
                showSummary={false}
                showMeta
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'>
      {featuredItem && (
        <NewsGridItem
          key={featuredItem.newsId}
          news={featuredItem}
          variant='featured'
          getCategoryLabel={getCategoryLabel}
          showSummary
          showMeta
        />
      )}

      {restItems.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          {restItems.map((item: NewsItem) => (
            <NewsGridItem
              key={item.newsId}
              news={item}
              getCategoryLabel={getCategoryLabel}
              showSummary={false}
              showMeta
            />
          ))}
        </div>
      )}
    </div>
  )
}

const NewsGridSection: React.FC<NewsGridSectionProps> = ({
  news,
  loading = false,
  skeletonCount = 4,
}) => {
  const t = useTranslations('homePage.latestNews')
  const tCat = useTranslations('newsPage.categories')
  const isMobile = useIsMobile()

  const getCategoryLabel = (category: string) => {
    const key = CATEGORY_LABEL_MAP[category]
    return key ? tCat(key) : category.replace('_', ' ')
  }

  // Split into featured (first) + rest (up to 4)
  const featuredItem = news.length > 0 ? news[0] : null
  const restItems = news.slice(1, 5)

  // Don't render if no news and not loading
  if (!loading && (!news || news.length === 0)) return null

  return (
    <section className='py-6 sm:py-8'>
      {/* Section header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6'>
        <div>
          <Typography
            variant='h2'
            className='text-xl sm:text-2xl font-bold text-foreground'
          >
            {t('title')}
          </Typography>
          <Typography
            variant='p'
            className='text-sm text-muted-foreground mt-1'
          >
            {t('subtitle')}
          </Typography>
        </div>
        <Link href={PUBLIC_ROUTES.NEWS}>
          <Button
            variant='ghost'
            className='group gap-1 px-0 sm:px-3 text-primary hover:text-primary/80'
          >
            {t('viewAll')}
            <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
          </Button>
        </Link>
      </div>

      {/* Mobile: Carousel / Desktop: Featured + 2×2 Grid */}
      {loading ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'>
          <NewsGridItemSkeleton className='lg:row-span-2' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <NewsGridItemSkeleton key={`grid-skeleton-${i}`} />
            ))}
          </div>
        </div>
      ) : (
        <NewsGridContent
          isMobile={isMobile}
          news={news}
          featuredItem={featuredItem}
          restItems={restItems}
          getCategoryLabel={getCategoryLabel}
        />
      )}
    </section>
  )
}

export default NewsGridSection
