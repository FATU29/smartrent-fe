import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useListContext } from './useListContext'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'

interface ListSearchProps {
  placeholder?: string
  debounceMs?: number
  className?: string
  mode?: 'debounce' | 'manual' // 'debounce' for auto search, 'manual' for button click
}

const ListSearch: React.FC<ListSearchProps> = ({
  placeholder,
  debounceMs = 500,
  className = '',
  mode = 'debounce',
}) => {
  const t = useTranslations('common.listSearch')
  const { filters, updateFilters, isLoading } = useListContext()

  // Local state for input value
  const [inputValue, setInputValue] = useState(filters.keyword || '')
  const debouncedValue = useDebounce(inputValue, debounceMs)

  // Track if this is initial mount
  const isInitialMount = useRef(true)
  // Track latest filters to avoid stale closures without triggering re-runs
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  // Sync debounced value to context (skip on initial mount) - only for debounce mode
  useEffect(() => {
    if (mode !== 'debounce') return
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    // Only update if different from current filter
    // Use ref to access latest filters without adding it to dependencies
    if (debouncedValue !== filtersRef.current.keyword) {
      updateFilters({ keyword: debouncedValue, page: 1 })
    }
  }, [debouncedValue, updateFilters, mode])

  // Sync from context when filters change externally (e.g., reset)
  useEffect(() => {
    const keyword = filters.keyword || ''
    if (keyword !== inputValue) {
      setInputValue(keyword)
    }
  }, [filters.keyword]) // Only depend on filters.keyword

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    updateFilters({ keyword: '', page: 1 })
  }, [updateFilters])

  const handleSearch = useCallback(() => {
    updateFilters({ keyword: inputValue, page: 1 })
  }, [inputValue, updateFilters])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (mode === 'manual' && e.key === 'Enter') {
        handleSearch()
      }
    },
    [mode, handleSearch],
  )

  const showSearchButton = mode === 'manual' && inputValue !== filters.keyword
  const showClearButton =
    inputValue && (mode === 'debounce' || mode === 'manual')
  const getRightPadding = () => {
    if (showSearchButton) return 'pr-20'
    if (showClearButton) return 'pr-10'
    return 'pr-3'
  }
  const getLoadingRight = () => {
    if (showSearchButton) return 'right-16'
    if (showClearButton) return 'right-10'
    return 'right-3'
  }
  const rightPadding = getRightPadding()
  const loadingRight = getLoadingRight()

  return (
    <div
      className={classNames(
        'group relative flex-1 flex items-center h-9 rounded-lg border border-input bg-background shadow-xs transition-all duration-200',
        'hover:border-primary/40',
        'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        isLoading && 'opacity-70',
        className,
      )}
    >
      <Search
        className={classNames(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200',
          'text-muted-foreground group-focus-within:text-primary',
        )}
      />
      <Input
        type='text'
        placeholder={placeholder || t('placeholder')}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={classNames(
          'h-full border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0 dark:bg-transparent',
          rightPadding,
        )}
        disabled={isLoading}
      />
      {mode === 'manual' && showSearchButton && (
        <Button
          type='button'
          variant='default'
          size='sm'
          onClick={handleSearch}
          className='absolute right-1 top-1/2 h-7 -translate-y-1/2 px-3'
          disabled={isLoading}
        >
          {t('search') || 'Search'}
        </Button>
      )}
      {showClearButton && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={handleClear}
          className={classNames(
            'absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            showSearchButton ? 'right-12' : 'right-1',
          )}
          disabled={isLoading}
        >
          <X className='h-4 w-4' />
        </Button>
      )}
      {isLoading && (
        <div
          className={classNames(
            'absolute top-1/2 -translate-y-1/2',
            loadingRight,
          )}
        >
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary' />
        </div>
      )}
    </div>
  )
}

export default ListSearch
