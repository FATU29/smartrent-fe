import React from 'react'
import { useTranslations } from 'next-intl'
import { Typography } from '@/components/atoms/typography'
import NewsCard from '@/components/molecules/newsCard'
import { NewsItem } from '@/api/types/news.type'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/atoms/carousel'

interface NewsRelatedSectionProps {
  relatedNews: NewsItem[]
  className?: string
}

const NewsRelatedSection: React.FC<NewsRelatedSectionProps> = ({
  relatedNews,
  className,
}) => {
  const t = useTranslations('newsPage')
  const isMobile = useIsMobile()

  if (!relatedNews || relatedNews.length === 0) return null

  const items = relatedNews.slice(0, 3)

  return (
    <section className={`pt-10 border-t border-border/60 ${className || ''}`}>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-1 h-6 bg-primary rounded-full' />
        <Typography variant='h2' className='text-xl font-bold'>
          {t('relatedNews')}
        </Typography>
      </div>

      {/* Mobile: Carousel */}
      {isMobile ? (
        <Carousel
          opts={{
            align: 'start',
            loop: false,
            dragFree: true,
          }}
          className='w-full -ml-1'
        >
          <CarouselContent className='-ml-3'>
            {items.map((relatedItem) => (
              <CarouselItem
                key={relatedItem.newsId}
                className='pl-3 basis-[80%]'
              >
                <NewsCard news={relatedItem} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        /* Desktop: Grid */
        <div className='grid grid-cols-2 lg:grid-cols-3 gap-5'>
          {items.map((relatedItem) => (
            <NewsCard key={relatedItem.newsId} news={relatedItem} />
          ))}
        </div>
      )}
    </section>
  )
}

export default NewsRelatedSection
