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

export interface DailySaveCount {
  date: string
  count: number
}

export interface OwnerListingSavesTrendResponse {
  listingId: number
  listingTitle: string
  totalSaves: number
  savesOverTime: DailySaveCount[]
}

export interface ListingSaveSummary {
  listingId: number
  listingTitle: string
  totalSaves: number
}

export interface OwnerSavedListingsAnalyticsResponse {
  listings: ListingSaveSummary[]
  totalSavesAcrossAll: number
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
  ownerAnalytics: () =>
    [...SAVED_LISTING_QUERY_KEYS.all, 'owner-analytics'] as const,
  ownerAnalyticsSummary: () =>
    [...SAVED_LISTING_QUERY_KEYS.ownerAnalytics(), 'summary'] as const,
  ownerSavesTrend: (listingId?: number | null) =>
    [...SAVED_LISTING_QUERY_KEYS.ownerAnalytics(), 'trend', listingId] as const,
}
