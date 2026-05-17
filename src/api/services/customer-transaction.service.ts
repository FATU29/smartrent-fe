import { apiRequest } from '@/configs/axios/instance'
import type { ApiResponse } from '@/configs/axios/types'
import { PATHS } from '@/api/paths'
import type {
  CustomerTransactionDetail,
  CustomerTransactionPage,
  CustomerTransactionQuery,
} from '@/api/types/customer-transaction.type'

/**
 * Customer transaction-history API. Backed by `/v1/me/transactions`; the
 * authenticated user is resolved from the JWT on the server.
 */
export class CustomerTransactionService {
  /** Paginated, filterable transaction list for the current user. */
  static async list(
    query: CustomerTransactionQuery = {},
  ): Promise<ApiResponse<CustomerTransactionPage>> {
    const { page = 1, size = 20, status, type, fromDate, toDate, q } = query
    return apiRequest<CustomerTransactionPage>({
      method: 'GET',
      url: PATHS.ME.TRANSACTIONS,
      // axios omits undefined params, so filters left unset are not sent.
      params: { page, size, status, type, fromDate, toDate, q },
    })
  }

  /** Full detail (timeline, invoice, room, landlord) for one transaction. */
  static async detail(
    transactionId: string,
  ): Promise<ApiResponse<CustomerTransactionDetail>> {
    const url = PATHS.ME.TRANSACTION_DETAIL.replace(
      ':transactionId',
      transactionId,
    )
    return apiRequest<CustomerTransactionDetail>({ method: 'GET', url })
  }
}

export const { list: getMyTransactions, detail: getMyTransactionDetail } =
  CustomerTransactionService
