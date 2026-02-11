import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import classNames from 'classnames'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { NewsItem } from '@/api/types/news.type'
import { Calendar, Eye, User, Tag } from 'lucide-react'
import { PUBLIC_ROUTES } from '@/constants/route'
import {
  getCategoryConfig,
  formatPublishedDate,
  formatViewCount,
} from '@/utils/news'

interface NewsCardProps {
  news: NewsItem
  onClick?: (news: NewsItem) => void
  className?: string
  layout?: 'horizontal' | 'vertical'
}

const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onClick,
  className,
  layout = 'vertical',
}) => {
  const {
    title,
    slug,
    summary,
    category,
    tags,
    thumbnailUrl,
    publishedAt,
    authorName,
    viewCount,
  } = news

  const tCategories = useTranslations('newsPage.categories')

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick(news)
    }
  }

  const categoryConfig = getCategoryConfig(category, tCategories)

  const newsUrl = `${PUBLIC_ROUTES.NEWS}/${slug}`
  const imageUrl = thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`

  const isHorizontal = layout === 'horizontal'

  return (
    <Link
      href={newsUrl}
      onClick={handleClick}
      className={classNames(
        'group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl',
        className,
      )}
    >
      <Card
        className={classNames(
          'overflow-hidden transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          'h-full',
          {
            'flex flex-row': isHorizontal,
            'flex flex-col': !isHorizontal,
          },
        )}
      >
        {/* Image Section */}
        <div
          className={classNames('relative overflow-hidden bg-muted', {
            'w-1/3 min-w-[140px] max-w-[200px] flex-shrink-0 h-[120px]':
              isHorizontal,
            'aspect-video w-full': !isHorizontal,
          })}
        >
          <ImageAtom
            src={imageUrl}
            alt={title}
            width={isHorizontal ? 200 : 400}
            height={isHorizontal ? 120 : 225}
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

        {/* Content Section */}
        <CardContent
          className={classNames('flex flex-col flex-1 p-4', {
            'py-3': isHorizontal,
          })}
        >
          {/* Title */}
          <Typography
            variant='h4'
            className={classNames(
              'font-semibold line-clamp-2 group-hover:text-primary transition-colors',
              {
                'text-base': isHorizontal,
                'text-lg mb-2': !isHorizontal,
              },
            )}
          >
            {title}
          </Typography>

          {/* Summary */}
          <Typography
            variant='p'
            className={classNames('text-muted-foreground line-clamp-2', {
              'text-sm mt-1': isHorizontal,
              'text-sm mt-2': !isHorizontal,
            })}
          >
            {summary}
          </Typography>

          {/* Tags */}
          {tags && tags.length > 0 && !isHorizontal && (
            <div className='flex flex-wrap gap-1.5 mt-3'>
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full'
                >
                  <Tag className='w-3 h-3' />
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className='text-xs text-muted-foreground px-2 py-0.5'>
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div
            className={classNames(
              'flex flex-wrap items-center gap-3 text-xs text-muted-foreground',
              {
                'mt-2': isHorizontal,
                'mt-4 pt-3 border-t': !isHorizontal,
              },
            )}
          >
            {/* Author */}
            {authorName && (
              <span className='inline-flex items-center gap-1'>
                <User className='w-3.5 h-3.5' />
                <span className='truncate max-w-[100px]'>{authorName}</span>
              </span>
            )}

            {/* Date */}
            <span className='inline-flex items-center gap-1'>
              <Calendar className='w-3.5 h-3.5' />
              {formatPublishedDate(publishedAt)}
            </span>

            {/* View Count */}
            <span className='inline-flex items-center gap-1'>
              <Eye className='w-3.5 h-3.5' />
              {formatViewCount(viewCount)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default NewsCard
