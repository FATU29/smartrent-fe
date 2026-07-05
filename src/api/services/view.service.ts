/**
 * View Service
 * Handles listing detail page view tracking
 * @module api/services/view
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type { TrackViewRequest, ViewTrackResult } from '@/api/types/view.type'

export class ViewService {
  /**
   * Track a listing detail page view.
   * Public endpoint, no authentication required.
   * @param data - Request body containing listingId
   */
  static async trackView(
    data: TrackViewRequest,
  ): Promise<ApiResponse<ViewTrackResult>> {
    return apiRequest<ViewTrackResult>({
      method: 'POST',
      url: PATHS.VIEW.TRACK,
      data,
      skipAuth: true,
    })
  }
}

// ============= EXPORTS =============

export const { trackView } = ViewService
