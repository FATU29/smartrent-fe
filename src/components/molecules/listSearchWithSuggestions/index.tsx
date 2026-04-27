'use client'

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import classNames from 'classnames'
import {
  Search,
  X,
  Building2,
  MapPin,
  TrendingUp,
  Loader2,
  ArrowRight,
} from 'lucide-react'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { useDebounce } from '@/hooks/useDebounce'
import useSearchSuggestions from '@/hooks/useSearchSuggestions'
import { useListContext } from '@/contexts/list/useListContext'
import { ListingFilterRequest } from '@/api/types/property.type'
import type {
  LocationSuggestionMetadata,
  PopularQuerySuggestionMetadata,
  SearchSuggestionItem,
  TitleSuggestionMetadata,
} from '@/api/types/search-suggestion.type'
import { cn } from '@/lib/utils'

interface ListSearchWithSuggestionsProps {
  placeholder?: string
  /** Debounce delay used to push the keyword to filters (search). */
  debounceMs?: number
  /** Debounce delay used to fetch suggestions (snappier). */
  suggestionsDebounceMs?: number
  className?: string
  /** Max suggestions to fetch. Backend clamps to [1, 20]. */
  limit?: number
}

const TYPE_ICON: Record<SearchSuggestionItem['type'], React.ElementType> = {
  TITLE: Building2,
  LOCATION: MapPin,
  POPULAR_QUERY: TrendingUp,
}

const TYPE_ACCENT: Record<SearchSuggestionItem['type'], string> = {
  TITLE: 'text-primary bg-primary/10',
  LOCATION: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  POPULAR_QUERY: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
}

const isLocationMeta = (
  meta: SearchSuggestionItem['metadata'],
): meta is LocationSuggestionMetadata =>
  !!meta &&
  typeof (meta as LocationSuggestionMetadata).provinceName === 'string'

const isTitleMeta = (
  meta: SearchSuggestionItem['metadata'],
): meta is TitleSuggestionMetadata =>
  !!meta && typeof (meta as TitleSuggestionMetadata).address === 'string'

const isPopularMeta = (
  meta: SearchSuggestionItem['metadata'],
): meta is PopularQuerySuggestionMetadata =>
  !!meta &&
  typeof (meta as PopularQuerySuggestionMetadata).hitCount === 'number'

/**
 * Highlight occurrences of `query` (case-insensitive, diacritic-insensitive
 * for ASCII fallback) inside `text`. Returns React nodes — falls back to
 * a plain string when no match is found, so the caller can render safely.
 */
const useHighlightedText = (text: string, query: string): React.ReactNode => {
  return useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return text
    try {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const splitRegex = new RegExp(`(${escaped})`, 'ig')
      const lowerNeedle = trimmed.toLowerCase()
      const parts = text.split(splitRegex)
      return parts.map((part, idx) =>
        part.toLowerCase() === lowerNeedle ? (
          <mark
            key={`${part}-${idx}`}
            className='bg-transparent text-primary font-semibold'
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>
        ),
      )
    } catch {
      return text
    }
  }, [text, query])
}

const SuggestionRow: React.FC<{
  item: SearchSuggestionItem
  query: string
  active: boolean
  onMouseEnter: () => void
  onSelect: () => void
  rowId: string
}> = ({ item, query, active, onMouseEnter, onSelect, rowId }) => {
  const Icon = TYPE_ICON[item.type] ?? Building2
  const highlighted = useHighlightedText(item.text, query)

  let secondary: string | null = null
  let trailing: React.ReactNode = null

  if (item.type === 'TITLE' && isTitleMeta(item.metadata)) {
    secondary = item.metadata.address ?? null
  } else if (item.type === 'LOCATION' && isLocationMeta(item.metadata)) {
    const parts = [
      item.metadata.wardName,
      item.metadata.districtName,
      item.metadata.provinceName,
    ].filter(Boolean) as string[]
    secondary = parts.join(' • ')
  } else if (item.type === 'POPULAR_QUERY' && isPopularMeta(item.metadata)) {
    trailing = (
      <span className='text-xs text-muted-foreground tabular-nums'>
        {item.metadata.hitCount.toLocaleString()}
      </span>
    )
  }

  return (
    <li
      id={rowId}
      role='option'
      aria-selected={active}
      onMouseDown={(e) => {
        e.preventDefault()
        onSelect()
      }}
      onMouseEnter={onMouseEnter}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors rounded-md mx-1',
        active
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/60 hover:text-accent-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          TYPE_ACCENT[item.type],
        )}
      >
        <Icon className='h-4 w-4' />
      </span>
      <span className='flex-1 min-w-0'>
        <span className='block truncate text-sm font-medium text-foreground'>
          {highlighted}
        </span>
        {secondary ? (
          <span className='block truncate text-xs text-muted-foreground'>
            {secondary}
          </span>
        ) : null}
      </span>
      {trailing}
      <ArrowRight
        className={cn(
          'h-4 w-4 shrink-0 transition-opacity',
          active
            ? 'text-muted-foreground opacity-100'
            : 'text-muted-foreground/0 opacity-0 group-hover:opacity-100',
        )}
      />
    </li>
  )
}

