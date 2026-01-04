/**
 * Recently Viewed API Types
 * @module api/types/recently-viewed
 */

import type { ListingApi } from './property.type'

/**
 * Request item for sync endpoint
 * Only needs listingId and viewedAt (lightweight for syncing)
 */
export interface RecentlyViewedItem {
  listingId: number
  viewedAt: number // epoch milliseconds
}

/**
 * Request body for sync endpoint
 */
export interface RecentlyViewedSyncRequest {
  listings: RecentlyViewedItem[]
}

/**
 * Response item from API
 * Contains full listing details and viewedAt timestamp
 */
export interface RecentlyViewedItemResponse {
  listing: ListingApi // Full listing details from backend
  viewedAt: number // epoch milliseconds
}

/**
 * Response types for API endpoints
 */
export interface RecentlyViewedSyncResponse {
  code: string
  message: string | null
  data: RecentlyViewedItemResponse[]
}

export interface RecentlyViewedGetResponse {
  code: string
  message: string | null
  data: RecentlyViewedItemResponse[]
}

// ============= QUERY KEYS =============

export const RECENTLY_VIEWED_QUERY_KEYS = {
  all: ['recently-viewed'] as const,
  list: () => [...RECENTLY_VIEWED_QUERY_KEYS.all, 'list'] as const,
}
