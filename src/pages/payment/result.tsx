import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useTranslations } from 'next-intl'
import { PaymentService } from '@/api/services'
import {
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

interface StoredListingInfo {
  title?: string
  vipType?: string
  durationDays?: number
  transactionType: 'POST_FEE'
}

type PaymentType = 'membership' | 'listing'

const PaymentResultPage: NextPage = () => {
  const t = useTranslations('paymentResultPage')
  const [result, setResult] = useState<PaymentResultState>({
    status: 'loading',
    message: t('processing.message'),
  })
  const [membershipInfo, setMembershipInfo] =
    useState<StoredMembershipInfo | null>(null)
  const [listingInfo, setListingInfo] = useState<StoredListingInfo | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null)

  useEffect(() => {
    // Retrieve membership info from session storage
    const storedMembership = sessionStorage.getItem('pendingMembership')
    if (storedMembership) {
      try {
        const parsedMembership = JSON.parse(
          storedMembership,
        ) as StoredMembershipInfo
        setMembershipInfo(parsedMembership)
        setPaymentType('membership')
        // Clear listing info when membership payment is detected
        setListingInfo(null)
      } catch (error) {
        console.error('Error parsing stored membership:', error)
      }
    }

    // Retrieve listing creation info from session storage
    const storedListing = sessionStorage.getItem('pendingListingCreation')
    if (storedListing) {
      try {
        const parsedListing = JSON.parse(storedListing) as StoredListingInfo
        setListingInfo(parsedListing)
        setPaymentType('listing')
        // Clear membership info when listing payment is detected
        setMembershipInfo(null)
      } catch (error) {
        console.error('Error parsing stored listing:', error)
      }
    }
    const processPaymentResult = async () => {
      try {
        // ✅ CRITICAL: Use the RAW query string from window.location.search
        // DO NOT use useSearchParams() or URLSearchParams as they decode the values
        // which breaks VNPay's signature verification
        const rawQueryString = window.location.search

        if (!rawQueryString || rawQueryString === '?') {
          setResult({
            status: 'failed',
            message: t('failed.noParams'),
          })
          return
        }

        // Create URLSearchParams only for validation and display purposes
        // The raw query string is what we pass to the backend
        const vnpParams = new URLSearchParams(rawQueryString)

        // Validate VNPay callback parameters
        const validation = validateVNPayCallback(vnpParams)
        if (!validation.isValid) {
          setResult({
            status: 'failed',
            message: `${t('failed.invalidData')}: ${validation.errors.join(', ')}`,
          })
          return
        }

        // Extract transaction info for display
        const transactionInfo = extractVNPayTransactionInfo(vnpParams)

        // ✅ Pass the RAW query string directly to the backend
        // This preserves the original URL encoding that VNPay used for signature calculation
        const response = await PaymentService.vnpayCallback(rawQueryString)

        // Handle response based on code
        if (response.code === '200000') {
          // Check if signature is valid
          if (!response.data?.signatureValid) {
            setResult({
              status: 'failed',
              message: t('failed.signatureFailed'),
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
                message: t('cancelled.message'),
                details: response.data,
                transactionInfo,
              })
              // Clear stored info on cancellation
              sessionStorage.removeItem('pendingMembership')
              sessionStorage.removeItem('pendingListingCreation')
            } else if (isSuccess) {
              // Determine success message based on payment type
              let successMessage = t('success.messageDefault')
              if (paymentType === 'listing') {
                successMessage = t('success.messageListing')
              } else if (paymentType === 'membership') {
                successMessage = t('success.messageMembership')
              }

              setResult({
                status: 'success',
                message: successMessage,
                details: response.data,
                transactionInfo,
              })
              // Clear stored info on success
              sessionStorage.removeItem('pendingMembership')
              sessionStorage.removeItem('pendingListingCreation')
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
              // Clear stored info on failure
              sessionStorage.removeItem('pendingMembership')
              sessionStorage.removeItem('pendingListingCreation')
            }
          } else {
            setResult({
              status: 'failed',
              message: response.data?.message || 'Payment was not successful',
              details: response.data,
              transactionInfo,
            })
            sessionStorage.removeItem('pendingMembership')
            sessionStorage.removeItem('pendingListingCreation')
          }
        } else {
          setResult({
            status: 'failed',
            message: response.message || 'Payment processing failed',
            details: response.data,
            transactionInfo,
          })
          sessionStorage.removeItem('pendingMembership')
          sessionStorage.removeItem('pendingListingCreation')
        }
      } catch (error) {
        console.error('Payment result processing error:', error)
        setResult({
          status: 'failed',
          message:
            error instanceof Error
              ? error.message
              : t('failed.errorProcessing'),
        })
        sessionStorage.removeItem('pendingMembership')
        sessionStorage.removeItem('pendingListingCreation')
      }
    }

    processPaymentResult()
  }, []) // Only run once on mount

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
                  {t('processing.title')}
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
                    {result.status === 'success' && t('success.title')}
                    {result.status === 'failed' && t('failed.title')}
                    {result.status === 'cancelled' && t('cancelled.title')}
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
                  {/* Show only ONE section based on payment type */}
                  {result.status === 'success' &&
                    paymentType === 'listing' &&
                    listingInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className='mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100'
                      >
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='flex items-center justify-center w-10 h-10 bg-purple-500 rounded-lg'>
                            <Sparkles className='w-6 h-6 text-white' />
                          </div>
                          <h3 className='text-xl font-bold text-gray-800'>
                            {t('sections.vipListing.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          {listingInfo.title && (
                            <div className='flex items-start justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Package className='w-5 h-5 text-purple-600' />
                                <span className='text-gray-600 font-medium'>
                                  {t('sections.vipListing.listingTitle')}
                                </span>
                              </div>
                              <span className='font-semibold text-gray-900 text-right max-w-[60%]'>
                                {listingInfo.title}
                              </span>
                            </div>
                          )}

                          {listingInfo.vipType && (
                            <div className='flex items-center justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Sparkles className='w-5 h-5 text-purple-600' />
                                <span className='text-gray-600 font-medium'>
                                  {t('sections.vipListing.vipTier')}
                                </span>
                              </div>
                              <span className='font-semibold text-gray-900'>
                                {listingInfo.vipType}
                              </span>
                            </div>
                          )}

                          {listingInfo.durationDays && (
                            <div className='flex items-center justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-5 h-5 text-purple-600' />
                                <span className='text-gray-600 font-medium'>
                                  {t('sections.vipListing.duration')}
                                </span>
                              </div>
                              <span className='font-semibold text-gray-900'>
                                {listingInfo.durationDays}{' '}
                                {t('sections.vipListing.durationDays')}
                              </span>
                            </div>
                          )}

                          {result.transactionInfo && (
                            <div className='flex items-center justify-between py-2'>
                              <div className='flex items-center gap-2'>
                                <CreditCard className='w-5 h-5 text-purple-600' />
                                <span className='text-gray-600 font-medium'>
                                  {t('sections.vipListing.amountPaid')}
                                </span>
                              </div>
                              <span className='font-bold text-xl text-gray-900'>
                                {result.transactionInfo.amount.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                VND
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='mt-6 pt-6 border-t border-purple-200'>
                          <p className='text-sm text-gray-600'>
                            {t('sections.vipListing.note')}
                          </p>
                        </div>
                      </motion.div>
                    )}

                  {/* Membership Information */}
                  {result.status === 'success' &&
                    paymentType === 'membership' &&
                    membershipInfo && (
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
                            {t('sections.membership.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          <div className='flex items-center justify-between py-2 border-b border-blue-200'>
                            <div className='flex items-center gap-2'>
                              <Package className='w-5 h-5 text-blue-600' />
                              <span className='text-gray-600 font-medium'>
                                {t('sections.membership.package')}
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
                                {t('sections.membership.duration')}
                              </span>
                            </div>
                            <span className='font-semibold text-gray-900'>
                              {membershipInfo.durationMonths}{' '}
                              {membershipInfo.durationMonths === 1
                                ? t('sections.membership.month')
                                : t('sections.membership.months')}
                            </span>
                          </div>

                          <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-2'>
                              <CreditCard className='w-5 h-5 text-blue-600' />
                              <span className='text-gray-600 font-medium'>
                                {t('sections.membership.amountPaid')}
                              </span>
                            </div>
                            <div className='text-right'>
                              <span className='font-bold text-xl text-gray-900'>
                                {membershipInfo.salePrice.toLocaleString(
                                  'vi-VN',
                                )}{' '}
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
                                {t('sections.membership.benefitsTitle')}
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
                                      - {benefit.quantityPerMonth}{' '}
                                      {t('sections.membership.perMonth')}
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
                        {t('sections.transaction.title')}
                      </h3>

                      <div className='space-y-3 text-sm'>
                        <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                          <span className='text-gray-600'>
                            {t('sections.transaction.amount')}
                          </span>
                          <span className='font-bold text-gray-900'>
                            {result.transactionInfo.amount.toLocaleString(
                              'vi-VN',
                            )}{' '}
                            VND
                          </span>
                        </div>

                        {result.transactionInfo.bankCode && (
                          <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                            <span className='text-gray-600'>
                              {t('sections.transaction.bank')}
                            </span>
                            <span className='font-semibold text-gray-900 uppercase'>
                              {result.transactionInfo.bankCode}
                            </span>
                          </div>
                        )}

                        {result.transactionInfo.transactionNo && (
                          <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                            <span className='text-gray-600'>
                              {t('sections.transaction.vnpayTxnNo')}
                            </span>
                            <span className='font-mono font-semibold text-gray-900 text-xs'>
                              {result.transactionInfo.transactionNo}
                            </span>
                          </div>
                        )}

                        {result.status === 'failed' && (
                          <div className='flex justify-between items-center py-2 bg-red-100 rounded-lg px-3 -mx-3 mt-3'>
                            <span className='text-red-700 font-medium'>
                              {t('sections.transaction.errorCode')}
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
                          onClick={() => {
                            // Redirect based on payment type
                            if (paymentType === 'listing') {
                              window.location.href = '/seller/listings'
                            } else {
                              window.location.href = '/seller/dashboard'
                            }
                          }}
                          className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                          {paymentType === 'listing'
                            ? t('actions.viewListings')
                            : t('actions.goToDashboard')}
                          <ArrowRight className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => (window.location.href = '/')}
                          className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300'
                        >
                          {t('actions.returnHome')}
                        </button>
                      </>
                    )}

                    {(result.status === 'failed' ||
                      result.status === 'cancelled') && (
                      <>
                        <button
                          onClick={() => (window.location.href = '/')}
                          className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300'
                        >
                          {t('actions.returnHome')}
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
