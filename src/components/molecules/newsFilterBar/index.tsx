import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useListContext } from '@/contexts/list'
import { Badge } from '@/components/atoms/badge'
import { NewsCategory, NewsItem } from '@/api/types/news.type'
import { X } from 'lucide-react'
import classNames from 'classnames'

interface NewsFilterBarProps {
  selectedCategory?: string
  onCategoryChange?: (category: string | undefined) => void
  selectedTag?: string
  onTagClear?: () => void
}

const NewsFilterBar: React.FC<NewsFilterBarProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagClear,
}) => {
  const t = useTranslations('newsPage')
  const tCategories = useTranslations('newsPage.categories')
  const { activeFilterCount, resetFilters } = useListContext<NewsItem>()

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

  const handleClearFilters = () => {
    resetFilters()
    onCategoryChange?.(undefined)
    onTagClear?.()
  }

  const totalActiveFilters =
    activeFilterCount + (selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)

  return (
    <div>
      {/* Sticky tab bar */}
      <div className='sticky top-12 sm:top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-background/95 backdrop-blur-sm border-b border-border'>
        <div className='flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value
            return (
              <button
                key={cat.value || 'all'}
                type='button'
                onClick={() => onCategoryChange?.(cat.value)}
                className={classNames(
                  'flex-shrink-0 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap leading-none',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
                )}
              >
                {cat.label}
              </button>
            )
          })}

          {/* Clear button inline with tabs */}
          {totalActiveFilters > 0 && (
            <button
              type='button'
              onClick={handleClearFilters}
              className='flex-shrink-0 flex items-center gap-1 px-3 py-3 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent whitespace-nowrap'
            >
              <X className='h-3.5 w-3.5' />
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Active tag badge */}
      {selectedTag && (
        <div className='flex items-center gap-2 mt-3'>
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
