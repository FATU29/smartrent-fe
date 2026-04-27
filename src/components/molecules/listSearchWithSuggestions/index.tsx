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
  CornerDownLeft,
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
  SuggestionType,
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

const TYPE_ORDER: SuggestionType[] = ['TITLE', 'LOCATION', 'POPULAR_QUERY']

const TYPE_ICON: Record<SuggestionType, React.ElementType> = {
  TITLE: Building2,
  LOCATION: MapPin,
  POPULAR_QUERY: TrendingUp,
}

const TYPE_ACCENT: Record<SuggestionType, string> = {
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
 * Highlight occurrences of `query` (case-insensitive) inside `text`.
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
            className='bg-primary/15 text-primary font-semibold rounded-sm px-0.5'
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

interface SuggestionRowProps {
  item: SearchSuggestionItem
  query: string
  active: boolean
  onMouseEnter: () => void
  onSelect: () => void
  rowId: string
}

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  item,
  query,
  active,
  onMouseEnter,
  onSelect,
  rowId,
}) => {
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
      <span className='text-[11px] text-muted-foreground tabular-nums px-1.5 py-0.5 rounded-full bg-muted'>
        {item.metadata.hitCount.toLocaleString()}
      </span>
    )
  }

  return (
    <div
      id={rowId}
      role='option'
      aria-selected={active}
      onMouseDown={(e) => {
        e.preventDefault()
        onSelect()
      }}
      onMouseEnter={onMouseEnter}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-2 transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 hover:text-accent-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
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
          <span className='block truncate text-xs text-muted-foreground mt-0.5'>
            {secondary}
          </span>
        ) : null}
      </span>
      {trailing}
      <ArrowRight
        className={cn(
          'h-4 w-4 shrink-0 transition-all',
          active
            ? 'text-foreground opacity-100 translate-x-0'
            : 'text-muted-foreground/0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-muted-foreground',
        )}
      />
    </div>
  )
}

/** A single "Search for X" row that runs the query as a keyword search. */
interface RunSearchRowProps {
  query: string
  active: boolean
  onMouseEnter: () => void
  onSelect: () => void
  rowId: string
  label: string
}