const ListSearchWithSuggestions: React.FC<ListSearchWithSuggestionsProps> = ({
  placeholder,
  debounceMs = 500,
  suggestionsDebounceMs = 200,
  className = '',
  limit = 8,
}) => {
  const t = useTranslations('common.listSearch')
  const tSuggestions = useTranslations('common.searchSuggestions')
  const router = useRouter()

  const { filters, updateFilters, isLoading } =
    useListContext<ListingFilterRequest>()

  const [inputValue, setInputValue] = useState(filters.keyword || '')
  const [isFocused, setIsFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  // Debounce for syncing keyword to context (existing behavior)
  const debouncedKeyword = useDebounce(inputValue, debounceMs)

  const isInitialMount = useRef(true)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (debouncedKeyword !== filtersRef.current.keyword) {
      updateFilters({ keyword: debouncedKeyword, page: 1 })
    }
  }, [debouncedKeyword, updateFilters])

  // Sync from external resets
  useEffect(() => {
    const keyword = filters.keyword || ''
    if (keyword !== inputValue) {
      setInputValue(keyword)
    }
  }, [filters.keyword, inputValue])

  const provinceIdParam =
    filters.provinceId !== undefined && filters.provinceId !== null
      ? String(filters.provinceId)
      : undefined

  const {
    suggestions,
    isLoading: isSuggestLoading,
    recordClick,
    hasFetched,
  } = useSearchSuggestions({
    query: inputValue,
    enabled: isFocused,
    debounceMs: suggestionsDebounceMs,
    limit,
    provinceId: provinceIdParam,
    categoryId:
      typeof filters.categoryId === 'number' ? filters.categoryId : undefined,
  })

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(suggestions.length > 0 ? 0 : -1)
  }, [suggestions])

  const isOpen =
    isFocused &&
    inputValue.trim().length >= 2 &&
    (isSuggestLoading || hasFetched)

  const listId = useId()
  const optionId = (idx: number) => `${listId}-opt-${idx}`

  const handleSelect = useCallback(
    (item: SearchSuggestionItem, rank: number) => {
      recordClick({
        type: item.type,
        text: item.text,
        listingId: item.listingId ?? null,
        rank,
      })

      if (
        item.type === 'TITLE' &&
        item.listingId !== null &&
        item.listingId !== undefined
      ) {
        setIsFocused(false)
        router.push(`/listing-detail/${item.listingId}`)
        return
      }

      // LOCATION + POPULAR_QUERY: use the suggestion text as the keyword,
      // sync immediately (no debounce) so search results update right away.
      const next = item.text
      setInputValue(next)
      updateFilters({ keyword: next, page: 1 })
      setIsFocused(false)
    },
    [recordClick, router, updateFilters],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((i) => (i + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        )
      } else if (e.key === 'Enter') {
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          e.preventDefault()
          handleSelect(suggestions[highlightIndex], highlightIndex)
        }
      } else if (e.key === 'Escape') {
        setIsFocused(false)
      }
    },
    [isOpen, suggestions, highlightIndex, handleSelect],
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    updateFilters({ keyword: '', page: 1 })
  }, [updateFilters])

  const showClearButton = inputValue.length > 0

  // Show only one loading indicator at a time. Suggestion fetch is fast
  // and visible in the dropdown, so prefer the dropdown's spinner.
  const showInputSpinner = isLoading && !isSuggestLoading

  return (
    <div className={cn('relative flex-1 min-w-0', className)}>
      <div
        className={classNames(
          'group relative flex items-center h-9 rounded-lg border border-input bg-background shadow-xs transition-all duration-200',
          'hover:border-primary/40',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
          isLoading && 'opacity-90',
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
          role='combobox'
          aria-expanded={isOpen}
          aria-autocomplete='list'
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={
            isOpen && highlightIndex >= 0 ? optionId(highlightIndex) : undefined
          }
          autoComplete='off'
          spellCheck={false}
          placeholder={placeholder || t('placeholder')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to let mousedown handlers fire first.
            setTimeout(() => setIsFocused(false), 0)
          }}
          onKeyDown={handleKeyDown}
          className={classNames(
            'h-full border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0 dark:bg-transparent',
            showClearButton ? 'pr-10' : 'pr-3',
          )}
          disabled={isLoading}
        />
        {showClearButton ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onMouseDown={(e) => {
              e.preventDefault()
              handleClear()
            }}
            className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            disabled={isLoading}
            aria-label={tSuggestions('clear')}
          >
            <X className='h-4 w-4' />
          </Button>
        ) : null}
        {showInputSpinner ? (
          <div
            className={classNames(
              'absolute top-1/2 -translate-y-1/2',
              showClearButton ? 'right-10' : 'right-3',
            )}
          >
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-50 mt-2',
            'rounded-xl border border-border bg-popover text-popover-foreground shadow-lg',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1',
          )}
        >
          <div className='flex items-center justify-between px-4 pt-3 pb-1'>
            <span className='text-[11px] uppercase tracking-wide text-muted-foreground font-medium'>
              {tSuggestions('heading')}
            </span>
            {isSuggestLoading ? (
              <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                <Loader2 className='h-3 w-3 animate-spin' />
                {tSuggestions('loading')}
              </span>
            ) : null}
          </div>
          <ul
            id={listId}
            role='listbox'
            className='max-h-[60vh] sm:max-h-80 overflow-y-auto py-1'
          >
            {suggestions.length === 0 && !isSuggestLoading ? (
              <li className='px-4 py-6 text-center text-sm text-muted-foreground'>
                {tSuggestions('empty')}
              </li>
            ) : (
              suggestions.map((item, idx) => (
                <SuggestionRow
                  key={`${item.type}-${idx}-${item.listingId ?? item.text}`}
                  item={item}
                  query={inputValue}
                  active={idx === highlightIndex}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onSelect={() => handleSelect(item, idx)}
                  rowId={optionId(idx)}
                />
              ))
            )}
          </ul>
          <div className='flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground'>
            <span className='hidden sm:inline'>
              {tSuggestions('hintKeyboard')}
            </span>
            <span className='sm:hidden'>{tSuggestions('hintMobile')}</span>
            <span>{tSuggestions('poweredBy')}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListSearchWithSuggestions
