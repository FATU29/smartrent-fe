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
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
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
import {
  Calendar,
  Eye,
  User,
  TrendingUp,
  MapPin,
  Search,
  X,
  SearchX,
  Inbox,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import type { ListingFilterRequest } from '@/api/types/property.type'
import Image from 'next/image'
import { PROVINCE_CODE, PROVINCE_ID } from '@/utils/mapper'

// ─── Static city data for sidebar ────────────────────────────────────────────

const SIDEBAR_CITIES = [
  {
    id: PROVINCE_ID.HANOI,
    code: PROVINCE_CODE.HANOI,
    name: 'Hà Nội',
    image: '/images/ha-noi.jpg',
  },
  {
    id: PROVINCE_ID.HO_CHI_MINH,
    code: PROVINCE_CODE.HO_CHI_MINH,
    name: 'Hồ Chí Minh',
    image: '/images/ho-chi-minh.jpg',
  },
  {
    id: PROVINCE_ID.DA_NANG,
    code: PROVINCE_CODE.DA_NANG,
    name: 'Đà Nẵng',
    image: '/images/da-nang.jpg',
  },
  {
    id: PROVINCE_ID.BINH_DUONG,
    code: PROVINCE_CODE.BINH_DUONG,
    name: 'Bình Dương',
    image: '/images/binh-duong.png',
  },
  {
    id: PROVINCE_ID.DONG_NAI,
    code: PROVINCE_CODE.DONG_NAI,
    name: 'Đồng Nai',
    image: '/images/dong-nai.jpg',
  },
]

// ─── Sidebar: Location widget ─────────────────────────────────────────────────

const LocationWidget: React.FC = () => {
  const topCities = SIDEBAR_CITIES.slice(0, 2)
  const restCities = SIDEBAR_CITIES.slice(2)

  return (
    <Card className='py-0 overflow-hidden mt-4'>
      <div className='flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40'>
        <MapPin className='w-4 h-4 text-primary flex-shrink-0' />
        <Typography variant='h4' className='font-semibold text-sm'>
          Thị trường BĐS theo địa điểm
        </Typography>
      </div>

      {/* Top 2 cities – larger image cards */}
      <div className='grid grid-cols-2 gap-2 p-3'>
        {topCities.map((city) => (
          <Link
            key={city.id}
            href={`${PUBLIC_ROUTES.LISTING_LISTING}?provinceId=${city.id}&provinceCode=${city.code}`}
            className='group block relative rounded-lg overflow-hidden'
          >
            <div className='relative h-[90px]'>
              <Image
                src={city.image}
                alt={city.name}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes='150px'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
              <span className='absolute bottom-2 left-2 right-2 text-white text-xs font-semibold leading-tight drop-shadow'>
                {city.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Remaining cities – compact list */}
      <div className='px-3 pb-3 space-y-2'>
        {restCities.map((city) => (
          <Link
            key={city.id}
            href={`${PUBLIC_ROUTES.LISTING_LISTING}?provinceId=${city.id}&provinceCode=${city.code}`}
            className='group flex items-center gap-2.5 rounded-lg hover:bg-muted/60 transition-colors p-1'
          >
            <div className='relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden'>
              <Image
                src={city.image}
                alt={city.name}
                fill
                className='object-cover'
                sizes='40px'
              />
            </div>
            <Typography
              variant='small'
              className='text-sm font-medium group-hover:text-primary transition-colors'
            >
              {city.name}
            </Typography>
          </Link>
        ))}
      </div>
    </Card>
  )
}

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

// ─── Empty state ──────────────────────────────────────────────────────────────

const NewsEmptyState: React.FC<{
  hasActiveFilter: boolean
  onReset: () => void
}> = ({ hasActiveFilter, onReset }) => {
  const t = useTranslations('newsPage')
  const Icon = hasActiveFilter ? SearchX : Inbox

  return (
    <Card className='flex flex-col items-center justify-center text-center py-10 px-5 sm:py-16 sm:px-10'>
      <div className='mb-5 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 text-primary'>
        <Icon className='w-8 h-8 sm:w-10 sm:h-10' />
      </div>
      <Typography
        variant='h3'
        className='text-lg sm:text-xl font-semibold tracking-tight mb-2'
      >
        {hasActiveFilter ? t('emptyState.searchTitle') : t('emptyState.title')}
      </Typography>
      <Typography
        variant='p'
        className='text-sm text-muted-foreground max-w-md leading-relaxed mb-6'
      >
        {hasActiveFilter
          ? t('emptyState.searchDescription')
          : t('emptyState.description')}
      </Typography>

      {hasActiveFilter && (
        <>
          <Button
            onClick={onReset}
            className='gap-2 w-full sm:w-auto sm:min-w-[200px]'
          >
            <RefreshCw className='w-4 h-4' />
            {t('emptyState.resetFilters')}
          </Button>

          <div className='w-full max-w-sm text-left border-t border-border mt-8 pt-5'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-center'>
              {t('emptyState.tips')}
            </p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {[1, 2, 3].map((n) => (
                <li key={n} className='flex items-start gap-2'>
                  <CheckCircle2 className='w-4 h-4 text-primary flex-shrink-0 mt-0.5' />
                  <span>{t(`emptyState.tip${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Card>
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
  const { items, isLoading, updateFilters, filters, setKeyword } =
    useListContext<NewsItem>()
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
  const hasActiveFilter = Boolean(
    filters.keyword || selectedCategory || selectedTag,
  )
  const showEmpty = !isLoading && items.length === 0

  const handleResetFilters = () => {
    setKeyword('')
    onCategoryChange?.(undefined)
    onTagClear?.()
  }

  return (
    <div className='px-4 sm:px-6'>
      {/* Header: title + subtitle (left) + search bar (right) */}
      <header className='mb-4'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
          <div>
            <Typography
              variant='h1'
              className='text-2xl md:text-3xl font-bold mb-1'
            >
              {t('title')}
            </Typography>
            <Typography variant='p' className='text-muted-foreground text-sm'>
              {t('subtitle')}
            </Typography>
          </div>
          {/* Search — right-aligned on desktop */}
          <div className='relative sm:w-64 lg:w-72 flex-shrink-0'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
            <Input
              type='text'
              placeholder={t('searchPlaceholder')}
              value={filters.keyword || ''}
              onChange={(e) => setKeyword(e.target.value)}
              className='pl-9 pr-9'
            />
            {filters.keyword && (
              <button
                type='button'
                onClick={() => setKeyword('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sticky category tab bar */}
      <div className='mb-6'>
        <NewsFilterBar
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
          ) : showEmpty ? (
            <NewsEmptyState
              hasActiveFilter={hasActiveFilter}
              onReset={handleResetFilters}
            />
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
                  className='px-10 bg-primary text-primary-foreground hover:bg-primary/90 border-0'
                  labelIdleKey='newsPage.viewMore'
                  labelLoadingKey='newsPage.loadingMore'
                />
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className='w-full lg:w-[300px] xl:w-[320px] flex-shrink-0'>
          <div className='sticky top-20 space-y-0'>
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

            <LocationWidget />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default NewsListTemplate
