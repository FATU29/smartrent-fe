import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import { Button } from '@/components/atoms/button'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { NewsItem } from '@/api/types/news.type'
import { Calendar, Eye, User, ArrowRight } from 'lucide-react'
import { PUBLIC_ROUTES } from '@/constants/route'
import {
  getCategoryConfig,
  formatPublishedDate,
  formatViewCount,
} from '@/utils/news'
import classNames from 'classnames'

interface LatestNewsSectionProps {
  news: NewsItem[]
  isLoading?: boolean
}

const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  news,
  isLoading = false,
}) => {
  const t = useTranslations('homePage.latestNews')
  const tCategories = useTranslations('newsPage.categories')

  if (isLoading) {
    return (
      <section className='mb-8 sm:mb-10'>
        <div className='mb-6'>
          <Typography variant='h2' className='text-2xl md:text-3xl font-bold'>
            {t('title')}
          </Typography>
          <Typography variant='p' className='text-muted-foreground mt-2'>
            {t('subtitle')}
          </Typography>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'>
          {[...Array(5)].map((_, i) => (
            <Card key={i} className='overflow-hidden animate-pulse'>
              <div className='aspect-video bg-muted' />
              <CardContent className='p-4 space-y-3'>
                <div className='h-4 bg-muted rounded w-3/4' />
                <div className='h-3 bg-muted rounded w-full' />
                <div className='h-3 bg-muted rounded w-2/3' />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (!news || news.length === 0) {
    return null
  }

  return (
    <section className='mb-8 sm:mb-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <div>
          <Typography variant='h2' className='text-2xl md:text-3xl font-bold'>
            {t('title')}
          </Typography>
          <Typography variant='p' className='text-muted-foreground mt-2'>
            {t('subtitle')}
          </Typography>
        </div>
        <Link href={PUBLIC_ROUTES.NEWS} passHref legacyBehavior>
          <Button variant='outline' className='mt-4 sm:mt-0'>
            {t('viewAll')}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </div>

      {/* News Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6'>
        {news.map((item) => {
          const categoryConfig = getCategoryConfig(item.category, tCategories)
          const newsUrl = `${PUBLIC_ROUTES.NEWS}/${item.slug}`
          const imageUrl = item.thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`

          return (
            <Link key={item.newsId} href={newsUrl} passHref legacyBehavior>
              <a
                className={classNames(
                  'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
                )}
              >
                <Card
                  className={classNames(
                    'overflow-hidden transition-all duration-200 h-full flex flex-col',
                    'hover:shadow-md hover:border-primary/30',
                  )}
                >
                  {/* Image */}
                  <div className='relative aspect-video overflow-hidden bg-muted'>
                    <ImageAtom
                      src={imageUrl}
                      alt={item.title}
                      width={400}
                      height={225}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />

                    {/* Category Badge */}
                    <div className='absolute top-3 left-3'>
                      <Badge
                        variant='outline'
                        className={classNames(
                          'text-xs font-medium',
                          categoryConfig.className,
                        )}
                      >
                        {categoryConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className='flex flex-col flex-1 p-4'>
                    {/* Title */}
                    <Typography
                      variant='h4'
                      className={classNames(
                        'font-semibold line-clamp-2 group-hover:text-primary transition-colors',
                        'text-base mb-2',
                      )}
                    >
                      {item.title}
                    </Typography>

                    {/* Summary */}
                    <Typography
                      variant='p'
                      className={classNames(
                        'text-muted-foreground line-clamp-2',
                        'text-sm mb-3 flex-1',
                      )}
                    >
                      {item.summary}
                    </Typography>

                    {/* Meta Info */}
                    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-3 border-t'>
                      {/* Author */}
                      {item.authorName && (
                        <span className='inline-flex items-center gap-1'>
                          <User className='w-3 h-3' />
                          <span className='truncate max-w-[80px]'>
                            {item.authorName}
                          </span>
                        </span>
                      )}

                      {/* Date */}
                      <span className='inline-flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {formatPublishedDate(item.publishedAt)}
                      </span>

                      {/* View Count */}
                      <span className='inline-flex items-center gap-1'>
                        <Eye className='w-3 h-3' />
                        {formatViewCount(item.viewCount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default LatestNewsSection
