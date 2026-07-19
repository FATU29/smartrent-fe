/**
 * Notification Type Definitions
 * @module api/types/notification
 */

/**
 * Notification type enum matching backend NotificationType
 */
export type NotificationType =
  // Report flow
  | 'NEW_REPORT'
  | 'REPORT_RESOLVED'
  | 'REPORT_REJECTED'
  | 'REPORT_ACTION_REQUIRED'
  | 'REPORT_LISTING_REMOVED'
  // Moderation flow
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_REVISION_REQUIRED'
  | 'LISTING_SUSPENDED'
  | 'LISTING_RESUBMITTED'
  // Listing lifecycle — daily aggregate sent by the expiring-listing scheduler
  | 'LISTING_EXPIRING'
  // A followed seller published a new listing
  | 'NEW_LISTING_FROM_FOLLOWED_USER'
  // Membership lifecycle — daily aggregate sent by the membership-expiry scheduler
  | 'MEMBERSHIP_EXPIRING'

/**
 * Reference type for navigation. `LISTING_DAILY_SUMMARY` and
 * `MEMBERSHIP_DAILY_SUMMARY` are aggregate-summary markers used by their
 * respective schedulers — they have no specific listing/membership id.
 */
export type NotificationReferenceType =
  | 'LISTING'
  | 'REPORT'
  | 'LISTING_DAILY_SUMMARY'
  | 'MEMBERSHIP_DAILY_SUMMARY'

/**
 * Notification entity from API / WebSocket
 */
export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  message: string
  referenceId: number | null
  referenceType: NotificationReferenceType | null
  isRead: boolean
  createdAt: string // ISO 8601
}

/**
 * Paginated notifications response — matches backend `PageResponse<T>`
 * (`page`, `size`, `totalElements`, `totalPages`, `data`).
 */
export interface NotificationListResponse {
  data: NotificationItem[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

/**
 * Unread count response
 */
export interface NotificationUnreadCountResponse {
  unreadCount: number
}
