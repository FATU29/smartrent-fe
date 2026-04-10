import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Badge } from '@/components/atoms/badge'
import { NewsCategory, NewsItem } from '@/api/types/news.type'
import { Search, X, LayoutGrid, List } from 'lucide-react'
import classNames from 'classnames'

interface NewsFilterBarProps {
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
  selectedTag?: string
  onTagClear?: () => void
}

const NewsFilterBar: React.FC<NewsFilterBarProps> = ({
  layout,
  onLayoutChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagClear,
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
      { value: NewsCategory.POLICY, label: tCategories('policy') },
      { value: NewsCategory.MARKET, label: tCategories('market') },
      { value: NewsCategory.PROJECT, label: tCategories('project') },
      { value: NewsCategory.INVESTMENT, label: tCategories('investment') },
      { value: NewsCategory.GUIDE, label: tCategories('guide') },
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
    onTagClear?.()
  }

  const totalActiveFilters =
    activeFilterCount + (selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)

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
          </Button>
        )}
      </div>

      {selectedTag && (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {t('activeTag')}
          </span>
          <Badge variant='secondary' className='rounded-full px-3 py-1 gap-2'>
            <span>#{selectedTag}</span>
            <button
              type='button'
              onClick={onTagClear}
              aria-label={t('clearTag')}
              className='inline-flex items-center text-muted-foreground hover:text-foreground'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </Badge>
        </div>
      )}
    </div>
  )
}

export default NewsFilterBar
