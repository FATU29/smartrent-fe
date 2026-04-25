'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/atoms/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/atoms/popover'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  // Basic props
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean

  // Options
  options: ComboboxOption[]

  // Styling
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string

  // Label and error
  label?: string
  error?: string
  helperText?: string

  // Loading state
  loading?: boolean

  // Search
  searchable?: boolean
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void

  // Empty/Status texts (i18n)
  emptyText?: string
  noOptionsText?: string
  loadingMoreText?: string

  // Infinite scroll
  hasMore?: boolean
  onLoadMore?: () => void
  isLoadingMore?: boolean

  // Layout
  fullWidth?: boolean
}

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onValueChange,
  placeholder = 'Select an option...',
  disabled = false,
  options = [],
  variant = 'default',
  size = 'md',
  className,
  label,
  error,
  helperText,
  loading = false,
  searchable = true,
  searchPlaceholder,
  onSearchChange,
  fullWidth = true,
  emptyText,
  noOptionsText,
  loadingMoreText,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const [open, setOpen] = React.useState(false)

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  }

  const variantClasses = {
    default: 'border-2 border-border bg-background hover:border-foreground/30',
    outline: 'border-2 border-input bg-transparent hover:border-foreground/40',
    ghost: 'border-0 bg-muted hover:bg-accent',
  }

  // Get selected option label
  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const newValue = currentValue === value ? '' : currentValue
      onValueChange?.(newValue)
      setOpen(false)
    },
    [value, onValueChange],
  )

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onValueChange?.('')
    },
    [onValueChange],
  )

  const availableOptions = React.useMemo(() => {
    return options.filter((opt) => !opt.disabled)
  }, [options])

  // Refs for intersection observer
  const commandListRef = React.useRef<HTMLDivElement>(null)
  const sentryRef = React.useRef<HTMLDivElement>(null)

  // Stable callback for load more
  const handleLoadMore = React.useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore && open) {
      onLoadMore()
    }
  }, [hasMore, isLoadingMore, onLoadMore, open])

  // Setup intersection observer for load more
  React.useEffect(() => {
    if (!open || !onLoadMore) {
      return
    }

    let observer: IntersectionObserver | null = null

    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      if (!sentryRef.current || !commandListRef.current) {
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting) {
            handleLoadMore()
          }
        },
        {
          root: commandListRef.current,
          rootMargin: '100px',
          threshold: 0.1,
        },
      )

      observer.observe(sentryRef.current)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        if (sentryRef.current) {
          observer.unobserve(sentryRef.current)
        }
        observer.disconnect()
      }
    }
  }, [handleLoadMore, onLoadMore, open])

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            'text-sm font-semibold text-foreground',
            error && 'text-destructive',
          )}
        >
          {label}
        </label>
      )}

      {/* Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant === 'default' ? 'outline' : 'ghost'}
            role='combobox'
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              'w-full justify-between rounded-xl transition-all duration-200 shadow-sm',
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed',
              loading && 'opacity-70 cursor-wait',
              'text-left font-normal',
            )}
          >
            <span className='flex-1 truncate'>
              {selectedOption?.label || (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </span>
            <div className='flex items-center gap-1 flex-shrink-0'>
              {loading && (
                <Loader2 className='w-4 h-4 text-muted-foreground animate-spin' />
              )}
              {!loading &&
                value &&
                selectedOption &&
                !disabled &&
                options.length > 0 && (
                  <span
                    onClick={handleClear}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleClear(e as unknown as React.MouseEvent)
                      }
                    }}
                    role='button'
                    tabIndex={0}
                    className='rounded-full p-0.5 hover:bg-accent transition-colors'
                    aria-label='Clear selection'
                  >
                    <X className='w-3 h-3 text-muted-foreground' />
                  </span>
                )}
              {!loading && (
                <ChevronsUpDown className='w-4 h-4 text-muted-foreground opacity-50' />
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-[300px] overflow-auto md:w-[var(--radix-popover-trigger-width)] p-0',
          )}
          align='start'
        >
          <Command>
            {searchable && (
              <CommandInput
                placeholder={searchPlaceholder || 'Search...'}
                className='h-9'
                onValueChange={(val) => onSearchChange?.(val)}
              />
            )}
            <CommandList ref={commandListRef}>
              <CommandEmpty>
                {searchable
                  ? emptyText || 'No results found.'
                  : noOptionsText || 'No options available.'}
              </CommandEmpty>
              <CommandGroup>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    keywords={[option.value, option.label]}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {/* Load more sentry - always render when hasMore and onLoadMore exist */}
              {onLoadMore && hasMore && (
                <div
                  ref={sentryRef}
                  className='px-3 py-2 text-center text-xs text-muted-foreground min-h-[20px]'
                >
                  {isLoadingMore && (loadingMoreText || 'Loading more...')}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default Combobox
