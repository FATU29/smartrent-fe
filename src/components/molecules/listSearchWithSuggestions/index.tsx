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
import { toast } from 'sonner'
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
  Sparkles,
  SpellCheck,
  AudioLines,
} from 'lucide-react'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/atoms/popover'
import useSearchSuggestions from '@/hooks/useSearchSuggestions'
import { useListContext } from '@/contexts/list/useListContext'
import { ListingFilterRequest, PropertyType } from '@/api/types/property.type'
import { PUBLIC_ROUTES } from '@/constants/route'
import type {
  AppliedSearchFilters,
  IntentSuggestionMetadata,
  LocationSuggestionMetadata,
  PopularQuerySuggestionMetadata,
  SearchSuggestionItem,
  SuggestionType,
  TitleSuggestionMetadata,
} from '@/api/types/search-suggestion.type'
import { cn } from '@/lib/utils'

interface ListSearchWithSuggestionsProps {
  placeholder?: string
  /** Debounce delay used to fetch suggestions (snappier). */
  suggestionsDebounceMs?: number
  className?: string
  /** Max suggestions to fetch. Backend clamps to [1, 20]. */
  limit?: number
  /**
   * Hide the keyboard-hints footer in the popover. Used on the homepage
   * search where space is tight and we don't want a usage guide on top of
   * the hero copy.
   */
  hideFooterHints?: boolean
  /**
   * Called after a submit (Enter, Search button, or suggestion pick) once
   * the filter context has been updated. Receives the post-update filter
   * snapshot — pages that need to navigate (e.g. homepage → /properties)
   * use this rather than reading stale `filters` from the surrounding
   * useListContext after `updateFilters`. `rawQuery` is the original text
   * the user searched (free-text / AI intent) so the destination listing
   * page can keep it visible in the box even when it parsed into structured
   * filters and the residual `keyword` is empty.
   */
  onAfterSubmit?: (filters: ListingFilterRequest, rawQuery?: string) => void
}

// Group display order. The backend ranks by relevance weight (TITLE 1.5 >
// AI_INTENT 1.15 > LOCATION 1.0 > TYPO 0.95 > PHONETIC 0.9 > POPULAR 0.8),
// but in the dropdown we intentionally float AI_INTENT and LOCATION above
// TITLE: a city / intent match is a better first hit for most searches than
// a single listing title, so users see "where" before individual postings.
const TYPE_ORDER: SuggestionType[] = [
  'AI_INTENT',
  'LOCATION',
  'TITLE',
  'TYPO_CORRECTION',
  'PHONETIC',
  'POPULAR_QUERY',
]

const TYPE_ICON: Record<SuggestionType, React.ElementType> = {
  TITLE: Building2,
  LOCATION: MapPin,
  POPULAR_QUERY: TrendingUp,
  AI_INTENT: Sparkles,
  TYPO_CORRECTION: SpellCheck,
  PHONETIC: AudioLines,
}

const TYPE_ACCENT: Record<SuggestionType, string> = {
  TITLE: 'text-primary bg-primary/10',
  LOCATION: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  POPULAR_QUERY: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
  AI_INTENT: 'text-violet-600 bg-violet-500/10 dark:text-violet-400',
  TYPO_CORRECTION: 'text-sky-600 bg-sky-500/10 dark:text-sky-400',
  PHONETIC: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
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
 * Filters that scope results to a place picked from a LOCATION suggestion.
 * Running a free-text search or clearing the box must drop all of them
 * together: the input text is the only visible representation of an applied
 * location, so leaving any of these set would silently keep results filtered
 * with no UI cue. Spreading this also prevents a stale new-structure
 * `provinceCodes` from being sent alongside a legacy `provinceId`
 * (mapFrontendToBackendRequest forwards both when `isLegacy !== false`).
 */
const LOCATION_FILTER_RESET: Partial<ListingFilterRequest> = {
  provinceId: undefined,
  provinceCodes: undefined,
  districtId: undefined,
  wardId: undefined,
  isLegacy: undefined,
}

/**
 * A free-text submit is an authoritative new intent: it must clear not just
 * location but every dimension the backend query parser owns
 * (`productType`, price) so the filter panel reflects the *new* query and
 * doesn't carry a parser-applied value from a previous search. Manual panel
 * choices the parser never sets (category, area, bedrooms, amenities, broker,
 * sort) are intentionally preserved.
 */
const FREE_TEXT_FILTER_RESET: Partial<ListingFilterRequest> = {
  ...LOCATION_FILTER_RESET,
  productType: undefined,
  minPrice: undefined,
  maxPrice: undefined,
}

const FE_PRODUCT_TYPES: readonly PropertyType[] = [
  'APARTMENT',
  'HOUSE',
  'ROOM',
  'STUDIO',
]

const toFiniteNumber = (value: unknown): number | undefined => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Map the backend-parsed {@link AppliedSearchFilters} onto a filter-context
 * patch so a free-text / AI_INTENT submit reflects the parsed intent in the
 * UI (price range, product type, location) instead of only stuffing the raw
 * text into `keyword`.
 *
 * - `rawInput` is the fallback keyword when nothing structured was parsed.
 * - `listingType` is dropped (no slot in `ListingFilterRequest`) and a
 *   `productType` outside the FE union (e.g. OFFICE) is folded into the
 *   keyword so recall via FULLTEXT is preserved.
 * - Unresolved `locationText` and `amenities` (no FE id mapping) are folded
 *   into the keyword for the same reason.
 */
const appliedFiltersToPatch = (
  af: AppliedSearchFilters | null | undefined,
  rawInput: string,
): Partial<ListingFilterRequest> => {
  const raw = rawInput.trim()
  if (!af) {
    return { keyword: raw, ...LOCATION_FILTER_RESET, page: 1 }
  }

  const patch: Partial<ListingFilterRequest> = {
    ...FREE_TEXT_FILTER_RESET,
    page: 1,
  }
  const keywordParts: string[] = []

  if (
    typeof af.productType === 'string' &&
    (FE_PRODUCT_TYPES as readonly string[]).includes(af.productType)
  ) {
    patch.productType = af.productType as PropertyType
  } else if (typeof af.productType === 'string' && af.productType) {
    keywordParts.push(af.productType)
  }

  const minPrice = toFiniteNumber(af.minPrice)
  if (minPrice !== undefined) patch.minPrice = minPrice
  const maxPrice = toFiniteNumber(af.maxPrice)
  if (maxPrice !== undefined) patch.maxPrice = maxPrice

  const legacyProvinceId = toFiniteNumber(af.legacyProvinceId)
  if (legacyProvinceId !== undefined) {
    patch.isLegacy = true
    patch.provinceId = legacyProvinceId
    const legacyDistrictId = toFiniteNumber(af.legacyDistrictId)
    if (legacyDistrictId !== undefined) patch.districtId = legacyDistrictId
    const legacyWardId = toFiniteNumber(af.legacyWardId)
    if (legacyWardId !== undefined) patch.wardId = legacyWardId
  }

  if (af.keyword && af.keyword.trim()) keywordParts.push(af.keyword.trim())
  // Only fold the location phrase into the keyword when it did NOT resolve to
  // a structured location filter — otherwise it would double-filter.
  if (
    legacyProvinceId === undefined &&
    af.locationText &&
    af.locationText.trim()
  ) {
    keywordParts.push(af.locationText.trim())
  }
  if (Array.isArray(af.amenities) && af.amenities.length > 0) {
    keywordParts.push(af.amenities.join(' '))
  }

  const hasStructured =
    patch.productType !== undefined ||
    patch.minPrice !== undefined ||
    patch.maxPrice !== undefined ||
    legacyProvinceId !== undefined
  const keyword = keywordParts.join(' ').trim()
  // Never run an empty search: fall back to the raw input only when neither a
  // structured filter nor a residual keyword was extracted.
  patch.keyword = keyword || (hasStructured ? '' : raw)

  return patch
}

/**
 * Extract the parsed filters an AI_INTENT suggestion carries in its metadata
 * (the backend synthesizes these with `matchType === "PARSED_QUERY"`).
 */
const intentAppliedFilters = (
  meta: SearchSuggestionItem['metadata'],
): AppliedSearchFilters | null => {
  const af = (meta as IntentSuggestionMetadata | null)?.appliedFilters
  return af && typeof af === 'object' ? af : null
}

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
    const joined = parts.join(' • ')
    // For default top-city suggestions the primary text is just the province
    // name, so the secondary line would duplicate it. Suppress in that case.
    secondary =
      joined && joined.toLowerCase() !== item.text.toLowerCase() ? joined : null
  } else if (item.type === 'POPULAR_QUERY' && isPopularMeta(item.metadata)) {
    trailing = (
      <span className='text-2xs text-muted-foreground tabular-nums px-1.5 py-0.5 rounded-full bg-muted'>
        {item.metadata.hitCount.toLocaleString()}
      </span>
    )
  }

  return (
    <div
      id={rowId}
      role='option'
      aria-selected={active}
      // mousedown preventDefault keeps the input focused (so the popover
      // doesn't auto-close mid-click); click is the actual select action.
      // Using both — instead of onMouseDown alone — avoids edge cases where
      // a touch/pen device skips synthetic mousedown.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
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
        <span className='block truncate text-base font-medium text-foreground'>
          {highlighted}
        </span>
        {secondary ? (
          <span className='block truncate text-sm text-muted-foreground mt-0.5'>
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
    onMouseDown={(e) => e.preventDefault()}
    onClick={onSelect}
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
      <span className='block truncate text-sm text-muted-foreground'>
        {label}
      </span>
      <span className='block truncate text-base font-semibold text-foreground'>
        “{query}”
      </span>
    </span>
    <kbd className='hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground'>
      <CornerDownLeft className='h-3 w-3' />
    </kbd>
  </div>
)

const ListSearchWithSuggestions: React.FC<ListSearchWithSuggestionsProps> = ({
  placeholder,
  suggestionsDebounceMs = 200,
  className = '',
  limit = 8,
  hideFooterHints = false,
  onAfterSubmit,
}) => {
  const t = useTranslations('common.listSearch')
  const tSuggestions = useTranslations('common.searchSuggestions')
  const router = useRouter()

  const { filters, updateFilters, isLoading } =
    useListContext<ListingFilterRequest>()

  // On the listing page a free-text / AI search arrives with the raw query
  // in `?q=` (separate from the residual `keyword` filter, which is often
  // empty once the query parsed into structured filters). Seed the box with
  // it so the user still sees what they searched and the suggestion dropdown
  // is contextual. Guarded to the listing route so a stale `q` elsewhere
  // can never leak into another page's search box.
  const rawQueryParam =
    typeof router.query.q === 'string' ? router.query.q : undefined
  const isListingPage = router.pathname === PUBLIC_ROUTES.LISTING_LISTING

  const [inputValue, setInputValue] = useState(
    (isListingPage && rawQueryParam) || filters.keyword || '',
  )
  const [isFocused, setIsFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const inputValueRef = useRef(inputValue)
  inputValueRef.current = inputValue

  // Read from a ref so submit handlers always merge against the latest
  // filter snapshot when computing what to hand back to onAfterSubmit.
  const filtersRef = useRef(filters)
  filtersRef.current = filters
  const onAfterSubmitRef = useRef(onAfterSubmit)
  onAfterSubmitRef.current = onAfterSubmit

  // Sync from EXTERNAL resets only — react to an actual change in
  // `filters.keyword`, not merely to it differing from the input. Without
  // the prev-keyword guard, the `?q=`-seeded display (where keyword is ''
  // but the box shows the raw query) would be wiped to '' on first render.
  const prevKeywordRef = useRef(filters.keyword || '')
  useEffect(() => {
    const keyword = filters.keyword || ''
    if (keyword === prevKeywordRef.current) return
    prevKeywordRef.current = keyword
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
    appliedFilters,
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
      AI_INTENT: [],
      LOCATION: [],
      TYPO_CORRECTION: [],
      PHONETIC: [],
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

  /**
   * Pick a default highlight that prefers the most relevant LOCATION row
   * over the generic "Search for {query}" row. Without this, Enter on a
   * fresh suggestion list always lands on run-search → keyword search
   * even when the user clearly typed a city name. With this, Enter on
   * "Hồ Chí" (a province match) defaults to the LOCATION pick — so the
   * resulting URL is `?provinceId=…&isLegacy=true` instead of
   * `?keyword=Hồ Chí Minh`.
   *
   * Heuristic: first LOCATION whose text contains the typed input
   * (case-insensitive). Falls through to index 0 if nothing matches.
   */
  const defaultHighlightIndex = useMemo(() => {
    if (flatRows.length === 0) return 0
    const trimmed = inputValue.trim().toLowerCase()
    if (!trimmed) return 0

    for (let i = 0; i < flatRows.length; i++) {
      const row = flatRows[i]
      if (
        row.kind === 'suggestion' &&
        row.item.type === 'LOCATION' &&
        row.item.text.toLowerCase().includes(trimmed)
      ) {
        return i
      }
    }
    return 0
  }, [flatRows, inputValue])

  // Reset highlight to the computed default whenever the suggestion list
  // changes shape (new fetch arrives). Keeps the user's manual arrow-key
  // picks stable within a single render set.
  useEffect(() => {
    setHighlightIndex(defaultHighlightIndex)
    // Intentionally only react to flatRows identity changes — not to
    // defaultHighlightIndex shifts caused by typing in between fetches —
    // so we don't yank the highlight away from the user mid-arrow-key.
  }, [flatRows])

  // Popover opens on focus regardless of input length: when empty, the
  // backend returns curated top-city defaults; while typing, real matches.
  const isOpen = isFocused && (isSuggestLoading || hasFetched)

  const listId = useId()
  const optionId = (idx: number) => `${listId}-opt-${idx}`

  /**
   * Apply a filter patch and notify the parent (e.g. for navigation). Uses
   * a ref-based snapshot so the parent sees the post-update state instead
   * of the stale render-time `filters`.
   */
  const submitWithPatch = useCallback(
    (patch: Partial<ListingFilterRequest>, rawQuery?: string) => {
      updateFilters(patch)
      onAfterSubmitRef.current?.(
        {
          ...filtersRef.current,
          ...patch,
        } as ListingFilterRequest,
        rawQuery,
      )
    },
    [updateFilters],
  )

  const runKeywordSearch = useCallback(
    (keyword: string) => {
      const next = keyword.trim()
      setInputValue(next)
      // A free-text search clears any previously-applied LOCATION suggestion
      // filters so results reflect the new query, not stale province/ward state
      // left over from a prior pick.
      submitWithPatch({
        keyword: next,
        ...LOCATION_FILTER_RESET,
        page: 1,
      })
    },
    [submitWithPatch],
  )

  /**
   * Free-text submit (Enter / Search button / "Search for X" row with no
   * suggestion picked). Reflects the backend-parsed structured filters
   * (`appliedFilters` for the latest resolved query) in the filter panel —
   * price range, product type, resolved location — instead of only setting
   * `keyword`. Falls back to a plain keyword search when nothing was parsed.
   */
  const runFreeTextSearch = useCallback(() => {
    // Keep the box showing what the user typed; the parsed filters surface
    // in the panel, not the input (mirrors the runLocationSearch pattern).
    const raw = inputValue.trim()
    setInputValue(raw)
    // Pass `raw` so a homepage → /properties navigation keeps the original
    // query visible there even when it parsed into structured filters.
    submitWithPatch(appliedFiltersToPatch(appliedFilters, inputValue), raw)
  }, [appliedFilters, inputValue, submitWithPatch])

  /**
   * AI_INTENT pick. Synthesized intent items carry their own parsed filters
   * in `metadata.appliedFilters` — apply those so the panel auto-fills.
   * AI_INTENT phrases from the AI server have no parsed filters; the mapper
   * then degrades to a plain keyword search on the phrase (prior behavior).
   */
  const runIntentSearch = useCallback(
    (item: SearchSuggestionItem) => {
      setInputValue(item.text)
      submitWithPatch(
        appliedFiltersToPatch(intentAppliedFilters(item.metadata), item.text),
        item.text,
      )
    },
    [submitWithPatch],
  )

  const runLocationSearch = useCallback(
    (item: SearchSuggestionItem) => {
      const meta = isLocationMeta(item.metadata) ? item.metadata : null
      // Show the selected location label in the input even though we don't
      // search by keyword — it makes the active filter visible to the user.
      setInputValue(item.text)

      // A LOCATION pick must apply a location filter. We deliberately do
      // NOT fall back to a keyword search when IDs are missing — that
      // silent degradation is the bug we're trying to prevent (a city pick
      // ending up as `keyword=Hồ Chí Minh` instead of `provinceId=79`).
      // Surface a clear error and bail. The BE now drops LOCATION items
      // without IDs, so this branch should be unreachable in production.
      if (!meta || meta.legacyProvinceId === undefined) {
        if (
          typeof window !== 'undefined' &&
          process.env.NODE_ENV !== 'production'
        ) {
          console.warn(
            '[listSearchWithSuggestions] LOCATION suggestion missing legacyProvinceId; refusing to fall back to keyword',
            item,
          )
        }
        toast.error(tSuggestions('locationFilterUnavailable'))
        return
      }

      const matchType = meta.matchType ?? 'PROVINCE'
      const patch: Partial<ListingFilterRequest> = {
        // Reset every location field first (incl. stale provinceCodes and a
        // narrower district/ward from a previous pick), then re-add the
        // legacy scoping for this selection. The conditional sets below
        // re-add district/ward for finer granularity.
        ...LOCATION_FILTER_RESET,
        keyword: undefined,
        isLegacy: true,
        provinceId: meta.legacyProvinceId,
        page: 1,
      }

      if (
        (matchType === 'WARD' || matchType === 'DISTRICT') &&
        meta.legacyDistrictId !== undefined
      ) {
        patch.districtId = meta.legacyDistrictId
      }
      if (matchType === 'WARD' && meta.legacyWardId !== undefined) {
        patch.wardId = meta.legacyWardId
      }

      submitWithPatch(patch)
    },
    [submitWithPatch, tSuggestions],
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

      if (item.type === 'LOCATION') {
        runLocationSearch(item)
        setIsFocused(false)
        return
      }

      // AI_INTENT carries parsed filters → auto-fill the filter panel
      // instead of treating the phrase as a plain keyword.
      if (item.type === 'AI_INTENT') {
        runIntentSearch(item)
        setIsFocused(false)
        return
      }

      // Everything else is a text phrase → free-text keyword search:
      // TITLE without listingId, POPULAR_QUERY, and the
      // TYPO_CORRECTION / PHONETIC normalized phrases.
      runKeywordSearch(item.text)
      setIsFocused(false)
    },
    [recordClick, router, runKeywordSearch, runLocationSearch, runIntentSearch],
  )

  const selectFlatRow = useCallback(
    (idx: number) => {
      const row = flatRows[idx]
      if (!row) return
      if (row.kind === 'run-search') {
        runFreeTextSearch()
        setIsFocused(false)
        return
      }
      handleSelect(row.item, row.rank)
    },
    [flatRows, handleSelect, runFreeTextSearch],
  )

  /**
   * Run the search using whatever the user has set up: if a suggestion row
   * is highlighted, dispatch by its type (LOCATION / TITLE / POPULAR_QUERY);
   * otherwise treat the input value as a free-text keyword search.
   * Used by both the Enter key and the explicit Search button so they
   * always behave identically.
   */
  const triggerSearch = useCallback(() => {
    if (isOpen && flatRows.length > 0) {
      selectFlatRow(highlightIndex)
      return
    }
    if (inputValue.trim().length >= 2) {
      runFreeTextSearch()
      setIsFocused(false)
    }
  }, [
    isOpen,
    flatRows,
    highlightIndex,
    selectFlatRow,
    inputValue,
    runFreeTextSearch,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsFocused(false)
        return
      }
      if (!isOpen || flatRows.length === 0) {
        if (e.key === 'Enter') {
          e.preventDefault()
          triggerSearch()
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
        triggerSearch()
      }
    },
    [isOpen, flatRows, triggerSearch],
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    // Clearing the box must also drop any location scoping a prior LOCATION
    // pick applied — the input text is its only visible cue, so leaving
    // province/district/ward/isLegacy set would keep results filtered behind
    // an empty-looking search box (mirrors runKeywordSearch's reset).
    updateFilters({ keyword: '', ...LOCATION_FILTER_RESET, page: 1 })
  }, [updateFilters])

  const showClearButton = inputValue.length > 0

  // Used as the Popover anchor + to detect interactions inside the input box.
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [anchorWidth, setAnchorWidth] = useState<number | undefined>(undefined)

  // Track the input wrapper width so the portaled popover matches it.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    setAnchorWidth(el.offsetWidth)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setAnchorWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null
    if (next && wrapperRef.current?.contains(next)) {
      // Focus moved into the input box (e.g. clear button). Stay open.
      return
    }
    setIsFocused(false)
  }, [])

  const renderedSuggestionRows = useMemo(() => {
    let absoluteIdx = 0
    if (inputValue.trim().length >= 2) absoluteIdx = 1 // run-search row

    // When the user hasn't typed yet, the backend returns LOCATION defaults
    // (top cities). Use a dedicated heading so the dropdown reads as
    // "Popular cities" rather than the generic "Locations".
    const showingDefaults = inputValue.trim().length === 0

    return TYPE_ORDER.map((type) => {
      const items = grouped[type]
      if (items.length === 0) return null
      const heading =
        showingDefaults && type === 'LOCATION'
          ? tSuggestions('defaultsHeading')
          : tSuggestions(`groups.${type}`)
      const startIdx = absoluteIdx
      absoluteIdx += items.length

      return (
        <div key={type} className='py-1'>
          <div className='px-4 pt-2 pb-1 text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2'>
            <span>{heading}</span>
            <span className='flex-1 h-px bg-border' />
            <span className='text-xs tabular-nums opacity-60'>
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
    <Popover
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) setIsFocused(false)
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={wrapperRef}
          className={cn('relative flex-1 min-w-0', className)}
        >
          <div
            className={classNames(
              'group flex items-center h-11 rounded-lg border border-input bg-background shadow-xs transition-all duration-200 pl-3 pr-1.5',
              'hover:border-primary/40',
              'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            )}
          >
            <Search
              className={classNames(
                'h-5 w-5 mr-2.5 shrink-0 transition-colors duration-200',
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
                isOpen && highlightIndex >= 0
                  ? optionId(highlightIndex)
                  : undefined
              }
              autoComplete='off'
              spellCheck={false}
              placeholder={placeholder || t('placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className='flex-1 min-w-0 h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent text-sm sm:text-base md:text-sm lg:text-base'
            />
            {isLoading && !isSuggestLoading ? (
              <Loader2 className='h-4 w-4 mx-1 shrink-0 animate-spin text-primary pointer-events-none' />
            ) : null}
            {showClearButton ? (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleClear()
                }}
                className='h-8 w-8 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                aria-label={tSuggestions('clear')}
              >
                <X className='h-4 w-4' />
              </Button>
            ) : null}
            {/*
             * Submit button — pressing this (or Enter) is the only way to run
             * the listing search. If a suggestion is highlighted, the search
             * runs by that suggestion's type (LOCATION → location filter,
             * TITLE → keyword/detail nav, POPULAR_QUERY → keyword); otherwise
             * the typed value is used as a keyword.
             */}
            <Button
              type='button'
              size='sm'
              onMouseDown={(e) => {
                // mousedown (not click) so the input keeps focus and the
                // popover doesn't close-then-reopen mid-submit.
                e.preventDefault()
                triggerSearch()
              }}
              className='ml-1 h-9 shrink-0 rounded-md px-4 text-sm font-medium'
              aria-label={tSuggestions('submit')}
            >
              <Search className='h-4 w-4' />
              <span className='hidden sm:inline ml-1.5'>
                {tSuggestions('submit')}
              </span>
            </Button>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align='start'
        sideOffset={8}
        // Match the input width even though portaled
        style={anchorWidth ? { width: anchorWidth } : undefined}
        // Don't steal focus from the input — the input drives this combobox
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        // Clicking inside the input box (still in wrapperRef) shouldn't close
        onInteractOutside={(e) => {
          const target = e.target as Node | null
          if (target && wrapperRef.current?.contains(target)) {
            e.preventDefault()
          }
        }}
        // Prevent mousedown on the popover chrome from blurring the input
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          'p-0 overflow-hidden',
          'rounded-2xl border border-border bg-popover text-popover-foreground',
          'shadow-xl ring-1 ring-black/5 dark:ring-white/5',
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between gap-2 px-4 pt-3 pb-1'>
          <span className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
            {tSuggestions('heading')}
          </span>
          {isSuggestLoading ? (
            <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Loader2 className='h-3 w-3 animate-spin' />
              {tSuggestions('loading')}
            </span>
          ) : (
            <span className='text-xs text-muted-foreground tabular-nums'>
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
                runFreeTextSearch()
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

        {/* Footer hints (suppressed in compact contexts like the homepage) */}
        {!hideFooterHints ? (
          <div className='flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-2 text-2xs text-muted-foreground'>
            <span className='hidden sm:flex items-center gap-2'>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-2xs'>
                ↑
              </kbd>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-2xs'>
                ↓
              </kbd>
              <span>{tSuggestions('hintNavigate')}</span>
              <span className='mx-1 opacity-40'>·</span>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-2xs'>
                Enter
              </kbd>
              <span>{tSuggestions('hintSelect')}</span>
              <span className='mx-1 opacity-40'>·</span>
              <kbd className='inline-flex items-center rounded border border-border bg-background px-1 py-0.5 text-2xs'>
                Esc
              </kbd>
              <span>{tSuggestions('hintClose')}</span>
            </span>
            <span className='sm:hidden'>{tSuggestions('hintMobile')}</span>
            <span className='font-medium text-foreground/70'>
              {tSuggestions('poweredBy')}
            </span>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export default ListSearchWithSuggestions