const RunSearchRow: React.FC<RunSearchRowProps> = ({
  query,
  active,
  onMouseEnter,
  onSelect,
  rowId,
  label,
}) => (
  <div
    id={rowId}
    role='option'
    aria-selected={active}
    onMouseDown={(e) => {
      e.preventDefault()
      onSelect()
    }}
    onMouseEnter={onMouseEnter}
    className={cn(
      'group flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg mx-2 transition-colors',
      active
        ? 'bg-primary/10 text-foreground'
        : 'hover:bg-accent/50 hover:text-accent-foreground',
    )}
  >
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground',
      )}
    >
      <Search className='h-4 w-4' />
    </span>
    <span className='flex-1 min-w-0'>
      <span className='block truncate text-xs text-muted-foreground'>
        {label}
      </span>
      <span className='block truncate text-sm font-semibold text-foreground'>
        “{query}”
      </span>
    </span>
    <kbd className='hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
      <CornerDownLeft className='h-3 w-3' />
    </kbd>
  </div>
)

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
  const [highlightIndex, setHighlightIndex] = useState(0)

  const debouncedKeyword = useDebounce(inputValue, debounceMs)

  const isInitialMount = useRef(true)
  const filtersRef = useRef(filters)
  filtersRef.current = filters
  const inputValueRef = useRef(inputValue)
  inputValueRef.current = inputValue

  // Push debounced typed value into filter context (existing keyword search behavior)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (debouncedKeyword !== filtersRef.current.keyword) {
      updateFilters({ keyword: debouncedKeyword, page: 1 })
    }
  }, [debouncedKeyword, updateFilters])

  // Sync from EXTERNAL resets only — read inputValue via ref so typing
  // does not retrigger this effect and stomp the user's keystrokes.
  useEffect(() => {
    const keyword = filters.keyword || ''
    if (keyword !== inputValueRef.current) {
      setInputValue(keyword)
    }
  }, [filters.keyword])

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

  // Group suggestions by type, preserving the backend's relevance order
  const grouped = useMemo(() => {
    const buckets: Record<SuggestionType, SearchSuggestionItem[]> = {
      TITLE: [],
      LOCATION: [],
      POPULAR_QUERY: [],
    }
    suggestions.forEach((s) => {
      buckets[s.type]?.push(s)
    })
    return buckets
  }, [suggestions])

  /**
   * Flatten the visible rows in render order so a single highlight index
   * can navigate "search-this" + grouped suggestion rows.
   * Each entry includes the absolute rank within `suggestions` for telemetry.
   */
  const flatRows = useMemo(() => {
    type FlatRow =
      | { kind: 'run-search' }
      | { kind: 'suggestion'; item: SearchSuggestionItem; rank: number }

    const rows: FlatRow[] = []
    const trimmed = inputValue.trim()
    if (trimmed.length >= 2) {
      rows.push({ kind: 'run-search' })
    }

    let cursor = 0
    TYPE_ORDER.forEach((type) => {
      grouped[type].forEach((item) => {
        // Compute the absolute rank inside the original suggestions list
        const rank = suggestions.indexOf(item, cursor)
        rows.push({ kind: 'suggestion', item, rank: rank >= 0 ? rank : 0 })
        if (rank >= 0) cursor = rank + 1
      })
    })
    return rows
  }, [grouped, suggestions, inputValue])

  // Keep highlight in range when rows change
  useEffect(() => {
    setHighlightIndex((prev) => {
      if (flatRows.length === 0) return 0
      if (prev < 0 || prev >= flatRows.length) return 0
      return prev
    })
  }, [flatRows])

  const isOpen =
    isFocused &&
    inputValue.trim().length >= 2 &&
    (isSuggestLoading || hasFetched)

  const listId = useId()
  const optionId = (idx: number) => `${listId}-opt-${idx}`

  const runKeywordSearch = useCallback(
    (keyword: string) => {
      const next = keyword.trim()
      setInputValue(next)
      updateFilters({ keyword: next, page: 1 })
    },
    [updateFilters],
  )

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

      runKeywordSearch(item.text)
      setIsFocused(false)
    },
    [recordClick, router, runKeywordSearch],
  )

  const selectFlatRow = useCallback(
    (idx: number) => {
      const row = flatRows[idx]
      if (!row) return
      if (row.kind === 'run-search') {
        runKeywordSearch(inputValue)
        setIsFocused(false)
        return
      }
      handleSelect(row.item, row.rank)
    },
    [flatRows, inputValue, handleSelect, runKeywordSearch],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsFocused(false)
        return
      }
      if (!isOpen || flatRows.length === 0) {
        if (e.key === 'Enter' && inputValue.trim().length >= 2) {
          e.preventDefault()
          runKeywordSearch(inputValue)
          setIsFocused(false)
        }
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((i) => (i + 1) % flatRows.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((i) => (i - 1 + flatRows.length) % flatRows.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        selectFlatRow(highlightIndex)
      }
    },
    [
      isOpen,
      flatRows,
      highlightIndex,
      selectFlatRow,
      inputValue,
      runKeywordSearch,
    ],
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    updateFilters({ keyword: '', page: 1 })
  }, [updateFilters])

  const showClearButton = inputValue.length > 0

  // Used to detect blur transitions outside the wrapper (input + popover).
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null
    if (next && wrapperRef.current?.contains(next)) {
      // Focus moved into the popover (e.g. clear button). Stay open.
      return
    }
    setIsFocused(false)
  }, [])

  const renderedSuggestionRows = useMemo(() => {
    let absoluteIdx = 0
    if (inputValue.trim().length >= 2) absoluteIdx = 1 // run-search row

    return TYPE_ORDER.map((type) => {
      const items = grouped[type]
      if (items.length === 0) return null
      const heading = tSuggestions(`groups.${type}`)
      const startIdx = absoluteIdx
      absoluteIdx += items.length

      return (
        <div key={type} className='py-1'>
          <div className='px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2'>
            <span>{heading}</span>
            <span className='flex-1 h-px bg-border' />
            <span className='text-[10px] tabular-nums opacity-60'>
              {items.length}
            </span>
          </div>
          <div className='space-y-0.5'>
            {items.map((item, localIdx) => {
              const idx = startIdx + localIdx
              return (
                <SuggestionRow
                  key={`${type}-${localIdx}-${item.listingId ?? item.text}`}
                  item={item}
                  query={inputValue}
                  active={idx === highlightIndex}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onSelect={() => handleSelect(item, idx)}
                  rowId={optionId(idx)}
                />
              )
            })}
          </div>
        </div>
      )
    })
  }, [grouped, inputValue, highlightIndex, handleSelect, tSuggestions, listId])

  const showRunSearch = inputValue.trim().length >= 2

  return (
    <div ref={wrapperRef} className={cn('relative flex-1 min-w-0', className)}>
      <div
        className={classNames(
          'group relative flex items-center h-9 rounded-lg border border-input bg-background shadow-xs transition-all duration-200',
          'hover:border-primary/40',
          'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
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
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={classNames(
            'h-full border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0 dark:bg-transparent',
            showClearButton ? 'pr-10' : 'pr-3',
          )}
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
            aria-label={tSuggestions('clear')}
          >
            <X className='h-4 w-4' />
          </Button>
        ) : null}
        {isLoading && !isSuggestLoading ? (
          <div
            className={classNames(
              'absolute top-1/2 -translate-y-1/2 pointer-events-none',
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
            'rounded-2xl border border-border bg-popover text-popover-foreground',
            'shadow-xl ring-1 ring-black/5 dark:ring-white/5',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150',
          )}
          // Prevent mousedown on the chrome from blurring the input
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className='flex items-center justify-between gap-2 px-4 pt-3 pb-1'>
            <span className='text-[11px] uppercase tracking-wide text-muted-foreground font-medium'>
              {tSuggestions('heading')}
            </span>
            {isSuggestLoading ? (
              <span className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                <Loader2 className='h-3 w-3 animate-spin' />
                {tSuggestions('loading')}
              </span>
            ) : (
              <span className='text-[11px] text-muted-foreground tabular-nums'>
                {tSuggestions('countResults', { count: suggestions.length })}
              </span>
            )}
          </div>

          {/* Body */}
          <div
            id={listId}
            role='listbox'
            className='max-h-[60vh] sm:max-h-96 overflow-y-auto py-1'
          >
            {showRunSearch ? (
              <RunSearchRow
                query={inputValue.trim()}
                active={highlightIndex === 0}
                onMouseEnter={() => setHighlightIndex(0)}
                onSelect={() => {
                  runKeywordSearch(inputValue)
                  setIsFocused(false)
                }}
                rowId={optionId(0)}
                label={tSuggestions('runSearchLabel')}
              />
            ) : null}

            {suggestions.length === 0 && !isSuggestLoading ? (
              <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
                <div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                  <Search className='h-4 w-4' />
                </div>
                <div className='font-medium text-foreground'>
                  {tSuggestions('emptyTitle')}
                </div>
                <div className='mt-1'>{tSuggestions('emptyHint')}</div>
              </div>
            ) : (
              renderedSuggestionRows
            )}
          </div>

          {/* Footer hints */}
          <div className='flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground'>
            <span className='hidden sm:flex items-center gap-2'>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[10px]'>
                ↑
              </kbd>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[10px]'>
                ↓
              </kbd>
              <span>{tSuggestions('hintNavigate')}</span>
              <span className='mx-1 opacity-40'>·</span>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[10px]'>
                Enter
              </kbd>
              <span>{tSuggestions('hintSelect')}</span>
              <span className='mx-1 opacity-40'>·</span>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-[10px]'>
                Esc
              </kbd>
              <span>{tSuggestions('hintClose')}</span>
            </span>
            <span className='sm:hidden'>{tSuggestions('hintMobile')}</span>
            <span className='font-medium text-foreground/70'>
              {tSuggestions('poweredBy')}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListSearchWithSuggestions
