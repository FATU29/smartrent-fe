import { useQuery } from '@tanstack/react-query'
import { ReportService } from '@/api/services'
import { ReportReason } from '@/api/types'

/**
 * Hook to fetch report reasons
 * Automatically caches the results for 30 minutes
 */
export const useReportReasons = () => {
  return useQuery<ReportReason[], Error>({
    queryKey: ['report', 'reasons'],
    queryFn: async () => {
      const response = await ReportService.getReportReasons()
      console.log('useReportReasons - full response:', response)
      console.log('useReportReasons - data array:', response.data)

      // Extract the data array from ApiResponse
      if (response.data && Array.isArray(response.data)) {
        return response.data
      }

      throw new Error('Invalid response format')
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  })
}
