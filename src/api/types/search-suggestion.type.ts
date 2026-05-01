/**
 * Types for the multi-source search suggestions API.
 *
 * Backend: GET /v1/listings/search-suggestions
 * Backend: POST /v1/listings/search-suggestions/click
 */

export type SuggestionType = 'TITLE' | 'LOCATION' | 'POPULAR_QUERY'

export interface TitleSuggestionMetadata {
  address?: string
}

/**
 * Granularity of a LOCATION suggestion match. Drives how the frontend
 * applies filters when the user picks the suggestion.
 */
export type LocationMatchType = 'WARD' | 'DISTRICT' | 'PROVINCE'

export interface LocationSuggestionMetadata {
  provinceName: string
  districtName: string
  wardName?: string | null
  /** Granularity of the match — "PROVINCE" if only province matched, etc. */
  matchType?: LocationMatchType
  /** Legacy administrative codes (string, padded). */
  provinceCode?: string
  districtCode?: string
  wardCode?: string
  /** Legacy numeric IDs — what the listing search filter actually expects. */
  legacyProvinceId?: number
  legacyDistrictId?: number
  legacyWardId?: number
}

export interface PopularQuerySuggestionMetadata {
  hitCount: number
}

export type SuggestionMetadata =
  | TitleSuggestionMetadata
  | LocationSuggestionMetadata
  | PopularQuerySuggestionMetadata
  | Record<string, unknown>
  | null

export interface SearchSuggestionItem {
  type: SuggestionType
  text: string
  listingId: number | null
  score: number
  metadata: SuggestionMetadata
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestionItem[]
  queryNorm: string
  impressionId: number
}

export interface SearchSuggestionsParams {
  q: string
  limit?: number
  provinceId?: string
  categoryId?: number
}

export interface SearchSuggestionClickRequest {
  impressionId: number
  type: SuggestionType
  text: string
  listingId: number | null
  rank: number
}
