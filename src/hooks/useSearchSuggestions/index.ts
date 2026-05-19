import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchSuggestionService } from '@/api/services/search-suggestion.service'
import type {
  AppliedSearchFilters,
  SearchSuggestionItem,
  SearchSuggestionClickRequest,
} from '@/api/types/search-suggestion.type'

interface UseSearchSuggestionsParams {
  query: string
  enabled?: boolean
  debounceMs?: number
  limit?: number
  provinceId?: string
  categoryId?: number
}

interface UseSearchSuggestionsResult {
  suggestions: SearchSuggestionItem[]
  impressionId: number
  /**
   * Structured filters the backend parsed from the latest resolved query,
   * or null when nothing was parsed. Apply on free-text submit.
   */
  appliedFilters: AppliedSearchFilters | null
  isLoading: boolean
  hasFetched: boolean
  reset: () => void
  recordClick: (
    payload: Omit<SearchSuggestionClickRequest, 'impressionId'>,
  ) => void
}

interface SuggestionsPayload {
  suggestions: SearchSuggestionItem[]
  impressionId: number
  appliedFilters: AppliedSearchFilters | null
}

const EMPTY_PAYLOAD: SuggestionsPayload = {
  suggestions: [],
  impressionId: 0,
  appliedFilters: null,
}

/**
 * Process-wide, short-lived response cache shared across every mount of the
 * search box. Re-typing a prefix you just cleared (or reopening the box) is
 * served from memory with zero network round-trips. The TTL is kept short so
 * suggestions stay reasonably fresh; the size cap bounds memory and evicts
 * the oldest key first (insertion-ordered Map).
 */
const CACHE_TTL_MS = 60_000
const CACHE_MAX_ENTRIES = 50
const responseCache = new Map<
  string,
  { at: number; value: SuggestionsPayload }
>()

const cacheKeyOf = (p: {
  q: string
  limit: number
  provinceId?: string
  categoryId?: number
}): string => `${p.q}|${p.limit}|${p.provinceId ?? ''}|${p.categoryId ?? ''}`

const readCache = (key: string): SuggestionsPayload | undefined => {
  const entry = responseCache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    responseCache.delete(key)
    return undefined
  }
  return entry.value
}

const writeCache = (key: string, value: SuggestionsPayload): void => {
  if (responseCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value
    if (oldest !== undefined) responseCache.delete(oldest)
  }
  responseCache.set(key, { at: Date.now(), value })
}

/**
 * Debounced fetch for the multi-source search-suggestions endpoint.
 *
 * - Serves repeated queries from a short-lived in-memory cache (instant, no
 *   network) so fast typing / retyping does not hammer the API.
 * - Cancels the in-flight request via AbortController the moment a newer
 *   query supersedes it — no wasted bandwidth or stale work.
 * - Keeps the previous list visible while a new request is in flight to
 *   avoid dropdown flicker, and ignores out-of-order responses.
 *
 * Empty queries are forwarded to the backend — it returns a curated
 * top-city default list that we show before the user types.
 */
const useSearchSuggestions = ({
  query,
  enabled = true,
  debounceMs = 200,
  limit = 8,
  provinceId,
  categoryId,
}: UseSearchSuggestionsParams): UseSearchSuggestionsResult => {
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([])
  const [impressionId, setImpressionId] = useState(0)
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedSearchFilters | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const requestSeqRef = useRef(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const applyPayload = useCallback((payload: SuggestionsPayload) => {
    setSuggestions(payload.suggestions)
    setImpressionId(payload.impressionId)
    setAppliedFilters(payload.appliedFilters)
  }, [])

  const reset = useCallback(() => {
    requestSeqRef.current += 1
    abortRef.current?.abort()
    applyPayload(EMPTY_PAYLOAD)
    setIsLoading(false)
    setHasFetched(false)
  }, [applyPayload])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const trimmed = query?.trim() ?? ''

    if (!enabled) {
      requestSeqRef.current += 1
      abortRef.current?.abort()
      applyPayload(EMPTY_PAYLOAD)
      setIsLoading(false)
      setHasFetched(false)
      return
    }

    const seq = ++requestSeqRef.current
    const key = cacheKeyOf({ q: trimmed, limit, provinceId, categoryId })

    // Fast path: a fresh cached response → render synchronously, no spinner,
    // no request. Abort any request the superseded effect run left running.
    const cached = readCache(key)
    if (cached) {
      abortRef.current?.abort()
      applyPayload(cached)
      setIsLoading(false)
      setHasFetched(true)
      return
    }

    const timer = setTimeout(async () => {
      // A newer keystroke makes the previous request useless — cancel it
      // outright instead of just ignoring its response.
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      // Only flip to loading once the request actually fires — otherwise every
      // keystroke would briefly show a spinner that gets cancelled 200ms later.
      setIsLoading(true)
      try {
        const res = await SearchSuggestionService.getSuggestions(
          { q: trimmed, limit, provinceId, categoryId },
          { signal: controller.signal },
        )
        if (seq !== requestSeqRef.current) return
        if (res.success && res.data) {
          const payload: SuggestionsPayload = {
            suggestions: res.data.suggestions ?? [],
            impressionId: res.data.impressionId ?? 0,
            appliedFilters: res.data.appliedFilters ?? null,
          }
          writeCache(key, payload)
          applyPayload(payload)
        } else {
          applyPayload(EMPTY_PAYLOAD)
        }
      } catch {
        if (seq !== requestSeqRef.current) return
        applyPayload(EMPTY_PAYLOAD)
      } finally {
        if (seq === requestSeqRef.current) {
          setIsLoading(false)
          setHasFetched(true)
        }
      }
    }, debounceMs)
    debounceTimerRef.current = timer

    // Capture the timer in the closure so cleanup clears the right handle
    // even if a later effect run overwrote the ref, and cancel any request
    // this run started so the latest query always wins.
    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [query, enabled, debounceMs, limit, provinceId, categoryId, applyPayload])

  const recordClick = useCallback(
    (payload: Omit<SearchSuggestionClickRequest, 'impressionId'>) => {
      SearchSuggestionService.recordClick({
        impressionId,
        ...payload,
      })
    },
    [impressionId],
  )

  return {
    suggestions,
    impressionId,
    appliedFilters,
    isLoading,
    hasFetched,
    reset,
    recordClick,
  }
}

export { useSearchSuggestions }
export default useSearchSuggestions
