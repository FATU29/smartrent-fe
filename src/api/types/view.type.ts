/**
 * View Tracking API Types
 * @module api/types/view
 */

/**
 * Request body for tracking a listing detail page view
 */
export interface TrackViewRequest {
  readonly listingId: number
}

/**
 * Response from tracking a listing detail page view
 */
export interface ViewTrackResult {
  readonly listingId: number
  readonly recorded: boolean
  readonly viewedAt: string
}
