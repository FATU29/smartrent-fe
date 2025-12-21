/**
 * Example component demonstrating payment integration
 * This file shows how to use the payment hooks and utilities
 */

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useMembershipPurchase,
  usePushListingWithPayment,
  usePushListingWithQuota,
  useTransaction,
  usePaymentHistory,
} from '@/hooks/usePayment'
import { formatCurrency, getPaymentStatusIcon } from '@/utils/payment'
import { PaymentProvider } from '@/api/types/membership.type'

// Example 1: Membership Purchase
export function MembershipPurchaseExample() {
  const [selectedMembershipId, setSelectedMembershipId] = useState(2)

  const purchaseMembership = useMembershipPurchase({
    onSuccess: (data) => {
      toast.success(`Redirecting to payment...`)
      console.log('Transaction Ref:', data.transactionRef)
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error.message}`)
    },
    autoRedirect: true, // Automatically redirect to payment URL
  })

  const handlePurchase = () => {
    const userId = 'current-user-id' // Get from auth context

    purchaseMembership.mutate({
      membershipId: selectedMembershipId,
      paymentProvider: PaymentProvider.VNPAY,
      userId,
    })
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>Purchase Membership</h2>

      <select
        value={selectedMembershipId}
        onChange={(e) => setSelectedMembershipId(Number(e.target.value))}
        className='border rounded px-4 py-2'
      >
        <option value={1}>Basic - 100,000 VND</option>
        <option value={2}>Standard - 200,000 VND</option>
        <option value={3}>Advanced - 500,000 VND</option>
      </select>

      <button
        onClick={handlePurchase}
        disabled={purchaseMembership.isPending}
        className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
      >
        {purchaseMembership.isPending ? 'Processing...' : 'Purchase Now'}
      </button>

      {purchaseMembership.isError && (
        <div className='text-red-600'>
          Error: {purchaseMembership.error.message}
        </div>
      )}
    </div>
  )
}

// Example 2: Push Listing with Payment
export function PushListingPaymentExample({
  listingId,
}: {
  listingId: number
}) {
  const pushListing = usePushListingWithPayment({
    onSuccess: (data) => {
      toast.success('Redirecting to payment...')
      console.log('Transaction Ref:', data.transactionRef)
    },
    onError: (error) => {
      toast.error(`Push failed: ${error.message}`)
    },
  })

  const handlePush = () => {
    pushListing.mutate({
      listingId,
      paymentProvider: 'VNPAY',
    })
  }

  return (
    <button
      onClick={handlePush}
      disabled={pushListing.isPending}
      className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
    >
      {pushListing.isPending ? 'Processing...' : '🚀 Push to Top'}
    </button>
  )
}

// Example 3: Push Listing with Membership Quota
export function PushListingQuotaExample({ listingId }: { listingId: number }) {
  const pushListing = usePushListingWithQuota({
    onSuccess: (data) => {
      toast.success(data.message || 'Listing pushed successfully!')
    },
    onError: (error) => {
      toast.error(`Push failed: ${error.message}`)
    },
  })

  const handlePush = () => {
    pushListing.mutate({ listingId })
  }

  return (
    <button
      onClick={handlePush}
      disabled={pushListing.isPending}
      className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50'
    >
      {pushListing.isPending ? 'Processing...' : '⭐ Push with Quota'}
    </button>
  )
}

// Example 4: Transaction Status Tracking
export function TransactionStatusExample({
  transactionRef,
}: {
  transactionRef: string
}) {
  // Poll transaction status every 2 seconds
  const { data: transaction, isLoading } = useTransaction(transactionRef, {
    refetchInterval: 2000, // Poll every 2 seconds - stopped automatically when status is terminal
  })

  if (isLoading) {
    return <div>Loading transaction...</div>
  }

  if (!transaction) {
    return <div>Transaction not found</div>
  }

  const statusIcon = getPaymentStatusIcon(transaction.status)

  return (
    <div className='border rounded p-4 space-y-2'>
      <h3 className='text-xl font-semibold'>Transaction Status</h3>

      <div className='flex items-center gap-2'>
        <span className='text-2xl'>{statusIcon}</span>
        <span className='font-semibold text-lg'>{transaction.status}</span>
      </div>

      <div className='space-y-1 text-sm'>
        <div>
          <span className='text-gray-600'>Transaction Ref:</span>{' '}
          <span className='font-mono'>{transaction.transactionRef}</span>
        </div>
        <div>
          <span className='text-gray-600'>Amount:</span>{' '}
          <span className='font-semibold'>
            {formatCurrency(transaction.amount, transaction.currency)}
          </span>
        </div>
        <div>
          <span className='text-gray-600'>Provider:</span>{' '}
          <span>{transaction.provider}</span>
        </div>
        {transaction.paymentDate && (
          <div>
            <span className='text-gray-600'>Date:</span>{' '}
            <span>{new Date(transaction.paymentDate).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Example 5: Payment History
export function PaymentHistoryExample({ userId }: { userId: string }) {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  )

  const { data: history, isLoading } = usePaymentHistory(userId, {
    page,
    size: 10,
    status: statusFilter,
  })

  if (isLoading) {
    return <div>Loading payment history...</div>
  }

  if (!history?.content || history.content.length === 0) {
    return <div>No payment history found</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>Payment History</h3>

        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || undefined)}
          className='border rounded px-3 py-1 text-sm'
        >
          <option value=''>All Statuses</option>
          <option value='COMPLETED'>Completed</option>
          <option value='PENDING'>Pending</option>
          <option value='FAILED'>Failed</option>
          <option value='CANCELLED'>Cancelled</option>
        </select>
      </div>

      <div className='space-y-2'>
        {history.content.map((transaction) => {
          const statusIcon = getPaymentStatusIcon(transaction.status)

          return (
            <div
              key={transaction.transactionRef}
              className='border rounded p-3 hover:bg-gray-50 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>{statusIcon}</span>
                  <div>
                    <div className='font-semibold'>
                      {transaction.orderInfo || 'Payment'}
                    </div>
                    <div className='text-sm text-gray-600 font-mono'>
                      {transaction.transactionRef}
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='font-semibold'>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {transaction.provider}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={history.first}
          className='px-4 py-2 border rounded disabled:opacity-50'
        >
          Previous
        </button>

        <span className='text-sm text-gray-600'>
          Page {page + 1} of {history.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={history.last}
          className='px-4 py-2 border rounded disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  )
}

// Example 6: Complete Payment Flow Component
export function CompletePaymentFlowExample() {
  const [step, setStep] = useState<'select' | 'process' | 'complete'>('select')
  const [transactionRef, setTransactionRef] = useState<string | null>(null)

  const purchaseMembership = useMembershipPurchase({
    autoRedirect: false, // Handle redirect manually
    onSuccess: (data) => {
      setTransactionRef(data.transactionRef)
      setStep('process')

      // Track in analytics
      console.log('Payment initiated:', data.transactionRef)

      // Show confirmation dialog before redirect
      const confirmRedirect = window.confirm(
        'You will be redirected to the payment page. Continue?',
      )

      if (confirmRedirect) {
        window.location.href = data.paymentUrl
      }
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error.message}`)
    },
  })

  const handlePurchase = (membershipId: number) => {
    const userId = 'current-user-id' // Get from auth context

    purchaseMembership.mutate({
      membershipId,
      paymentProvider: PaymentProvider.VNPAY,
      userId,
    })
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      {step === 'select' && (
        <div className='space-y-6'>
          <h2 className='text-3xl font-bold'>Choose Your Plan</h2>

          <div className='grid grid-cols-3 gap-4'>
            {[
              { id: 1, name: 'Basic', price: 100000 },
              { id: 2, name: 'Standard', price: 200000 },
              { id: 3, name: 'Advanced', price: 500000 },
            ].map((plan) => (
              <div
                key={plan.id}
                className='border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow'
              >
                <h3 className='text-xl font-semibold'>{plan.name}</h3>
                <div className='text-2xl font-bold'>
                  {formatCurrency(plan.price)}
                </div>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchaseMembership.isPending}
                  className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
                >
                  {purchaseMembership.isPending ? 'Processing...' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'process' && transactionRef && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold'>Processing Payment...</h2>
          <TransactionStatusExample transactionRef={transactionRef} />
        </div>
      )}

      {step === 'complete' && (
        <div className='text-center space-y-4'>
          <div className='text-6xl'>✅</div>
          <h2 className='text-2xl font-bold text-green-600'>
            Payment Complete!
          </h2>
          <button
            onClick={() => setStep('select')}
            className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Back to Plans
          </button>
        </div>
      )}
    </div>
  )
}
