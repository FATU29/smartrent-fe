import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchSuggestionService } from '@/api/services/search-suggestion.service'
import type {
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
  isLoading: boolean
  hasFetched: boolean
  reset: () => void
  recordClick: (
    payload: Omit<SearchSuggestionClickRequest, 'impressionId'>,
  ) => void
}

const MIN_QUERY_LENGTH = 2

/**
 * Debounced fetch for the multi-source search-suggestions endpoint.
 * Cancels stale responses, keeps the previous list visible while a new
 * request is in flight to avoid dropdown flicker, and exposes a
 * `recordClick` helper that bundles the latest impressionId.
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
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const requestSeqRef = useRef(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    requestSeqRef.current += 1
    setSuggestions([])
    setImpressionId(0)
    setIsLoading(false)
    setHasFetched(false)
  }, [])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    const trimmed = query?.trim() ?? ''

    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      requestSeqRef.current += 1
      setSuggestions([])
      setImpressionId(0)
      setIsLoading(false)
      setHasFetched(false)
      return
    }

    const seq = ++requestSeqRef.current
    setIsLoading(true)

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await SearchSuggestionService.getSuggestions({
          q: trimmed,
          limit,
          provinceId,
          categoryId,
        })
        if (seq !== requestSeqRef.current) return
        if (res.success && res.data) {
          setSuggestions(res.data.suggestions ?? [])
          setImpressionId(res.data.impressionId ?? 0)
        } else {
          setSuggestions([])
          setImpressionId(0)
        }
      } catch {
        if (seq !== requestSeqRef.current) return
        setSuggestions([])
        setImpressionId(0)
      } finally {
        if (seq === requestSeqRef.current) {
          setIsLoading(false)
          setHasFetched(true)
        }
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [query, enabled, debounceMs, limit, provinceId, categoryId])

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
    isLoading,
    hasFetched,
    reset,
    recordClick,
  }
}

export { useSearchSuggestions }
export default useSearchSuggestions
