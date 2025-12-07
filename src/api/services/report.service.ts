/**
 * Report Service
 * Handles all report-related operations including fetching report reasons and creating reports
 * @module api/services/report
 */

import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import {
  CreateReportRequest,
  CreateReportResponse,
  ReportReason,
} from '../types'

// ============= REPORT SERVICE CLASS =============

export class ReportService {
  /**
   * Fetch all available report reasons
   * @returns Promise containing array of report reasons grouped by category
   */
  static async getReportReasons(): Promise<ApiResponse<ReportReason[]>> {
    try {
      const response = await apiRequest<ReportReason[]>({
        method: 'GET',
        url: PATHS.REPORT.REASONS,
      })

      console.log('Report reasons API response:', response)

      // The API returns data array directly
      if (response.data && Array.isArray(response.data)) {
        return {
          ...response,
          data: response.data,
          success: response.success !== false,
        } as ApiResponse<ReportReason[]>
      }

      return {
        ...response,
        data: [],
        success: true,
      } as ApiResponse<ReportReason[]>
    } catch (error) {
      console.error('Error fetching report reasons:', error)
      return {
        code: '500',
        message: 'Failed to fetch report reasons',
        data: [],
        success: false,
      } as ApiResponse<ReportReason[]>
    }
  }

  /**
   * Submit a report for a listing
   * @param listingId - ID of the listing to report
   * @param request - Report creation request containing reason IDs, feedback, and reporter info
   * @returns Promise containing the report submission response
   */
  static async createReport(
    listingId: string | number,
    request: CreateReportRequest,
  ): Promise<ApiResponse<CreateReportResponse>> {
    try {
      const url = PATHS.REPORT.CREATE.replace(':listingId', String(listingId))

      const response = await apiRequest<CreateReportResponse>({
        method: 'POST',
        url,
        data: request,
      })

      console.log('Create report response:', response)

      return {
        ...response,
        success: response.success !== false,
      } as ApiResponse<CreateReportResponse>
    } catch (error) {
      console.error('Error creating report:', error)
      return {
        code: '500',
        message: 'Failed to submit report',
        data: undefined as unknown as CreateReportResponse,
        success: false,
      } as ApiResponse<CreateReportResponse>
    }
  }
}

// ============= NAMED EXPORTS =============

export const { getReportReasons, createReport } = ReportService
