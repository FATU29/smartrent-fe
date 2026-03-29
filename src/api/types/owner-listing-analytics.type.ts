/**
 * Owner Listing Analytics API Types
 * @module api/types/owner-listing-analytics
 */

export type InterestLevelValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'TRENDING'

export interface InterestLevel {
  readonly level: InterestLevelValue
  readonly label: string
}

export interface ListingAnalyticsOverTimeItem {
  readonly date: string
  readonly count: number
}

export type ListingAnalyticsByDayOfWeek = Record<string, number>

export interface OwnerListingAnalytics {
  readonly listingId: number
  readonly listingTitle: string
  readonly totalClicks: number
  readonly totalViews: number
  readonly conversionRate: number
  readonly clicksOverTime: readonly ListingAnalyticsOverTimeItem[]
  readonly clicksByDayOfWeek: ListingAnalyticsByDayOfWeek
}

export interface OwnerListingAnalyticsSummaryItem {
  readonly listingId: number
  readonly listingTitle: string
  readonly totalClicks: number
}

export interface OwnerListingAnalyticsSummary {
  readonly listings: readonly OwnerListingAnalyticsSummaryItem[]
}

export interface OwnerListingAnalyticsPageResponse {
  readonly listings: readonly OwnerListingAnalyticsSummaryItem[]
  readonly currentPage: number
  readonly totalPages: number
  readonly totalElements: number
  readonly pageSize: number
}

export type ListingsAnalyticsSearchRequest = {
  keyword?: string | null
  page?: number
  size?: number
}
