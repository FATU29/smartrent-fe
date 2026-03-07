/**
 * Notification Service
 * Handles notification REST API operations: list, unread count, mark-as-read
 * @module api/services/notification
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from '../types/notification.type'

export class NotificationService {
  /**
   * Fetch paginated notifications
   */
  static async getNotifications(
    page = 0,
    size = 20,
  ): Promise<ApiResponse<NotificationListResponse>> {
    return apiRequest<NotificationListResponse>({
      method: 'GET',
      url: PATHS.NOTIFICATION.LIST,
      params: { page, size },
    })
  }

  /**
   * Fetch unread notification count
   */
  static async getUnreadCount(): Promise<
    ApiResponse<NotificationUnreadCountResponse>
  > {
    return apiRequest<NotificationUnreadCountResponse>({
      method: 'GET',
      url: PATHS.NOTIFICATION.UNREAD_COUNT,
    })
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: number): Promise<ApiResponse<void>> {
    const url = PATHS.NOTIFICATION.MARK_READ.replace(':id', String(id))
    return apiRequest<void>({
      method: 'PATCH',
      url,
    })
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiRequest<void>({
      method: 'PATCH',
      url: PATHS.NOTIFICATION.MARK_ALL_READ,
    })
  }
}
