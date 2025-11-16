import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useListContext } from './useListContext'
import classNames from 'classnames'

interface ListSearchProps {
  placeholder?: string
  debounceMs?: number
  showButton?: boolean
  buttonText?: string
  autoSearch?: boolean
  onSearch?: (searchTerm: string) => void
  className?: string
}

const ListSearch: React.FC<ListSearchProps> = ({
  placeholder = 'Tìm kiếm...',
  debounceMs = 500,
  showButton = false,
  buttonText = 'Tìm kiếm',
  autoSearch = true,
  onSearch,
  className = '',
}) => {
  const { filters, handleUpdateFilter, isLoading } = useListContext()
  const [searchTerm, setSearchTerm] = useState(
    (filters.search as string | undefined) || '',
  )

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  useEffect(() => {
    if (autoSearch && debouncedSearchTerm !== filters.search) {
      handleUpdateFilter({ search: debouncedSearchTerm })
      onSearch?.(debouncedSearchTerm || '')
    }
  }, [
    debouncedSearchTerm,
    autoSearch,
    filters.search,
    handleUpdateFilter,
    onSearch,
  ])

  const handleSearch = () => {
    if (searchTerm !== filters.search) {
      handleUpdateFilter({ search: searchTerm })
      onSearch?.(searchTerm || '')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!autoSearch) {
        handleSearch()
      }
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (filters.search !== '') {
      handleUpdateFilter({ search: '' })
      onSearch?.('')
    }
  }

  return (
    <div className={classNames(`flex items-center gap-2`, className)}>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className='pl-10 pr-10'
          disabled={isLoading}
        />
        {searchTerm && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleClear}
            className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            disabled={isLoading}
          >
            ×
          </Button>
        )}
      </div>

      {showButton && (
        <Button
          type='button'
          onClick={handleSearch}
          disabled={isLoading || (autoSearch && searchTerm === filters.search)}
          className='whitespace-nowrap'
        >
          {isLoading ? (
            <>
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              Đang tìm...
            </>
          ) : (
            <>
              <Search className='mr-2 h-4 w-4' />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default ListSearch
