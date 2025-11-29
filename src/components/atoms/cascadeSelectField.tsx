import React, { useMemo, useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { cn } from '@/lib/utils'

export interface CascadeOption {
  id: string
  label: string
}

interface CascadeSelectFieldProps {
  label: string
  placeholder: string
  value?: string
  disabled?: boolean
  options: CascadeOption[]
  onChange: (value: string) => void
  searchable?: boolean
  className?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onSearchChange?: (value: string) => void
}

const CascadeSelectField: React.FC<CascadeSelectFieldProps> = ({
  label,
  placeholder,
  value,
  disabled,
  options,
  onChange,
  searchable = false,
  className,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onSearchChange,
}) => {
  const [keyword, setKeyword] = useState('')

  // If onSearchChange is provided, use it for API search; otherwise filter locally
  const filtered = useMemo(() => {
    if (!searchable || !keyword) return options
    if (onSearchChange) {
      // API search - return all options (filtering done by API)
      return options
    }
    // Local search - filter options
    return options.filter((o) =>
      o.label.toLowerCase().includes(keyword.toLowerCase()),
    )
  }, [keyword, options, searchable, onSearchChange])

  // Handle search input change
  const handleSearchChange = (newKeyword: string) => {
    setKeyword(newKeyword)
    onSearchChange?.(newKeyword)
  }

  const CLEAR_VALUE = '__clear__'
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore || !isOpen) return

    let viewport: HTMLElement | null = null
    let timeoutId: NodeJS.Timeout | null = null
    let scrollHandler: (() => void) | null = null

    // Find the scrollable viewport element in the portal
    const findAndAttachScroll = () => {
      viewport = document.querySelector(
        '[data-radix-select-viewport]',
      ) as HTMLElement
      if (!viewport) {
        // Retry after a short delay if not found
        timeoutId = setTimeout(findAndAttachScroll, 50)
        return
      }

      scrollHandler = () => {
        if (!viewport) return
        const scrollBottom =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight

        // Load more when scrolled to within 50px of bottom
        if (scrollBottom < 50 && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      }

      viewport.addEventListener('scroll', scrollHandler)
    }

    findAndAttachScroll()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (viewport && scrollHandler) {
        viewport.removeEventListener('scroll', scrollHandler)
      }
    }
  }, [onLoadMore, hasMore, isLoadingMore, isOpen])

  return (
    <div className={cn('space-y-1', className)}>
      <div className='text-sm font-medium'>{label}</div>
      <Select
        value={value || undefined}
        onValueChange={(v) => {
          if (v === CLEAR_VALUE) onChange('')
          else onChange(v)
        }}
        onOpenChange={setIsOpen}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            'w-full h-12 justify-between rounded-lg bg-white dark:bg-muted text-left',
            disabled && 'bg-muted/40 opacity-70 cursor-not-allowed',
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='max-h-72'>
          {searchable && (
            <div className='p-2 sticky top-0 bg-popover z-10'>
              <input
                className='w-full text-sm px-2 py-1 border rounded-md bg-background'
                placeholder={placeholder}
                value={keyword}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          )}
          {/* Không render option placeholder */}
          {filtered
            .filter((opt) => opt.id !== undefined && opt.id !== null)
            .map((opt, index) => (
              <SelectItem key={opt.id || `option-${index}`} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          {isLoadingMore && (
            <div className='p-2 text-center text-sm text-muted-foreground'>
              Đang tải...
            </div>
          )}
          {hasMore && !isLoadingMore && (
            <div className='p-2 text-center text-xs text-muted-foreground'>
              Cuộn để tải thêm
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

export default CascadeSelectField
