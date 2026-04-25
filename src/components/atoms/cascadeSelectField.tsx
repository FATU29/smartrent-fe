import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Loader2, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
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
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find((opt) => opt.id === value)

  // Reset keyword + notify parent when popover closes
  useEffect(() => {
    if (!open) {
      setKeyword('')
      onSearchChange?.('')
    }
  }, [open, onSearchChange])

  // Infinite scroll on command list
  useEffect(() => {
    if (!open || !onLoadMore || !hasMore || isLoadingMore) return
    const el = listRef.current
    if (!el) return

    const handler = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (bottom < 60 && hasMore && !isLoadingMore) {
        onLoadMore()
      }
    }

    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [open, onLoadMore, hasMore, isLoadingMore])

  const handleSearchChange = useCallback(
    (next: string) => {
      setKeyword(next)
      onSearchChange?.(next)
    },
    [onSearchChange],
  )

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('')
  }

  // When onSearchChange is provided, server handles filtering so skip cmdk's internal filter
  const shouldFilter = !onSearchChange

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className='text-sm font-medium'>{label}</div>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen} modal>
        <PopoverTrigger asChild>
          <button
            type='button'
            disabled={disabled}
            aria-haspopup='listbox'
            aria-expanded={open}
            className={cn(
              'flex w-full h-11 items-center justify-between gap-2 rounded-lg border border-input bg-white dark:bg-muted px-3 text-sm text-left shadow-xs transition-colors',
              'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled &&
                'bg-muted/40 opacity-70 cursor-not-allowed hover:border-input',
              !selected && 'text-muted-foreground',
            )}
          >
            <span className='flex-1 truncate'>
              {selected ? selected.label : placeholder}
            </span>
            <span className='flex items-center gap-1 shrink-0'>
              {selected && !disabled && (
                <span
                  role='button'
                  tabIndex={-1}
                  aria-label='Clear'
                  onClick={handleClear}
                  className='inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </span>
              )}
              <ChevronDown className='h-4 w-4 opacity-60' />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          sideOffset={6}
          className='w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0'
          onOpenAutoFocus={(e) => {
            // Let CommandInput take focus naturally when searchable
            if (!searchable) e.preventDefault()
          }}
        >
          <Command
            shouldFilter={shouldFilter}
            filter={(itemValue, search) => {
              const opt = options.find((o) => o.id === itemValue)
              if (!opt) return 0
              return opt.label.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0
            }}
          >
            {searchable && (
              <CommandInput
                placeholder={placeholder}
                value={keyword}
                onValueChange={handleSearchChange}
              />
            )}
            <CommandList
              ref={listRef}
              className='max-h-64 overscroll-contain'
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>
                {isLoadingMore ? 'Đang tải...' : 'Không có kết quả'}
              </CommandEmpty>
              <CommandGroup>
                {options
                  .filter((opt) => opt.id !== undefined && opt.id !== null)
                  .map((opt) => (
                    <CommandItem
                      key={opt.id}
                      value={opt.id}
                      onSelect={() => handleSelect(opt.id)}
                      className='cursor-pointer'
                    >
                      <span className='flex-1 truncate'>{opt.label}</span>
                      {opt.id === value && (
                        <Check className='h-4 w-4 text-primary shrink-0' />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
              {isLoadingMore && (
                <div className='flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Đang tải...
                </div>
              )}
              {hasMore && !isLoadingMore && (
                <div className='py-2 text-center text-xs text-muted-foreground'>
                  Cuộn để tải thêm
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default CascadeSelectField
