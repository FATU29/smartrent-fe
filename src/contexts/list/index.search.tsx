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
}

const ListSearch: React.FC<ListSearchProps> = ({
  placeholder,
  debounceMs = 500,
  className = '',
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

  // Sync debounced value to context (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    // Only update if different from current filter
    // Use ref to access latest filters without adding it to dependencies
    if (debouncedValue !== filtersRef.current.keyword) {
      updateFilters({ keyword: debouncedValue })
    }
  }, [debouncedValue, updateFilters])

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
    updateFilters({ keyword: '' })
  }, [updateFilters])

  return (
    <div className={classNames('relative flex-1', className)}>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='text'
        placeholder={placeholder || t('placeholder')}
        value={inputValue}
        onChange={handleChange}
        className='pl-10 pr-10'
        disabled={isLoading}
      />
      {inputValue && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={handleClear}
          className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground'
          disabled={isLoading}
        >
          <X className='h-4 w-4' />
        </Button>
      )}
      {isLoading && (
        <div className='absolute right-10 top-1/2 -translate-y-1/2'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground' />
        </div>
      )}
    </div>
  )
}

export default ListSearch
