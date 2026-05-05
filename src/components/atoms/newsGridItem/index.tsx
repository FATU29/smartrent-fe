import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { NewsItem } from '@/api/types/news.type'
import { Calendar, Eye, User } from 'lucide-react'
import { PUBLIC_ROUTES } from '@/constants/route'
import {
  formatAuthorDisplayName,
  formatPublishedDate,
  formatViewCount,
} from '@/utils/news'

export interface NewsGridItemProps {
  news: NewsItem
  className?: string
  /** Card variant: 'featured' renders a larger card for the hero slot */
  variant?: 'default' | 'featured'
  /** Show summary text underneath title */
  showSummary?: boolean
  /** Show meta row (author, date, views) */
  showMeta?: boolean
  /** Category label overrides from parent */
  getCategoryLabel?: (cat: string) => string
}

// Helpers

const CATEGORY_STYLES: Record<string, string> = {
  NEWS: 'bg-primary text-primary-foreground border-primary',
  BLOG: 'bg-secondary text-secondary-foreground border-secondary',
  POLICY: 'bg-orange-500 text-white border-orange-500',
  MARKET: 'bg-amber-500 text-white border-amber-500',
  PROJECT: 'bg-cyan-600 text-white border-cyan-600',
  INVESTMENT: 'bg-pink-600 text-white border-pink-600',
  MARKET_TREND: 'bg-chart-1 text-white border-chart-1',
  GUIDE: 'bg-chart-2 text-white border-chart-2',
  ANNOUNCEMENT: 'bg-destructive text-white border-destructive',
}

const NewsGridItem: React.FC<NewsGridItemProps> = ({
  news,
  className,
  variant = 'default',
  showSummary = true,
  showMeta = true,
  getCategoryLabel,
}) => {
  const t = useTranslations('newsPage')

  const isFeatured = variant === 'featured'
  const {
    title,
    slug,
    summary,
    category,
    thumbnailUrl,
    publishedAt,
    authorName,
    viewCount,
  } = news

  const imageUrl = thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
  const newsUrl = `${PUBLIC_ROUTES.NEWS}/${slug}`
  const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.NEWS
  const catLabel = getCategoryLabel
    ? getCategoryLabel(category)
    : category.replace('_', ' ')
  const displayAuthor = formatAuthorDisplayName(authorName, t('authorFallback'))
  const displayPublishedAt =
    formatPublishedDate(publishedAt) || t('dateUnavailable')

  return (
    <Link
      href={newsUrl}
      className={classNames(
        'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
        className,
      )}
    >
      <Card
        className={classNames(
          'overflow-hidden transition-all duration-200 h-full flex flex-col py-0',
          'hover:shadow-md hover:border-primary/30',
        )}
      >
        {/* Thumbnail */}
        <div
          className={classNames(
            'relative overflow-hidden bg-muted flex-shrink-0',
            isFeatured ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[16/10]',
          )}
        >
          <ImageAtom
            src={imageUrl}
            alt={title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
          <div
            className={classNames(
              'absolute',
              isFeatured ? 'top-3 left-3' : 'top-2 left-2',
            )}
          >
            <Badge
              variant='outline'
              className={classNames(
                'font-medium',
                isFeatured ? 'text-xs' : 'text-nano px-1.5 py-px h-auto',
                catStyle,
              )}
            >
              {catLabel}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <CardContent
          className={classNames(
            'flex flex-col flex-1',
            isFeatured ? 'p-5' : 'p-3',
          )}
        >
          <Typography
            variant={isFeatured ? 'h3' : 'h6'}
            className={classNames(
              'font-semibold line-clamp-2 group-hover:text-primary transition-colors',
              isFeatured ? 'mb-2' : 'mb-1.5',
            )}
          >
            {title}
          </Typography>

          {showSummary && (
            <Typography
              variant='muted'
              className={classNames(
                'flex-1',
                isFeatured ? 'line-clamp-3 mb-3' : 'line-clamp-2 mb-2',
              )}
            >
              {summary}
            </Typography>
          )}

          {showMeta && (
            <div
              className={classNames(
                'text-sm text-muted-foreground border-t',
                isFeatured
                  ? 'flex items-center justify-between gap-2 pt-3'
                  : 'flex flex-col gap-1 pt-2',
              )}
            >
              {isFeatured ? (
                <div className='flex items-center gap-2 min-w-0'>
                  <span className='inline-flex items-center gap-1 min-w-0'>
                    <User className='w-3.5 h-3.5 shrink-0' />
                    <span className='truncate'>{displayAuthor}</span>
                  </span>
                  <span className='inline-flex items-center gap-1 shrink-0'>
                    <Calendar className='w-3.5 h-3.5' />
                    {displayPublishedAt}
                  </span>
                </div>
              ) : (
                <span className='inline-flex items-center gap-1 min-w-0'>
                  <User className='w-3 h-3 shrink-0' />
                  <span className='truncate'>{displayAuthor}</span>
                </span>
              )}

              {isFeatured ? (
                <span className='inline-flex items-center gap-1 shrink-0'>
                  <Eye className='w-3.5 h-3.5' />
                  {formatViewCount(viewCount)}
                </span>
              ) : (
                <div className='flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1'>
                    <Calendar className='w-3.5 h-3.5' />
                    {displayPublishedAt}
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Eye className='w-3.5 h-3.5' />
                    {formatViewCount(viewCount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default NewsGridItem
