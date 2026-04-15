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
  formatAuthorDisplayName,
  getCategoryConfig,
  formatPublishedDate,
  formatViewCount,
} from '@/utils/news'
import classNames from 'classnames'
import { cn } from '@/lib/utils'

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
  const tNews = useTranslations('newsPage')

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
          {Array.from({ length: 5 }).map((_, i) => (
            <Card
              key={`news-skeleton-${i}`}
              className='overflow-hidden animate-pulse'
            >
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

  const featured = news[0]
  const rest = news.slice(1, 5)

  const featuredCategoryConfig = featured
    ? getCategoryConfig(featured.category, tCategories)
    : null
  const featuredUrl = featured ? `${PUBLIC_ROUTES.NEWS}/${featured.slug}` : ''
  const featuredImageUrl =
    featured?.thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
  const featuredAuthor = featured
    ? formatAuthorDisplayName(featured.authorName, tNews('authorFallback'))
    : ''
  const featuredDate = featured
    ? formatPublishedDate(featured.publishedAt) || tNews('dateUnavailable')
    : ''

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

      {/* News Layout: featured (left ~60%) + 2×2 grid (right ~40%) */}
      <div className='flex flex-col lg:flex-row gap-4 md:gap-6'>
        {/* Featured Card */}
        {featured && featuredCategoryConfig && (
          <Link
            href={featuredUrl}
            className='group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl lg:flex-[3]'
          >
            <Card
              className={cn(
                'overflow-hidden transition-all duration-200 h-full flex flex-col py-0',
                'hover:shadow-md hover:border-primary/30',
              )}
            >
              <div className='relative overflow-hidden bg-muted flex-shrink-0 aspect-[16/10]'>
                <ImageAtom
                  src={featuredImageUrl}
                  alt={featured.title}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute top-3 left-3'>
                  <Badge
                    variant='outline'
                    className={classNames(
                      'text-xs font-medium',
                      featuredCategoryConfig.className,
                    )}
                  >
                    {featuredCategoryConfig.label}
                  </Badge>
                </div>
              </div>
              <CardContent className='flex flex-col flex-1 p-4'>
                <Typography
                  variant='h4'
                  className='font-semibold group-hover:text-primary transition-colors text-xl mb-3 line-clamp-2'
                >
                  {featured.title}
                </Typography>
                <Typography
                  variant='p'
                  className='text-muted-foreground line-clamp-2 text-sm mb-3 flex-1'
                >
                  {featured.summary}
                </Typography>
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-3 border-t mt-auto'>
                  <span className='inline-flex items-center gap-1'>
                    <User className='w-3 h-3' />
                    <span className='truncate max-w-[80px]'>
                      {featuredAuthor}
                    </span>
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='w-3 h-3' />
                    {featuredDate}
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Eye className='w-3 h-3' />
                    {formatViewCount(featured.viewCount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Right 2×2 Grid */}
        {rest.length > 0 && (
          <div className='lg:flex-[2] grid grid-cols-2 gap-4'>
            {rest.map((item) => {
              const categoryConfig = getCategoryConfig(
                item.category,
                tCategories,
              )
              const newsUrl = `${PUBLIC_ROUTES.NEWS}/${item.slug}`
              const imageUrl =
                item.thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
              const displayAuthor = formatAuthorDisplayName(
                item.authorName,
                tNews('authorFallback'),
              )
              const displayPublishedAt =
                formatPublishedDate(item.publishedAt) ||
                tNews('dateUnavailable')
              return (
                <Link
                  key={item.newsId}
                  href={newsUrl}
                  className='group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl'
                >
                  <Card
                    className={cn(
                      'overflow-hidden transition-all duration-200 h-full flex flex-col py-0',
                      'hover:shadow-md hover:border-primary/30',
                    )}
                  >
                    <div className='relative overflow-hidden bg-muted flex-shrink-0 aspect-video'>
                      <ImageAtom
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                      <div className='absolute top-2 left-2'>
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
                    <CardContent className='flex flex-col flex-1 p-3'>
                      <Typography
                        variant='h4'
                        className='font-semibold group-hover:text-primary transition-colors text-sm line-clamp-2 mb-auto'
                      >
                        {item.title}
                      </Typography>
                      <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-2'>
                        <span className='inline-flex items-center gap-1'>
                          <User className='w-3 h-3' />
                          <span className='truncate max-w-[60px]'>
                            {displayAuthor}
                          </span>
                        </span>
                        <span className='inline-flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {displayPublishedAt}
                        </span>
                        <span className='inline-flex items-center gap-1'>
                          <Eye className='w-3 h-3' />
                          {formatViewCount(item.viewCount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default LatestNewsSection
