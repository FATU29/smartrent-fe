/**
 * React Query hooks for the current user's transaction history.
 * @module hooks/useCustomerTransactions
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { CustomerTransactionService } from '@/api/services'
import type { CustomerTransactionQuery } from '@/api/types/customer-transaction.type'

/**
 * Paginated, filterable transaction list. Previous page data is kept while the
 * next page/filters load so the table doesn't flash empty.
 *
 * @example
 * const { data } = useCustomerTransactions({ page: 1, size: 20, status: 'COMPLETED' })
 */
export function useCustomerTransactions(
  query: CustomerTransactionQuery,
  options?: { enabled?: boolean },
) {
  const { page = 1, size = 20, status, type, fromDate, toDate, q } = query

  return useQuery({
    queryKey: [
      'me',
      'transactions',
      { page, size, status, type, fromDate, toDate, q },
    ],
    queryFn: async () => {
      const response = await CustomerTransactionService.list({
        page,
        size,
        status,
        type,
        fromDate,
        toDate,
        q,
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transactions')
      }

      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Full detail for a single transaction (timeline, invoice, room, landlord).
 * Disabled until an id is provided so it only fetches when a row is opened.
 */
export function useCustomerTransactionDetail(
  transactionId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['me', 'transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) return null

      const response = await CustomerTransactionService.detail(transactionId)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transaction')
      }

      return response.data
    },
    enabled: !!transactionId && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
