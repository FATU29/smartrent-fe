import React, { useMemo, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
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
] as const

const MAX_POLL_COUNT = 10
const POLL_INTERVAL = 2000 // 2 seconds
const STALE_TIME = 1000 // 1 second - data is considered stale quickly for payment status
const GC_TIME = 5 * 60 * 1000 // 5 minutes - keep in cache for a while

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
  const t = useTranslations('paymentStatusPage')
  const previousStatusRef = useRef<PaymentStatusType | null>(null)
  const isTerminalRef = useRef(false)

  // Memoize query function to prevent recreation
  const queryFn = useCallback(async () => {
    if (!txnRef) return null
    const resp = await PaymentService.getTransaction(txnRef)
    return resp
  }, [txnRef])

  // Optimized refetch interval function
  const refetchIntervalFn = useCallback(
    (query: { state: { error: unknown; data: unknown } }) => {
      // Don't poll if there's an error
      if (query.state.error) {
        return false
      }

      // Check max poll count
      if (pollCountRef.current >= MAX_POLL_COUNT) {
        return false
      }

      const status = (
        query.state.data as ApiResponse<PaymentTransaction> | null | undefined
      )?.data?.status

      // If no data yet and no error, keep polling
      if (!status) {
        pollCountRef.current++
        return POLL_INTERVAL
      }

      // Stop polling if status is terminal
      const normalized = status.toUpperCase() as PaymentStatusType
      const shouldStop = TERMINAL_STATUSES.includes(normalized)

      if (shouldStop) {
        isTerminalRef.current = true
        return false
      }

      pollCountRef.current++
      return POLL_INTERVAL
    },
    [],
  )

  // Optimized refetch on window focus
  const refetchOnWindowFocusFn = useCallback(
    (query: { state: { error: unknown; data: unknown } }) => {
      // Don't refetch on window focus if there's an error or terminal status
      if (query.state.error || isTerminalRef.current) return false
      const status = (
        query.state.data as ApiResponse<PaymentTransaction> | null | undefined
      )?.data?.status
      if (!status) return true
      const normalized = status.toUpperCase() as PaymentStatusType
      return !TERMINAL_STATUSES.includes(normalized)
    },
    [],
  )

  // Optimized retry function
  const retryFn = useCallback((failureCount: number, error: unknown) => {
    // Don't retry if transaction not found or other client errors
    const status = (error as { response?: { status?: number } })?.response
      ?.status
    if (status === 404 || (status && status >= 400 && status < 500)) {
      return false
    }
    // Retry up to 2 times for server errors or network issues
    return failureCount < 2
  }, [])

  // Store previous data to use as placeholder
  const previousDataRef = useRef<
    ApiResponse<PaymentTransaction> | null | undefined
  >(null)
  const previousStatusRefForUI = useRef<PaymentStatusType | null>(null)

  const {
    data: txnResp,
    isFetching,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment', 'transaction', txnRef],
    queryFn,
    enabled: !!txnRef && typeof window !== 'undefined', // Client-side only
    refetchInterval: refetchIntervalFn,
    refetchOnWindowFocus: refetchOnWindowFocusFn,
    refetchOnMount: true, // Always refetch on mount to get latest status
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: retryFn,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    // Client-side only - no SSR for polling
    networkMode: 'online',
    // Keep previous data while fetching to prevent UI flickering
    placeholderData: (previousData) => {
      const data = previousData || previousDataRef.current || undefined
      if (data) {
        previousDataRef.current = data
      }
      return data
    },
  })

  // Update previous data ref when new data arrives
  useEffect(() => {
    if (txnResp) {
      previousDataRef.current = txnResp
    }
  }, [txnResp])

  // Calculate status from response - use stable reference to prevent flickering
  const status = useMemo(() => {
    let newStatus: PaymentStatusType
    if (error) {
      newStatus = 'FAILED' as PaymentStatusType
    } else if (!txnResp?.data?.status) {
      newStatus = (txnRef ? 'PENDING' : 'UNKNOWN') as PaymentStatusType
    } else {
      newStatus = txnResp.data.status.toUpperCase() as PaymentStatusType
    }

    // Update ref only when status actually changes
    if (previousStatusRefForUI.current !== newStatus) {
      previousStatusRefForUI.current = newStatus
    }

    // Return current status (will be stable if unchanged)
    return newStatus
  }, [error, txnResp?.data?.status, txnRef])

  // Memoize isTerminal calculation
  const isTerminal = useMemo(() => {
    return TERMINAL_STATUSES.includes(status) || !!error
  }, [status, error])

  // Update terminal ref when status changes
  useEffect(() => {
    if (isTerminal) {
      isTerminalRef.current = true
    }
  }, [isTerminal])

  // Reset poll count when transaction ref changes
  useEffect(() => {
    pollCountRef.current = 0
    isTerminalRef.current = false
    previousStatusRef.current = null
    previousStatusRefForUI.current = null
    previousDataRef.current = null // Reset previous data when transaction changes
  }, [txnRef])

  // Show toast notification when status changes to COMPLETED
  useEffect(() => {
    if (
      status === 'COMPLETED' &&
      previousStatusRef.current !== 'COMPLETED' &&
      previousStatusRef.current !== null
    ) {
      toast.success(t('states.completed.title'), {
        description: t('states.completed.desc'),
      })
    }
    previousStatusRef.current = status
  }, [status, t])

  // Memoize handleRetry to prevent recreation
  const handleRetry = useCallback(() => {
    pollCountRef.current = 0
    isTerminalRef.current = false
    router.replace(router.asPath)
  }, [router])

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
        isLoading={isLoading}
        isFetching={isFetching}
        error={error as Error | null}
        isTerminal={isTerminal}
        onRetry={handleRetry}
        productInfo={productInfo}
      />
    </MainLayout>
  )
}

export default PaymentStatusPage
