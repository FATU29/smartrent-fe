/**
 * Types for the multi-source search suggestions API.
 *
 * Backend: GET /v1/listings/search-suggestions
 * Backend: POST /v1/listings/search-suggestions/click
 */

/**
 * All suggestion sources the backend can emit. Must stay in sync with the
 * Java `com.smartrent.enums.SuggestionType` enum:
 *
 * - `TITLE`           real listing title (navigates to detail when listingId set)
 * - `LOCATION`        province / district / ward (applies a location filter)
 * - `POPULAR_QUERY`   popular clicked query (keyword search)
 * - `TYPO_CORRECTION` local typo / abbreviation dictionary (keyword search)
 * - `PHONETIC`        similar-sounding match (keyword search)
 * - `AI_INTENT`       AI-normalized intent phrase (keyword search)
 */
export type SuggestionType =
  | 'TITLE'
  | 'LOCATION'
  | 'POPULAR_QUERY'
  | 'TYPO_CORRECTION'
  | 'PHONETIC'
  | 'AI_INTENT'

export interface TitleSuggestionMetadata {
  address?: string
}

/**
 * Structured filters the backend parsed from the raw free-text query
 * (rule-based, no AI — see `SearchQueryParser`). Returned so the frontend can
 * reflect them in the filter UI and forward them to `POST /v1/listings/search`
 * when the user submits a free-text query. Any subset of keys may be present;
 * the price values are JSON numbers (backend `BigDecimal`).
 *
 * Note: `listingType` has no slot in `ListingFilterRequest` and `productType`
 * may be `OFFICE` (outside the FE `PropertyType` union) — callers must guard.
 * The legacy IDs / codes are only present when the parsed location resolved
 * to a real place.
 */
export interface AppliedSearchFilters {
  productType?: string
  listingType?: string
  minPrice?: number
  maxPrice?: number
  /** Raw location phrase, present when it could NOT be resolved to IDs. */
  locationText?: string
  amenities?: string[]
  /**
   * Canonical amenity ids resolved by the backend against the live
   * `amenities` table (NOT the AI service's drift-prone placeholders). When
   * present, apply these as the structured `amenityIds` filter instead of
   * folding the amenity display text into the keyword.
   */
  amenityIds?: number[]
  keyword?: string
  legacyProvinceId?: number
  legacyDistrictId?: number
  legacyWardId?: number
  provinceCode?: string
  districtCode?: string
  wardCode?: string
}

/**
 * Metadata attached to AI_INTENT / TYPO_CORRECTION / PHONETIC items. The
 * backend sends a `matchType` tag (e.g. "AI_INTENT", "LOCAL_DICTIONARY")
 * for telemetry/debugging. AI_INTENT items synthesized from a structured
 * parse additionally carry the parsed `appliedFilters` so picking the
 * suggestion can auto-fill the filter panel.
 */
export interface IntentSuggestionMetadata {
  matchType?: string
  appliedFilters?: AppliedSearchFilters
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
  | IntentSuggestionMetadata
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
  /**
   * Structured filters parsed from the query, or null when the query carried
   * no recognisable filter intent. The FE applies these on free-text submit.
   */
  appliedFilters?: AppliedSearchFilters | null
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
