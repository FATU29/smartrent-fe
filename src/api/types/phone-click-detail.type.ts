/**
 * Phone Click Detail Tracking API Types
 * @module api/types/phone-click-detail
 */

/**
 * Phone click detail response from API (with listingTitle)
 */
export interface PhoneClickDetail {
  readonly id: number
  readonly listingId: number
  readonly listingTitle?: string
  readonly userId: string
  readonly userFirstName: string
  readonly userLastName: string
  readonly userEmail: string
  readonly userContactPhone?: string | null
  readonly userContactPhoneVerified: boolean
  readonly clickedAt: string
  readonly ipAddress: string
}

/**
 * Request body for tracking phone click
 */
export interface TrackPhoneClickRequest {
  readonly listingId: number
}

/**
 * Phone click statistics response
 */
export interface PhoneClickStats {
  readonly listingId: number
  readonly totalClicks: number
  readonly uniqueUsers: number
}

/**
 * Response type for single phone click detail
 */
export interface PhoneClickDetailResponse {
  readonly code: string
  readonly message: string | null
  readonly data: PhoneClickDetail
}

/**
 * Response type for list of phone click details
 */
export interface PhoneClickDetailListResponse {
  readonly code: string
  readonly message: string | null
  readonly data: readonly PhoneClickDetail[]
}

/**
 * Response type for phone click statistics
 */
export interface PhoneClickStatsResponse {
  readonly code: string
  readonly message: string | null
  readonly data: PhoneClickStats
}

/**
 * Request parameters for searching phone clicks by listing title
 */
export interface SearchPhoneClicksRequest {
  readonly title: string
  readonly page?: number
  readonly size?: number
}

/**
 * Paginated response for phone click details
 */
export interface PhoneClickDetailPageResponse {
  readonly code: string
  readonly message: string | null
  readonly data: {
    readonly page: number
    readonly size: number
    readonly totalElements: number
    readonly totalPages: number
    readonly data: readonly PhoneClickDetail[]
  }
}
