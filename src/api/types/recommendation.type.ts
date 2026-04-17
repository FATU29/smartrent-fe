import type { ListingDetail } from './property.type'

export type RecommendationMode =
  | 'similar'
  | 'similar_personalized'
  | 'similar_fallback'
  | 'personalized'
  | 'cold_start'

export interface RecommendationResponse {
  listings: ListingDetail[]
  mode: RecommendationMode
  totalReturned: number
  coldStart: boolean
}
