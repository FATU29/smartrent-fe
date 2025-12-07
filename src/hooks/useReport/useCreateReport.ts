import { useMutation } from '@tanstack/react-query'
import { ReportService } from '@/api/services'

import { CreateReportRequest, CreateReportResponse } from '@/api/types'
import { ApiResponse } from '@/configs/axios/types'

/**
 * Hook to submit a report for a listing
 */
export const useCreateReport = () => {
  return useMutation<
    ApiResponse<CreateReportResponse>,
    Error,
    { listingId: string | number; data: CreateReportRequest }
  >({
    mutationFn: async ({ listingId, data }) => {
      const response = await ReportService.createReport(listingId, data)
      if (!response) {
        throw new Error('Failed to create report')
      }
      return response
    },
    retry: 1,
  })
}
