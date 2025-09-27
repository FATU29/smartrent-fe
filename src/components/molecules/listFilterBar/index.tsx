import React, { useEffect, useState } from 'react'
import { useListContext } from '@/contexts/list/useListContext'
import SearchInput from '@/components/molecules/searchInput'
import { Button } from '@/components/atoms/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export interface ListFilterBarProps {
  className?: string
  perPageOptions?: number[]
  showSearch?: boolean
  showPerPage?: boolean
  showReset?: boolean
  compact?: boolean
}

/**
 * Generic list filter bar built on ListContext.
 * Provides: search, perPage selector, pagination navigation, reset.
 * Automatically syncs search input with context and resets page to 1 on changes.
 */
const ListFilterBar: React.FC<ListFilterBarProps> = ({
  className,
  perPageOptions = [10, 20, 50, 100],
  showSearch = true,
  showPerPage = true,
  showReset = true,
  compact = false,
}) => {
  const {
    filters,
    pagination,
    handleUpdateFilter,
    handleLoadNewPage,
    handleResetFilter,
    isLoading,
  } = useListContext()
  const t = useTranslations('pagination')
  const [search, setSearch] = useState(filters.search || '')

  // Sync external changes (e.g., reset from elsewhere)
  useEffect(() => {
    setSearch(filters.search || '')
  }, [filters.search])

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      if (search !== filters.search) {
        handleUpdateFilter({ search })
      }
    }, 400)
    return () => clearTimeout(id)
  }, [search])

  const {
    page: currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    total,
  } = pagination
  const startItem = (currentPage - 1) * filters.perPage + 1
  const endItem = Math.min(currentPage * filters.perPage, total)

  const gotoPage = (p: number) => {
    if (p >= 1 && p <= totalPages && p !== currentPage) handleLoadNewPage(p)
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg border bg-background/50 backdrop-blur-sm p-3 sm:p-4 flex flex-col gap-3',
        compact && 'p-2 gap-2',
        className,
      )}
    >
      <div className='flex flex-col md:flex-row gap-3 md:items-center md:justify-between'>
        {/* Left cluster: search + perPage */}
        <div className='flex flex-col sm:flex-row gap-3 sm:items-center flex-1'>
          {showSearch && (
            <div className='sm:w-72'>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t('search') || 'Search'}
              />
            </div>
          )}

          {showPerPage && (
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('show')}
              </span>
              <Select
                value={filters.perPage.toString()}
                onValueChange={(v) =>
                  handleUpdateFilter({ perPage: parseInt(v), page: 1 })
                }
                disabled={isLoading}
              >
                <SelectTrigger className='h-9 w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((o) => (
                    <SelectItem key={o} value={o.toString()}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('perPage')}
              </span>
            </div>
          )}

          {showReset && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => handleResetFilter()}
              disabled={isLoading}
              className='gap-1'
            >
              <RotateCcw className='h-4 w-4' />
              <span className='hidden sm:inline'>{t('reset') || 'Reset'}</span>
            </Button>
          )}
        </div>

        {/* Right cluster: pagination */}
        <div className='flex items-center gap-2 justify-end'>
          <div className='hidden md:block text-xs text-muted-foreground whitespace-nowrap'>
            {totalPages > 0 && (
              <span>
                {t('showing')} {startItem}-{endItem} {t('of')} {total}
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => gotoPage(1)}
              disabled={!hasPrevious || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => gotoPage(currentPage - 1)}
              disabled={!hasPrevious || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-xs tabular-nums px-1 min-w-[4.5rem] text-center'>
              {totalPages === 0 ? '0 / 0' : `${currentPage} / ${totalPages}`}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => gotoPage(currentPage + 1)}
              disabled={!hasNext || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => gotoPage(totalPages)}
              disabled={!hasNext || isLoading}
              className='h-8 w-8 p-0'
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListFilterBar
