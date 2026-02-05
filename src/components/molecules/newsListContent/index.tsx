import React from 'react'
import { useListContext } from '@/contexts/list'
import NewsCard from '@/components/molecules/newsCard'
import { NewsCardSkeleton } from '@/components/atoms/newsCardSkeleton'
import ListPagination from '@/contexts/list/index.pagination'
import NewsEmptyState from '@/components/atoms/newsEmptyState'
import { NewsItem } from '@/api/types/news.type'

interface NewsListContentProps {
  onNewsClick?: (news: NewsItem) => void
  layout?: 'grid' | 'list'
}

const NewsListContent: React.FC<NewsListContentProps> = ({
  onNewsClick,
  layout = 'grid',
}) => {
  const { items, isLoading } = useListContext<NewsItem>()

  const NewsSkeleton = (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
          : 'space-y-4'
      }
    >
      <NewsCardSkeleton
        count={6}
        layout={layout === 'list' ? 'horizontal' : 'vertical'}
      />
    </div>
  )

  if (isLoading && items.length === 0) {
    return NewsSkeleton
  }

  if (items.length === 0) {
    return <NewsEmptyState />
  }

  return (
    <div className='space-y-6'>
      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
            : 'space-y-4'
        }
      >
        {items.map((news: NewsItem) => (
          <NewsCard
            key={news.newsId}
            news={news}
            onClick={onNewsClick}
            layout={layout === 'list' ? 'horizontal' : 'vertical'}
          />
        ))}
      </div>

      {/* Show loading skeleton during client-side fetch */}
      {isLoading && items.length > 0 && (
        <div
          className={
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
              : 'space-y-4'
          }
        >
          <NewsCardSkeleton
            count={3}
            layout={layout === 'list' ? 'horizontal' : 'vertical'}
          />
        </div>
      )}

      {/* Pagination */}
      {items.length > 0 && (
        <div className='mt-8'>
          <ListPagination showPerPageSelector={false} />
        </div>
      )}
    </div>
  )
}

export default NewsListContent
