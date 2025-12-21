import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useSearchParams } from 'next/navigation'
import { PaymentService } from '@/api/services'
import {
  filterVNPayParams,
  extractVNPayTransactionInfo,
  getVNPayResponseMessage,
  isVNPaySuccess,
  isVNPayCancelled,
  validateVNPayCallback,
} from '@/utils/payment'
import type { PaymentCallbackResponse } from '@/api/types/payment.type'
import {
  Check,
  X,
  AlertCircle,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  Hash,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled'

interface PaymentResultState {
  status: PaymentStatus
  message: string
  details?: PaymentCallbackResponse
  transactionInfo?: ReturnType<typeof extractVNPayTransactionInfo>
}

interface StoredMembershipInfo {
  membershipId: number
  packageName: string
  packageLevel: string
  salePrice: number
  originalPrice: number
  durationMonths: number
  discountPercentage: number
  benefits: Array<{
    benefitId: number
    benefitType: string
    benefitNameDisplay: string
    quantityPerMonth: number
  }>
}

const PaymentResultPage: NextPage = () => {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<PaymentResultState>({
    status: 'loading',
    message: 'Processing payment...',
  })
  const [membershipInfo, setMembershipInfo] =
    useState<StoredMembershipInfo | null>(null)

  useEffect(() => {
    // Retrieve membership info from session storage
    const storedMembership = sessionStorage.getItem('pendingMembership')
    if (storedMembership) {
      try {
        const parsedMembership = JSON.parse(
          storedMembership,
        ) as StoredMembershipInfo
        setMembershipInfo(parsedMembership)
      } catch (error) {
        console.error('Error parsing stored membership:', error)
      }
    }
    const processPaymentResult = async () => {
      try {
        // Filter only VNPay parameters (starting with 'vnp_')
        const vnpParams = filterVNPayParams(searchParams)
        const queryString = vnpParams.toString()

        if (!queryString) {
          setResult({
            status: 'failed',
            message: 'No payment parameters found',
          })
          return
        }

        // Validate VNPay callback parameters
        const validation = validateVNPayCallback(vnpParams)
        if (!validation.isValid) {
          setResult({
            status: 'failed',
            message: `Invalid payment data: ${validation.errors.join(', ')}`,
          })
          return
        }

        // Extract transaction info for display
        const transactionInfo = extractVNPayTransactionInfo(vnpParams)

        // Call the backend callback endpoint with filtered parameters
        const response = await PaymentService.vnpayCallback(`?${queryString}`)

        // Handle response based on code
        if (response.code === '200000') {
          // Check if signature is valid
          if (!response.data?.signatureValid) {
            setResult({
              status: 'failed',
              message: 'Payment signature verification failed',
              details: response.data,
              transactionInfo,
            })
            return
          }

          // Check if payment was successful
          if (response.data?.success) {
            // Check VNPay response code for additional context
            const isSuccess = isVNPaySuccess(transactionInfo.responseCode)
            const isCancelled = isVNPayCancelled(transactionInfo.responseCode)

            if (isCancelled) {
              setResult({
                status: 'cancelled',
                message: 'Payment was cancelled',
                details: response.data,
                transactionInfo,
              })
              // Clear stored membership on cancellation
              sessionStorage.removeItem('pendingMembership')
            } else if (isSuccess) {
              setResult({
                status: 'success',
                message: 'Payment completed successfully!',
                details: response.data,
                transactionInfo,
              })
              // Clear stored membership on success
              sessionStorage.removeItem('pendingMembership')
            } else {
              const errorMessage = getVNPayResponseMessage(
                transactionInfo.responseCode,
              )
              setResult({
                status: 'failed',
                message: `Payment failed: ${errorMessage}`,
                details: response.data,
                transactionInfo,
              })
              // Clear stored membership on failure
              sessionStorage.removeItem('pendingMembership')
            }
          } else {
            setResult({
              status: 'failed',
              message: response.data?.message || 'Payment was not successful',
              details: response.data,
              transactionInfo,
            })
            sessionStorage.removeItem('pendingMembership')
          }
        } else {
          setResult({
            status: 'failed',
            message: response.message || 'Payment processing failed',
            details: response.data,
            transactionInfo,
          })
          sessionStorage.removeItem('pendingMembership')
        }
      } catch (error) {
        console.error('Payment result processing error:', error)
        setResult({
          status: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'Error processing payment result',
        })
        sessionStorage.removeItem('pendingMembership')
      }
    }

    processPaymentResult()
  }, [searchParams])

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return <Check className='w-16 h-16 text-white' />
      case 'failed':
        return <X className='w-16 h-16 text-white' />
      case 'cancelled':
        return <AlertCircle className='w-16 h-16 text-white' />
      default:
        return null
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return 'from-emerald-500 to-green-600'
      case 'failed':
        return 'from-red-500 to-rose-600'
      case 'cancelled':
        return 'from-amber-500 to-orange-600'
      default:
        return 'from-blue-500 to-indigo-600'
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={result.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl'
        >
          <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
            {/* Loading State */}
            {result.status === 'loading' && (
              <div className='p-12 text-center'>
                <div className='flex justify-center mb-6'>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full'
                  />
                </div>
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                  Processing Payment
                </h2>
                <p className='text-gray-600'>{result.message}</p>
              </div>
            )}

            {/* Success/Failed/Cancelled States */}
            {result.status !== 'loading' && (
              <>
                {/* Status Header with Icon */}
                <div
                  className={cn(
                    'bg-gradient-to-br p-8 text-center relative overflow-hidden',
                    getStatusColor(result.status),
                  )}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className='inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-4'
                  >
                    {getStatusIcon(result.status)}
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='text-3xl font-bold text-white mb-2'
                  >
                    {result.status === 'success' && 'Payment Successful!'}
                    {result.status === 'failed' && 'Payment Failed'}
                    {result.status === 'cancelled' && 'Payment Cancelled'}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='text-white/90 text-lg'
                  >
                    {result.message}
                  </motion.p>

                  {/* Decorative elements */}
                  <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16' />
                  <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12' />
                </div>

                {/* Content Area */}
                <div className='p-8'>
                  {/* Membership Information */}
                  {result.status === 'success' && membershipInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className='mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'
                    >
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg'>
                          <Sparkles className='w-6 h-6 text-white' />
                        </div>
                        <h3 className='text-xl font-bold text-gray-800'>
                          Membership Details
                        </h3>
                      </div>

                      <div className='space-y-3'>
                        <div className='flex items-center justify-between py-2 border-b border-blue-200'>
                          <div className='flex items-center gap-2'>
                            <Package className='w-5 h-5 text-blue-600' />
                            <span className='text-gray-600 font-medium'>
                              Package
                            </span>
                          </div>
                          <span className='font-semibold text-gray-900'>
                            {membershipInfo.packageName}
                          </span>
                        </div>

                        <div className='flex items-center justify-between py-2 border-b border-blue-200'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-5 h-5 text-blue-600' />
                            <span className='text-gray-600 font-medium'>
                              Duration
                            </span>
                          </div>
                          <span className='font-semibold text-gray-900'>
                            {membershipInfo.durationMonths}{' '}
                            {membershipInfo.durationMonths === 1
                              ? 'Month'
                              : 'Months'}
                          </span>
                        </div>

                        <div className='flex items-center justify-between py-2'>
                          <div className='flex items-center gap-2'>
                            <CreditCard className='w-5 h-5 text-blue-600' />
                            <span className='text-gray-600 font-medium'>
                              Amount Paid
                            </span>
                          </div>
                          <div className='text-right'>
                            <span className='font-bold text-xl text-gray-900'>
                              {membershipInfo.salePrice.toLocaleString('vi-VN')}{' '}
                              VND
                            </span>
                            {membershipInfo.discountPercentage > 0 && (
                              <div className='flex items-center gap-2 justify-end'>
                                <span className='text-sm text-gray-500 line-through'>
                                  {membershipInfo.originalPrice.toLocaleString(
                                    'vi-VN',
                                  )}{' '}
                                  VND
                                </span>
                                <span className='text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded'>
                                  -{membershipInfo.discountPercentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Benefits */}
                      {membershipInfo.benefits &&
                        membershipInfo.benefits.length > 0 && (
                          <div className='mt-6 pt-6 border-t border-blue-200'>
                            <h4 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                              <Sparkles className='w-4 h-4 text-blue-600' />
                              Included Benefits
                            </h4>
                            <ul className='space-y-2'>
                              {membershipInfo.benefits.map((benefit) => (
                                <li
                                  key={benefit.benefitId}
                                  className='flex items-start gap-2 text-sm'
                                >
                                  <Check className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                                  <span className='text-gray-700'>
                                    <strong>
                                      {benefit.benefitNameDisplay}
                                    </strong>{' '}
                                    - {benefit.quantityPerMonth} per month
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </motion.div>
                  )}

                  {/* Transaction Details */}
                  {result.transactionInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay:
                          result.status === 'success' && membershipInfo
                            ? 0.6
                            : 0.4,
                      }}
                      className={cn(
                        'rounded-xl p-6 border mb-8',
                        result.status === 'success' &&
                          'bg-gray-50 border-gray-200',
                        result.status === 'failed' &&
                          'bg-red-50 border-red-200',
                        result.status === 'cancelled' &&
                          'bg-amber-50 border-amber-200',
                      )}
                    >
                      <h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                        <Hash className='w-5 h-5 text-gray-600' />
                        Transaction Details
                      </h3>

                      <div className='space-y-3 text-sm'>
                        <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                          <span className='text-gray-600'>Amount</span>
                          <span className='font-bold text-gray-900'>
                            {result.transactionInfo.amount.toLocaleString(
                              'vi-VN',
                            )}{' '}
                            VND
                          </span>
                        </div>

                        {result.transactionInfo.bankCode && (
                          <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                            <span className='text-gray-600'>Bank</span>
                            <span className='font-semibold text-gray-900 uppercase'>
                              {result.transactionInfo.bankCode}
                            </span>
                          </div>
                        )}

                        {result.transactionInfo.transactionNo && (
                          <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                            <span className='text-gray-600'>
                              VNPay Transaction No
                            </span>
                            <span className='font-mono font-semibold text-gray-900 text-xs'>
                              {result.transactionInfo.transactionNo}
                            </span>
                          </div>
                        )}

                        {result.status === 'failed' && (
                          <div className='flex justify-between items-center py-2 bg-red-100 rounded-lg px-3 -mx-3 mt-3'>
                            <span className='text-red-700 font-medium'>
                              Error Code
                            </span>
                            <span className='font-mono font-bold text-red-900'>
                              {result.transactionInfo.responseCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className='flex flex-col sm:flex-row gap-3'
                  >
                    {result.status === 'success' && (
                      <>
                        <button
                          onClick={() =>
                            (window.location.href = '/seller/dashboard')
                          }
                          className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                          Go to Dashboard
                          <ArrowRight className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => (window.location.href = '/')}
                          className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300'
                        >
                          Return to Home
                        </button>
                      </>
                    )}

                    {(result.status === 'failed' ||
                      result.status === 'cancelled') && (
                      <>
                        <button
                          onClick={() => window.history.back()}
                          className='flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl'
                        >
                          {result.status === 'cancelled'
                            ? 'Go Back'
                            : 'Try Again'}
                        </button>
                        <button
                          onClick={() => (window.location.href = '/')}
                          className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300'
                        >
                          Return to Home
                        </button>
                      </>
                    )}
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default PaymentResultPage
