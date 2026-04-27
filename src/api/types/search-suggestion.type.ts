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

export interface LocationSuggestionMetadata {
  provinceName: string
  districtName: string
  wardName?: string | null
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
