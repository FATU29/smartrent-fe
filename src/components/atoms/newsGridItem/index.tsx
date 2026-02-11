import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { NewsItem } from '@/api/types/news.type'
import { Calendar, Eye, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { PUBLIC_ROUTES } from '@/constants/route'

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

const formatPublishedDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

const formatViewCount = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

const CATEGORY_STYLES: Record<string, string> = {
  NEWS: 'bg-primary/10 text-primary border-primary/20',
  BLOG: 'bg-secondary text-secondary-foreground border-secondary/20',
  MARKET_TREND: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  GUIDE: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  ANNOUNCEMENT: 'bg-destructive/10 text-destructive border-destructive/20',
}

const NewsGridItem: React.FC<NewsGridItemProps> = ({
  news,
  className,
  variant = 'default',
  showSummary = true,
  showMeta = true,
  getCategoryLabel,
}) => {
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

  return (
    <Link href={newsUrl} passHref legacyBehavior>
      <a
        className={classNames(
          'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
          className,
        )}
      >
        <Card
          className={classNames(
            'overflow-hidden transition-all duration-200 h-full flex flex-col',
            'hover:shadow-md hover:border-primary/30',
          )}
        >
          {/* Thumbnail */}
          <div
            className={classNames(
              'relative overflow-hidden bg-muted',
              isFeatured ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[16/10]',
            )}
          >
            <ImageAtom
              src={imageUrl}
              alt={title}
              width={isFeatured ? 600 : 320}
              height={isFeatured ? 375 : 200}
              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
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
                  'font-medium backdrop-blur-sm bg-background/80',
                  isFeatured ? 'text-xs' : 'text-[10px] px-1.5 py-0.5',
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
              variant={isFeatured ? 'h3' : 'h4'}
              className={classNames(
                'font-semibold line-clamp-2 group-hover:text-primary transition-colors',
                isFeatured ? 'text-lg sm:text-xl mb-2' : 'text-sm mb-1.5',
              )}
            >
              {title}
            </Typography>

            {showSummary && (
              <Typography
                variant='p'
                className={classNames(
                  'text-muted-foreground flex-1',
                  isFeatured
                    ? 'text-sm sm:text-base line-clamp-3 mb-3'
                    : 'text-xs line-clamp-2 mb-2',
                )}
              >
                {summary}
              </Typography>
            )}

            {showMeta && (
              <div
                className={classNames(
                  'flex flex-wrap items-center text-muted-foreground border-t',
                  isFeatured
                    ? 'gap-2 text-xs pt-3'
                    : 'gap-1.5 text-[11px] pt-2',
                )}
              >
                {authorName && (
                  <span className='inline-flex items-center gap-1'>
                    <User className={isFeatured ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
                    <span className='truncate max-w-[80px]'>{authorName}</span>
                  </span>
                )}
                <span className='inline-flex items-center gap-1'>
                  <Calendar
                    className={isFeatured ? 'w-3 h-3' : 'w-2.5 h-2.5'}
                  />
                  {formatPublishedDate(publishedAt)}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Eye className={isFeatured ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
                  {formatViewCount(viewCount)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  )
}

export default NewsGridItem
