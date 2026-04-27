/**
 * Search Suggestion Service
 * Multi-source ranked suggestions (titles, locations, popular queries)
 * for the listings search input.
 *
 * @module api/services/search-suggestion
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  SearchSuggestionClickRequest,
  SearchSuggestionsParams,
  SearchSuggestionsResponse,
} from '../types/search-suggestion.type'

const SESSION_ID_STORAGE_KEY = 'smartrent.searchSuggestion.sessionId'

const generateSessionId = (): string => {
  if (
    typeof globalThis !== 'undefined' &&
    'crypto' in globalThis &&
    typeof globalThis.crypto?.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID()
  }
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

/**
 * Stable opaque session/device token reused across suggestion requests
 * and click events for analytics correlation. Persists for the tab session.
 */
const getSessionId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined
  try {
    let sessionId = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY)
    if (!sessionId) {
      sessionId = generateSessionId()
      window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId)
    }
    return sessionId
  } catch {
    return undefined
  }
}

export class SearchSuggestionService {
  /**
   * Fetch ranked search suggestions from titles, locations, and popular queries.
   * Public API — no authentication required.
   *
   * Returns `data.suggestions: []` (never 4xx/5xx) when:
   * - the query is shorter than 2 chars after normalization
   * - no candidates are found
   *
   * @param params Query, limit, optional provinceId / categoryId scoping.
   */
  static async getSuggestions(
    params: SearchSuggestionsParams,
  ): Promise<ApiResponse<SearchSuggestionsResponse>> {
    const query = params.q?.trim() ?? ''
    if (query.length < 2) {
      return {
        code: '1000',
        data: { suggestions: [], queryNorm: '', impressionId: 0 },
        message: null,
        success: true,
      }
    }

    const limit = Math.min(Math.max(params.limit ?? 8, 1), 20)
    const sessionId = getSessionId()

    return apiRequest<SearchSuggestionsResponse>({
      method: 'GET',
      url: PATHS.LISTING.SEARCH_SUGGESTIONS,
      params: {
        q: query,
        limit,
        ...(params.provinceId ? { provinceId: params.provinceId } : {}),
        ...(params.categoryId !== undefined && params.categoryId !== null
          ? { categoryId: params.categoryId }
          : {}),
      },
      headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
      skipAuth: true,
    })
  }

  /**
   * Record a suggestion click. Fire-and-forget — never block UX.
   * The backend swallows write failures, so the resolved promise is
   * informational only.
   */
  static recordClick(payload: SearchSuggestionClickRequest): void {
    const sessionId = getSessionId()
    apiRequest<null>({
      method: 'POST',
      url: PATHS.LISTING.SEARCH_SUGGESTION_CLICK,
      data: {
        impressionId: payload.impressionId ?? 0,
        type: payload.type,
        text: payload.text,
        listingId: payload.listingId ?? null,
        rank: payload.rank,
      },
      headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
      skipAuth: true,
    }).catch(() => {
      /* telemetry must never block the UI */
    })
  }
}

export const { getSuggestions, recordClick } = SearchSuggestionService
