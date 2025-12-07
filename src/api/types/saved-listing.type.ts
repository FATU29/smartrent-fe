/**
 * Saved Listings API Types
 * Types for the saved/favorite listings feature
 */

import { ListingDetail } from './property.type'

// ============= SAVED LISTING ENTITY =============

export interface SavedListing {
  userId: string
  listingId: number
  createdAt: string
  updatedAt: string
  listing?: ListingDetail | null
}

// ============= REQUEST TYPES =============

export interface SaveListingRequest {
  listingId: number
}

export interface GetMySavedListingsRequest {
  page?: number
  size?: number
}

// ============= RESPONSE TYPES =============

export interface SavedListingsPageResponse {
  page: number
  size: number
  totalElements: number
  totalPages: number
  data: SavedListing[]
}

// ============= QUERY KEYS =============

export const SAVED_LISTING_QUERY_KEYS = {
  all: ['saved-listings'] as const,
  lists: () => [...SAVED_LISTING_QUERY_KEYS.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...SAVED_LISTING_QUERY_KEYS.lists(), page, size] as const,
  check: (listingId: number) =>
    [...SAVED_LISTING_QUERY_KEYS.all, 'check', listingId] as const,
  count: () => [...SAVED_LISTING_QUERY_KEYS.all, 'count'] as const,
}
