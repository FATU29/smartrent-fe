import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import NewsListContent from '@/components/molecules/newsListContent'
import NewsFilterBar from '@/components/molecules/newsFilterBar'
import { Typography } from '@/components/atoms/typography'
import { useListContext } from '@/contexts/list'
import { NewsItem } from '@/api/types/news.type'

interface NewsListTemplateProps {
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
}

const NewsListTemplate: React.FC<NewsListTemplateProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const t = useTranslations('newsPage')
  const { pagination } = useListContext<NewsItem>()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  return (
    <>
      {/* Filter Bar */}
      <div className='mb-6'>
        <NewsFilterBar
          layout={layout}
          onLayoutChange={setLayout}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Header Section */}
      <header className='mb-4'>
        <Typography variant='p' className='text-muted-foreground text-sm'>
          {t('resultCount', { count: pagination.totalCount })}
        </Typography>
      </header>

      {/* Main Content */}
      <main>
        <NewsListContent layout={layout} />
      </main>
    </>
  )
}

export default NewsListTemplate
