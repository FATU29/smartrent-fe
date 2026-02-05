import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { Input } from '@/components/atoms/input'
import { NewsCategory, NewsItem } from '@/api/types/news.type'
import { Search, X, LayoutGrid, List } from 'lucide-react'
import classNames from 'classnames'

interface NewsFilterBarProps {
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
}

const NewsFilterBar: React.FC<NewsFilterBarProps> = ({
  layout,
  onLayoutChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const t = useTranslations('newsPage')
  const tCategories = useTranslations('newsPage.categories')
  const { filters, setKeyword, activeFilterCount, resetFilters } =
    useListContext<NewsItem>()

  const categories = useMemo(
    () => [
      { value: undefined, label: t('allCategories') },
      { value: NewsCategory.NEWS, label: tCategories('news') },
      { value: NewsCategory.BLOG, label: tCategories('blog') },
      { value: NewsCategory.MARKET_TREND, label: tCategories('marketTrend') },
      { value: NewsCategory.GUIDE, label: tCategories('guide') },
      {
        value: NewsCategory.ANNOUNCEMENT,
        label: tCategories('announcement'),
      },
    ],
    [t, tCategories],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const handleCategoryClick = (category: NewsCategory | undefined) => {
    onCategoryChange?.(category)
  }

  const handleClearFilters = () => {
    resetFilters()
    onCategoryChange?.(undefined)
  }

  const totalActiveFilters = activeFilterCount + (selectedCategory ? 1 : 0)

  return (
    <div className='space-y-4'>
      {/* Search and Layout Toggle Row */}
      <div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
        {/* Search Input */}
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={filters.keyword || ''}
            onChange={handleSearchChange}
            className='pl-9 pr-9'
          />
          {filters.keyword && (
            <button
              onClick={() => setKeyword('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Layout Toggle (Desktop) */}
        <div className='hidden sm:flex items-center gap-1 border rounded-lg p-1'>
          <Button
            variant={layout === 'grid' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onLayoutChange('grid')}
            className='h-8 w-8 p-0'
          >
            <LayoutGrid className='h-4 w-4' />
          </Button>
          <Button
            variant={layout === 'list' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onLayoutChange('list')}
            className='h-8 w-8 p-0'
          >
            <List className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className='flex flex-wrap gap-2'>
        {categories.map((cat) => (
          <Button
            key={cat.value || 'all'}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => handleCategoryClick(cat.value)}
            className={classNames('transition-all', {
              'border-primary': selectedCategory === cat.value,
            })}
          >
            {cat.label}
          </Button>
        ))}

        {/* Clear Filters */}
        {totalActiveFilters > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearFilters}
            className='text-muted-foreground'
          >
            <X className='h-4 w-4 mr-1' />
            {t('clearFilters')}
            <Badge variant='secondary' className='ml-1'>
              {totalActiveFilters}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  )
}

export default NewsFilterBar
