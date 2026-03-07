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
  // Moderation flow
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_REVISION_REQUIRED'
  | 'LISTING_SUSPENDED'
  | 'LISTING_RESUBMITTED'

/**
 * Reference type for navigation
 */
export type NotificationReferenceType = 'LISTING' | 'REPORT'

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
 * Paginated notifications response
 */
export interface NotificationListResponse {
  content: NotificationItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

/**
 * Unread count response
 */
export interface NotificationUnreadCountResponse {
  unreadCount: number
}
