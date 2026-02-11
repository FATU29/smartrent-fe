import React, { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { NewsItem } from '@/api/types/news.type'
import { Typography } from '@/components/atoms/typography'
import NewsFilterBar from '@/components/molecules/newsFilterBar'
import NewsListContent from '@/components/molecules/newsListContent'
import type { ListingFilterRequest } from '@/api/types/property.type'

// ─── Sub-components ──────────────────────────────────────

/** Page title + subtitle */
const NewsPageHeader: React.FC = () => {
  const t = useTranslations('newsPage')
  return (
    <header className='mb-8'>
      <Typography variant='h1' className='text-2xl md:text-3xl font-bold mb-2'>
        {t('title')}
      </Typography>
      <Typography variant='p' className='text-muted-foreground'>
        {t('subtitle')}
      </Typography>
    </header>
  )
}

/** Result count line */
const NewsResultCount: React.FC = () => {
  const t = useTranslations('newsPage')
  const { pagination, isLoading } = useListContext<NewsItem>()

  if (isLoading) return null

  return (
    <div className='mb-4'>
      <Typography variant='p' className='text-muted-foreground text-sm'>
        {t('resultCount', { count: pagination.totalCount })}
      </Typography>
    </div>
  )
}

// ─── Main template ───────────────────────────────────────

interface NewsListTemplateProps {
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
  onListReady?: (actions: {
    updateFilters: (f: Partial<ListingFilterRequest>) => void
  }) => void
}

const NewsListTemplate: React.FC<NewsListTemplateProps> = ({
  selectedCategory,
  onCategoryChange,
  onListReady,
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const { updateFilters } = useListContext<NewsItem>()

  // Expose context actions to the page so category change triggers fetch
  useEffect(() => {
    onListReady?.({ updateFilters })
  }, [onListReady, updateFilters])

  /** Clear category when empty state triggers a full reset */
  const handleResetAllFilters = useCallback(() => {
    onCategoryChange?.(undefined)
  }, [onCategoryChange])

  return (
    <>
      {/* Page header */}
      <NewsPageHeader />

      {/* Filter bar */}
      <div className='mb-6'>
        <NewsFilterBar
          layout={layout}
          onLayoutChange={setLayout}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Result count */}
      <NewsResultCount />

      {/* News list */}
      <main>
        <NewsListContent
          layout={layout}
          onResetAllFilters={handleResetAllFilters}
        />
      </main>
    </>
  )
}

export default NewsListTemplate
