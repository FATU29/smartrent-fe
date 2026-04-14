import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import classNames from 'classnames'
import { useListContext, List } from '@/contexts/list'
import { NewsItem } from '@/api/types/news.type'
import { NewsService } from '@/api/services/news.service'
import { Typography } from '@/components/atoms/typography'
import ImageAtom from '@/components/atoms/imageAtom'
import { Badge } from '@/components/atoms/badge'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card } from '@/components/atoms/card'
import NewsFilterBar from '@/components/molecules/newsFilterBar'
import NewsCard from '@/components/molecules/newsCard'
import { basePath, DEFAULT_IMAGE } from '@/constants'
import { PUBLIC_ROUTES } from '@/constants/route'
import {
  getCategoryConfig,
  formatAuthorDisplayName,
  formatPublishedDate,
  formatViewCount,
} from '@/utils/news'
import { Calendar, Eye, User, TrendingUp } from 'lucide-react'
import type { ListingFilterRequest } from '@/api/types/property.type'

// ─── Featured Article (first item – large horizontal card) ───────────────────

const FeaturedArticle: React.FC<{ news: NewsItem }> = ({ news }) => {
  const t = useTranslations('newsPage')
  const tCategories = useTranslations('newsPage.categories')

  const imageUrl = news.thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
  const newsUrl = `${PUBLIC_ROUTES.NEWS}/${news.slug}`
  const categoryConfig = getCategoryConfig(news.category, tCategories)
  const displayAuthor = formatAuthorDisplayName(
    news.authorName,
    t('authorFallback'),
  )
  const displayDate =
    formatPublishedDate(news.publishedAt) || t('dateUnavailable')

  return (
    <Link href={newsUrl} className='group block pb-6 border-b border-border'>
      <div className='flex flex-col sm:flex-row gap-5'>
        {/* Thumbnail */}
        <div className='relative w-full sm:w-[52%] aspect-[16/9] rounded-xl overflow-hidden flex-shrink-0'>
          <ImageAtom
            src={imageUrl}
            alt={news.title}
            width={800}
            height={450}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
          <div className='absolute top-3 left-3'>
            <Badge
              variant='outline'
              className={classNames(
                'text-xs font-medium backdrop-blur-sm bg-background/80',
                categoryConfig.className,
              )}
            >
              {categoryConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className='flex flex-col justify-between flex-1 sm:py-1'>
          <div>
            <Typography
              variant='h2'
              className='text-xl sm:text-2xl font-bold leading-tight line-clamp-3 group-hover:text-primary transition-colors mb-3'
            >
              {news.title}
            </Typography>
            <Typography
              variant='p'
              className='text-muted-foreground text-sm line-clamp-3 leading-relaxed'
            >
              {news.summary}
            </Typography>
          </div>
          <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-4 pt-3 border-t border-border'>
            <span className='inline-flex items-center gap-1.5'>
              <User className='w-3.5 h-3.5' />
              {displayAuthor}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='w-3.5 h-3.5' />
              {displayDate}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Eye className='w-3.5 h-3.5' />
              {formatViewCount(news.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Sidebar: Most Viewed Item ────────────────────────────────────────────────

const MostViewedItem: React.FC<{ news: NewsItem }> = ({ news }) => {
  const imageUrl = news.thumbnailUrl || `${basePath}${DEFAULT_IMAGE}`
  const newsUrl = `${PUBLIC_ROUTES.NEWS}/${news.slug}`

  return (
    <Link
      href={newsUrl}
      className='group flex gap-3 items-start py-3 border-b border-border last:border-b-0'
    >
      <div className='relative w-[72px] h-[52px] flex-shrink-0 rounded-lg overflow-hidden'>
        <ImageAtom
          src={imageUrl}
          alt={news.title}
          width={72}
          height={52}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors'>
          {news.title}
        </p>
        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground mt-1'>
          <Eye className='w-3 h-3' />
          {formatViewCount(news.viewCount)}
        </span>
      </div>
    </Link>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

const FeaturedSkeleton = () => (
  <div className='flex flex-col sm:flex-row gap-5 pb-6 border-b border-border'>
    <Skeleton className='w-full sm:w-[52%] aspect-[16/9] rounded-xl' />
    <div className='flex-1 space-y-3 py-1'>
      <Skeleton className='h-7 w-full' />
      <Skeleton className='h-7 w-4/5' />
      <Skeleton className='h-4 w-full mt-2' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-2/3' />
    </div>
  </div>
)

const ArticleSkeleton = () => (
  <div className='flex gap-4 py-4 border-b border-border'>
    <Skeleton className='w-[150px] h-[100px] rounded-lg flex-shrink-0' />
    <div className='flex-1 space-y-2 py-1'>
      <Skeleton className='h-3.5 w-1/4' />
      <Skeleton className='h-5 w-full' />
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-3.5 w-1/2 mt-1' />
    </div>
  </div>
)

const SidebarSkeleton = () => (
  <div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className='flex gap-3 py-3 border-b border-border last:border-b-0'
      >
        <Skeleton className='w-[72px] h-[52px] rounded-lg flex-shrink-0' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-3.5 w-full' />
          <Skeleton className='h-3.5 w-3/4' />
          <Skeleton className='h-3 w-1/4' />
        </div>
      </div>
    ))}
  </div>
)

// ─── Main template ────────────────────────────────────────────────────────────

interface NewsListTemplateProps {
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
  selectedTag?: string
  onTagClear?: () => void
  onListReady?: (actions: {
    updateFilters: (f: Partial<ListingFilterRequest>) => void
  }) => void
}

const NewsListTemplate: React.FC<NewsListTemplateProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagClear,
  onListReady,
}) => {
  const t = useTranslations('newsPage')
  const { items, isLoading, updateFilters } = useListContext<NewsItem>()
  const [layout, setLayout] = useState<'grid' | 'list'>('list')
  const [mostViewed, setMostViewed] = useState<NewsItem[]>([])
  const [isSidebarLoading, setIsSidebarLoading] = useState(true)

  // Expose context actions to the page
  useEffect(() => {
    onListReady?.({ updateFilters })
  }, [onListReady, updateFilters])

  // Fetch most-viewed: grab a batch and sort client-side by viewCount
  useEffect(() => {
    NewsService.getList({ page: 1, size: 20 }).then((res) => {
      if (res.success && res.data?.news) {
        const sorted = [...res.data.news]
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 7)
        setMostViewed(sorted)
      }
      setIsSidebarLoading(false)
    })
  }, [])

  const featuredItem = items[0]
  const listItems = items.slice(1)
  const isInitialLoading = isLoading && items.length === 0

  return (
    <div className='px-4 sm:px-6'>
      {/* Header */}
      <header className='mb-6'>
        <Typography
          variant='h1'
          className='text-2xl md:text-3xl font-bold mb-1'
        >
          {t('title')}
        </Typography>
        <Typography variant='p' className='text-muted-foreground text-sm'>
          {t('subtitle')}
        </Typography>
      </header>

      {/* Filter bar */}
      <div className='mb-7'>
        <NewsFilterBar
          layout={layout}
          onLayoutChange={setLayout}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedTag={selectedTag}
          onTagClear={onTagClear}
        />
      </div>

      {/* Two-column layout */}
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* ── Main column ── */}
        <div className='flex-1 min-w-0'>
          {isInitialLoading ? (
            <>
              <FeaturedSkeleton />
              {Array.from({ length: 4 }).map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              {/* Featured article */}
              {featuredItem && (
                <div className='mb-0'>
                  <FeaturedArticle news={featuredItem} />
                </div>
              )}

              {/* Remaining articles */}
              <div>
                {listItems.map((news) => (
                  <div
                    key={news.newsId}
                    className='py-4 border-b border-border last:border-b-0'
                  >
                    <NewsCard news={news} layout='horizontal' />
                  </div>
                ))}
              </div>

              {/* Append-loading skeleton */}
              {isLoading && items.length > 0 && (
                <div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ArticleSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Xem thêm */}
              <div className='mt-8 flex justify-center'>
                <List.LoadMore
                  variant='default'
                  className='px-10 bg-blue-600 hover:bg-blue-700 text-white border-0'
                  labelIdleKey='newsPage.viewMore'
                  labelLoadingKey='newsPage.loadingMore'
                />
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className='w-full lg:w-[300px] xl:w-[320px] flex-shrink-0'>
          <div className='sticky top-20'>
            <Card className='py-0 overflow-hidden'>
              <div className='flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40'>
                <TrendingUp className='w-4 h-4 text-primary flex-shrink-0' />
                <Typography variant='h4' className='font-semibold text-sm'>
                  Bài viết đọc nhiều nhất
                </Typography>
              </div>
              <div className='px-4'>
                {isSidebarLoading ? (
                  <SidebarSkeleton />
                ) : (
                  mostViewed.map((news) => (
                    <MostViewedItem key={news.newsId} news={news} />
                  ))
                )}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default NewsListTemplate
