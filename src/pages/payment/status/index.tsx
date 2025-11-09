import React, { useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '@/components/layouts/homePageLayout'
import { PaymentService } from '@/api/services'
import type { PaymentTransaction } from '@/api/types/payment.type'
import type { ApiResponse } from '@/configs/axios/types'
import { PaymentStatusTemplate } from '@/components/templates/paymentStatusTemplate'
import type { PaymentStatusType } from '@/components/atoms/paymentStatusBadge/index.constants'

const TERMINAL_STATUSES: PaymentStatusType[] = [
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]

const MAX_POLL_COUNT = 10

function useTransactionRefFromQuery() {
  const router = useRouter()
  return useMemo(() => {
    const q = router.query
    // Try common keys from providers (VNPAY often uses vnp_TxnRef)
    const byStd = (q.transactionRef || q.txnRef || q.txRef) as
      | string
      | undefined
    const byVnp = (q.vnp_TxnRef || q.vnp_txnref) as string | undefined
    return (byStd || byVnp || '') as string
  }, [router.query])
}

const PaymentStatusPage: React.FC = () => {
  const router = useRouter()
  const txnRef = useTransactionRefFromQuery()
  const pollCountRef = useRef(0)

  const {
    data: txnResp,
    isFetching,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment', 'transaction', txnRef],
    queryFn: async () => {
      if (!txnRef) return null
      const resp = await PaymentService.getTransaction(txnRef)
      return resp
    },
    enabled: !!txnRef,
    refetchInterval: (query) => {
      // Don't poll if there's an error
      if (query.state.error) {
        console.log('🛑 Stopped polling due to error:', query.state.error)
        return false
      }

      // Check max poll count
      if (pollCountRef.current >= MAX_POLL_COUNT) {
        console.log('🛑 Stopped polling: reached max poll count (10)')
        return false
      }

      const status = (
        query.state.data as ApiResponse<PaymentTransaction> | null | undefined
      )?.data?.status

      // If no data yet and no error, keep polling
      if (!status) {
        pollCountRef.current++
        console.log(
          `⏳ Polling... (${pollCountRef.current}/${MAX_POLL_COUNT}) (no status yet)`,
        )
        return 2000
      }

      // Stop polling if status is terminal
      const normalized = status.toUpperCase() as PaymentStatusType
      const shouldStop = TERMINAL_STATUSES.includes(normalized)

      if (!shouldStop) {
        pollCountRef.current++
      }

      console.log(
        shouldStop
          ? '✅ Stopped polling (terminal status)'
          : `⏳ Polling... (${pollCountRef.current}/${MAX_POLL_COUNT})`,
        normalized,
      )
      return shouldStop ? false : 2000
    },
    refetchOnWindowFocus: (query) => {
      // Don't refetch on window focus if there's an error or terminal status
      if (query.state.error) return false
      const status = (
        query.state.data as ApiResponse<PaymentTransaction> | null | undefined
      )?.data?.status
      if (!status) return true
      const normalized = status.toUpperCase() as PaymentStatusType
      return !TERMINAL_STATUSES.includes(normalized)
    },
    retry: (failureCount, error: unknown) => {
      // Don't retry if transaction not found or other client errors
      const status = (error as { response?: { status?: number } })?.response
        ?.status
      if (status === 404 || (status && status >= 400 && status < 500)) {
        return false
      }
      // Retry up to 2 times for server errors or network issues
      return failureCount < 2
    },
  })

  // Determine status - treat error as FAILED
  const status = (
    error
      ? 'FAILED'
      : txnResp?.data?.status?.toUpperCase() || (txnRef ? 'PENDING' : 'UNKNOWN')
  ) as PaymentStatusType
  const isTerminal = TERMINAL_STATUSES.includes(status) || !!error

  const handleRetry = () => {
    router.replace(router.asPath)
  }

  // Build product info from transaction data
  const productInfo = useMemo(() => {
    if (!txnResp?.data) return null
    const txn = txnResp.data

    return (
      <div className='space-y-2'>
        {txn.orderInfo && (
          <div>
            <div className='text-xs text-muted-foreground'>
              {txn.transactionType === 'MEMBERSHIP_PURCHASE'
                ? 'Gói membership'
                : 'Sản phẩm'}
            </div>
            <div className='text-sm font-medium'>{txn.orderInfo}</div>
          </div>
        )}
        {txn.amount && (
          <div className='flex items-baseline gap-2'>
            <span className='text-xs text-muted-foreground'>Số tiền:</span>
            <span className='text-base font-semibold'>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: txn.currency || 'VND',
              }).format(txn.amount)}
            </span>
          </div>
        )}
        {txn.paymentMethod && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-muted-foreground'>Phương thức:</span>
            <span>{txn.paymentMethod}</span>
          </div>
        )}
        {txn.paymentDate && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-muted-foreground'>Thời gian:</span>
            <span>{new Date(txn.paymentDate).toLocaleString('vi-VN')}</span>
          </div>
        )}
      </div>
    )
  }, [txnResp?.data])

  return (
    <MainLayout>
      <PaymentStatusTemplate
        transactionRef={txnRef}
        status={status}
        message={txnResp?.message}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        isTerminal={isTerminal}
        onRetry={handleRetry}
        productInfo={productInfo}
      />
    </MainLayout>
  )
}

export default PaymentStatusPage
