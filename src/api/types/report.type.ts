/**
 * Report Type Definitions
 * @module api/types/report
 */

/**
 * Report reason category
 */
export type ReportCategory = 'LISTING' | 'MAP'

/**
 * Individual report reason
 */
export interface ReportReason {
  reasonId: number
  reasonText: string
  category: ReportCategory
  displayOrder: number
}

/**
 * Report reasons response
 */
export interface ReportReasonsResponse {
  reasons: ReportReason[]
}

/**
 * Report submission request
 */
export interface CreateReportRequest {
  reasonIds: number[]
  otherFeedback?: string
  reporterName?: string
  reporterPhone?: string
  reporterEmail?: string
  category: ReportCategory
}

/**
 * Report submission response
 */
export interface CreateReportResponse {
  reportId: number
  listingId: number
  reporterName?: string
  reporterPhone?: string
  reporterEmail?: string
  reportReasons: ReportReason[]
  otherFeedback?: string
  category: ReportCategory
  createdAt: string
}
