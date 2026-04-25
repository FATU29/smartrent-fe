import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PaymentService, ListingService } from '@/api/services'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import {
  clearPendingTransactionRef,
  extractVNPayTransactionInfo,
  getPendingTransactionRef,
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

interface StoredMembershipUpgradeInfo {
  targetMembershipId: number
  targetPackageName: string
  targetPackageLevel: string
  currentMembershipId?: number
  currentPackageName?: string
  discountAmount?: number
  finalPrice?: number
  transactionRef?: string | null
}

interface StoredListingInfo {
  title?: string
  vipType?: string
  durationDays?: number
  transactionType: 'POST_FEE'
  draftId?: string | number | null
}

type PaymentType = 'membership' | 'membershipUpgrade' | 'listing'

const PaymentResultPage: NextPageWithLayout = () => {
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
    const clearPendingPaymentStorage = () => {
      sessionStorage.removeItem('pendingMembership')
      sessionStorage.removeItem('pendingMembershipUpgrade')
      sessionStorage.removeItem('pendingListingCreation')
      clearPendingTransactionRef()
    }

    const normalizeFailedMessage = (
      rawMessage?: string | null,
      fallback?: string | null,
    ) => {
      const trimmed = rawMessage?.trim()
      const source = trimmed || fallback || ''
      const normalized = source.toLowerCase()

      if (
        normalized.includes('zalopay_order_not_found') ||
        normalized.includes('transaction not found for app_trans_id') ||
        normalized.includes('order not found')
      ) {
        return t('failed.orderNotFound')
      }

      if (
        normalized.includes('zalopay_missing_apptransid') ||
        normalized.includes('zalopay_missing_status')
      ) {
        return t('failed.invalidData')
      }

      if (
        normalized.includes('gateway timeout') ||
        normalized.includes('timeout') ||
        normalized.includes('network error') ||
        normalized.includes('failed to fetch') ||
        normalized.includes('err_failed') ||
        normalized.includes('cors') ||
        normalized.includes('payment_gateway_unreachable') ||
        normalized.includes('504')
      ) {
        return t('failed.gatewayUnavailable')
      }

      return source || t('failed.errorProcessing')
    }

    const normalizeErrorFromException = (error: unknown) => {
      if (error instanceof Error) {
        return normalizeFailedMessage(error.message)
      }

      return t('failed.errorProcessing')
    }

    const getSuccessMessageByPaymentType = (type: PaymentType | null) => {
      if (type === 'listing') {
        return t('success.messageListing')
      }

      if (type === 'membership') {
        return t('success.messageMembership')
      }

      if (type === 'membershipUpgrade') {
        return t('success.messageMembershipUpgrade')
      }

      return t('success.messageDefault')
    }

    const isVNPayCallback = (params: URLSearchParams) =>
      Array.from(params.keys()).some((key) => key.startsWith('vnp_'))

    const isZaloPayCallback = (params: URLSearchParams) =>
      [
        'status',
        'apptransid',
        'checksum',
        'appid',
        'bankcode',
        // Backward compatibility with older ZaloPay redirect schemas
        'resultCode',
        'orderId',
      ].some((key) => params.has(key))

    const extractZaloPayTransactionInfo = (params: URLSearchParams) => ({
      transactionRef:
        params.get('apptransid') ||
        params.get('orderId') ||
        getPendingTransactionRef() ||
        '',
      amount: Number(params.get('amount') || '0'),
      responseCode: params.get('status') || params.get('resultCode') || '',
      transactionStatus: params.get('status') || params.get('resultCode') || '',
      transactionNo: params.get('apptransid') || params.get('orderId') || '',
      bankCode: params.get('bankcode') || 'ZALOPAY',
      payDate: '',
      orderInfo: params.get('description') || '',
    })

    const deleteDraftAfterSuccessfulListingPayment = async (
      type: PaymentType | null,
      storedListingRaw: string | null,
    ) => {
      if (type !== 'listing' || !storedListingRaw) {
        return
      }

      try {
        const parsedListing = JSON.parse(storedListingRaw) as StoredListingInfo
        if (parsedListing.draftId) {
          await ListingService.deleteDraft(parsedListing.draftId)
          console.log(
            '✅ Draft deleted successfully after payment:',
            parsedListing.draftId,
          )
        }
      } catch (error) {
        console.error('❌ Failed to delete draft after payment:', error)
      }
    }

    const storedUpgrade = sessionStorage.getItem('pendingMembershipUpgrade')
    const storedMembership = sessionStorage.getItem('pendingMembership')
    const storedListing = sessionStorage.getItem('pendingListingCreation')

    let detectedPaymentType: PaymentType | null = null

    if (storedUpgrade) {
      try {
        JSON.parse(storedUpgrade) as StoredMembershipUpgradeInfo
        detectedPaymentType = 'membershipUpgrade'
        setMembershipInfo(null)
        setListingInfo(null)
      } catch (error) {
        console.error('Error parsing stored membership upgrade:', error)
      }
    }

    if (!detectedPaymentType && storedMembership) {
      try {
        const parsedMembership = JSON.parse(
          storedMembership,
        ) as StoredMembershipInfo
        detectedPaymentType = 'membership'
        setMembershipInfo(parsedMembership)
        setListingInfo(null)
      } catch (error) {
        console.error('Error parsing stored membership:', error)
      }
    }

    if (!detectedPaymentType && storedListing) {
      try {
        const parsedListing = JSON.parse(storedListing) as StoredListingInfo
        detectedPaymentType = 'listing'
        setListingInfo(parsedListing)
        setMembershipInfo(null)
      } catch (error) {
        console.error('Error parsing stored listing:', error)
      }
    }

    setPaymentType(detectedPaymentType)

    const processPaymentResult = async () => {
      try {
        const rawQueryString = window.location.search

        if (!rawQueryString || rawQueryString === '?') {
          setResult({
            status: 'failed',
            message: t('failed.noParams'),
          })
          return
        }

        const queryParams = new URLSearchParams(rawQueryString)

        if (isVNPayCallback(queryParams)) {
          const validation = validateVNPayCallback(queryParams)
          if (!validation.isValid) {
            setResult({
              status: 'failed',
              message: `${t('failed.invalidData')}: ${validation.errors.join(', ')}`,
            })
            return
          }

          const transactionInfo = extractVNPayTransactionInfo(queryParams)
          const callbackResponse =
            await PaymentService.vnpayCallback(rawQueryString)

          if (!callbackResponse.success) {
            throw new Error('PAYMENT_GATEWAY_UNREACHABLE')
          }

          const callbackData = callbackResponse.data

          if (callbackData?.signatureValid === false) {
            setResult({
              status: 'failed',
              message: t('failed.signatureFailed'),
              details: callbackData,
              transactionInfo,
            })
            clearPendingPaymentStorage()
            return
          }

          const callbackStatus = callbackData?.status?.toUpperCase()
          const callbackIsSuccess =
            callbackData?.success === true || callbackStatus === 'COMPLETED'
          const callbackIsCancelled = callbackStatus === 'CANCELLED'

          const vnpIsSuccess = isVNPaySuccess(transactionInfo.responseCode)
          const vnpIsCancelled = isVNPayCancelled(transactionInfo.responseCode)

          if (vnpIsCancelled || callbackIsCancelled) {
            setResult({
              status: 'cancelled',
              message: t('cancelled.message'),
              details: callbackData,
              transactionInfo,
            })
            clearPendingPaymentStorage()
            return
          }

          if (vnpIsSuccess && callbackIsSuccess) {
            const successMessage =
              getSuccessMessageByPaymentType(detectedPaymentType)

            setResult({
              status: 'success',
              message: successMessage,
              details: callbackData,
              transactionInfo,
            })

            await deleteDraftAfterSuccessfulListingPayment(
              detectedPaymentType,
              storedListing,
            )
            clearPendingPaymentStorage()
            return
          }

          const vnpErrorMessage = vnpIsSuccess
            ? null
            : getVNPayResponseMessage(transactionInfo.responseCode)

          setResult({
            status: 'failed',
            message: normalizeFailedMessage(
              callbackData?.message || callbackResponse.message,
              vnpErrorMessage,
            ),
            details: callbackData,
            transactionInfo,
          })

          clearPendingPaymentStorage()

          return
        }

        if (isZaloPayCallback(queryParams)) {
          const redirectStatus =
            queryParams.get('status') || queryParams.get('resultCode') || ''

          const callbackResponse = await PaymentService.callback(
            'ZALOPAY',
            Object.fromEntries(queryParams.entries()),
          )

          if (!callbackResponse.success) {
            throw new Error('PAYMENT_GATEWAY_UNREACHABLE')
          }

          const callbackData = callbackResponse.data

          const callbackStatus = callbackData?.status?.toUpperCase()
          const backendHasDecision =
            typeof callbackData?.success === 'boolean' ||
            callbackStatus === 'COMPLETED' ||
            callbackStatus === 'FAILED' ||
            callbackStatus === 'CANCELLED'

          const isSuccess = backendHasDecision
            ? callbackData?.success === true || callbackStatus === 'COMPLETED'
            : redirectStatus === '1'

          const isFailed = backendHasDecision
            ? callbackData?.success === false || callbackStatus === 'FAILED'
            : redirectStatus === '2'

          const isCancelled =
            callbackStatus === 'CANCELLED' ||
            (!isSuccess && !isFailed && redirectStatus === '2')

          const baseTransactionInfo = extractZaloPayTransactionInfo(queryParams)
          const transactionInfo = callbackData?.transactionRef
            ? {
                ...baseTransactionInfo,
                transactionRef: callbackData.transactionRef,
              }
            : baseTransactionInfo

          if (isSuccess) {
            const successMessage =
              getSuccessMessageByPaymentType(detectedPaymentType)

            setResult({
              status: 'success',
              message: successMessage,
              details: callbackData,
              transactionInfo,
            })
            await deleteDraftAfterSuccessfulListingPayment(
              detectedPaymentType,
              storedListing,
            )
            clearPendingPaymentStorage()
            return
          }

          if (isFailed) {
            setResult({
              status: 'failed',
              message: normalizeFailedMessage(
                callbackData?.message || callbackResponse.message,
              ),
              details: callbackData,
              transactionInfo,
            })
            clearPendingPaymentStorage()
            return
          }

          setResult({
            status: isCancelled ? 'cancelled' : 'failed',
            message: isCancelled
              ? t('cancelled.message')
              : normalizeFailedMessage(
                  callbackData?.message || callbackResponse.message,
                ),
            details: callbackData,
            transactionInfo,
          })
          clearPendingPaymentStorage()
          return
        }

        setResult({
          status: 'failed',
          message: t('failed.invalidData'),
        })
        clearPendingPaymentStorage()
      } catch (error) {
        console.error('Payment result processing error:', error)
        setResult({
          status: 'failed',
          message: normalizeErrorFromException(error),
        })
        clearPendingPaymentStorage()
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
                <h2 className='text-2xl font-bold text-foreground mb-2'>
                  {t('processing.title')}
                </h2>
                <p className='text-muted-foreground'>{result.message}</p>
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
                          <h3 className='text-xl font-bold text-foreground'>
                            {t('sections.vipListing.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          {listingInfo.title && (
                            <div className='flex items-start justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Package className='w-5 h-5 text-purple-600' />
                                <span className='text-muted-foreground font-medium'>
                                  {t('sections.vipListing.listingTitle')}
                                </span>
                              </div>
                              <span className='font-semibold text-foreground text-right max-w-[60%]'>
                                {listingInfo.title}
                              </span>
                            </div>
                          )}

                          {listingInfo.vipType && (
                            <div className='flex items-center justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Sparkles className='w-5 h-5 text-purple-600' />
                                <span className='text-muted-foreground font-medium'>
                                  {t('sections.vipListing.vipTier')}
                                </span>
                              </div>
                              <span className='font-semibold text-foreground'>
                                {listingInfo.vipType}
                              </span>
                            </div>
                          )}

                          {listingInfo.durationDays && (
                            <div className='flex items-center justify-between py-2 border-b border-purple-200'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-5 h-5 text-purple-600' />
                                <span className='text-muted-foreground font-medium'>
                                  {t('sections.vipListing.duration')}
                                </span>
                              </div>
                              <span className='font-semibold text-foreground'>
                                {listingInfo.durationDays}{' '}
                                {t('sections.vipListing.durationDays')}
                              </span>
                            </div>
                          )}

                          {result.transactionInfo && (
                            <div className='flex items-center justify-between py-2'>
                              <div className='flex items-center gap-2'>
                                <CreditCard className='w-5 h-5 text-purple-600' />
                                <span className='text-muted-foreground font-medium'>
                                  {t('sections.vipListing.amountPaid')}
                                </span>
                              </div>
                              <span className='font-bold text-xl text-foreground'>
                                {result.transactionInfo.amount.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                VND
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='mt-6 pt-6 border-t border-purple-200'>
                          <p className='text-sm text-muted-foreground'>
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
                          <h3 className='text-xl font-bold text-foreground'>
                            {t('sections.membership.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          <div className='flex items-center justify-between py-2 border-b border-blue-200'>
                            <div className='flex items-center gap-2'>
                              <Package className='w-5 h-5 text-blue-600' />
                              <span className='text-muted-foreground font-medium'>
                                {t('sections.membership.package')}
                              </span>
                            </div>
                            <span className='font-semibold text-foreground'>
                              {membershipInfo.packageName}
                            </span>
                          </div>

                          <div className='flex items-center justify-between py-2 border-b border-blue-200'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='w-5 h-5 text-blue-600' />
                              <span className='text-muted-foreground font-medium'>
                                {t('sections.membership.duration')}
                              </span>
                            </div>
                            <span className='font-semibold text-foreground'>
                              {membershipInfo.durationMonths}{' '}
                              {membershipInfo.durationMonths === 1
                                ? t('sections.membership.month')
                                : t('sections.membership.months')}
                            </span>
                          </div>

                          <div className='flex items-center justify-between py-2'>
                            <div className='flex items-center gap-2'>
                              <CreditCard className='w-5 h-5 text-blue-600' />
                              <span className='text-muted-foreground font-medium'>
                                {t('sections.membership.amountPaid')}
                              </span>
                            </div>
                            <div className='text-right'>
                              <span className='font-bold text-xl text-foreground'>
                                {membershipInfo.salePrice.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                VND
                              </span>
                              {membershipInfo.discountPercentage > 0 && (
                                <div className='flex items-center gap-2 justify-end'>
                                  <span className='text-sm text-muted-foreground line-through'>
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
                              <h4 className='font-semibold text-foreground mb-3 flex items-center gap-2'>
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
                                    <span className='text-foreground'>
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
                          'bg-muted/40 border-border',
                        result.status === 'failed' &&
                          'bg-red-50 border-red-200',
                        result.status === 'cancelled' &&
                          'bg-amber-50 border-amber-200',
                      )}
                    >
                      <h3 className='font-semibold text-foreground mb-4 flex items-center gap-2'>
                        <Hash className='w-5 h-5 text-muted-foreground' />
                        {t('sections.transaction.title')}
                      </h3>

                      <div className='space-y-3 text-sm'>
                        <div className='flex justify-between items-center py-2 border-b border-border'>
                          <span className='text-muted-foreground'>
                            {t('sections.transaction.amount')}
                          </span>
                          <span className='font-bold text-foreground'>
                            {result.transactionInfo.amount.toLocaleString(
                              'vi-VN',
                            )}{' '}
                            VND
                          </span>
                        </div>

                        {result.transactionInfo.bankCode && (
                          <div className='flex justify-between items-center py-2 border-b border-border'>
                            <span className='text-muted-foreground'>
                              {t('sections.transaction.bank')}
                            </span>
                            <span className='font-semibold text-foreground uppercase'>
                              {result.transactionInfo.bankCode}
                            </span>
                          </div>
                        )}

                        {result.transactionInfo.transactionNo && (
                          <div className='flex justify-between items-center py-2 border-b border-border'>
                            <span className='text-muted-foreground'>
                              {t('sections.transaction.vnpayTxnNo')}
                            </span>
                            <span className='font-mono font-semibold text-foreground text-xs'>
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
                          className='flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl transition-all duration-300'
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
                          className='flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl transition-all duration-300'
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

PaymentResultPage.getLayout = function getLayout(page: React.ReactNode) {
  return <MainLayout>{page}</MainLayout>
}

export default PaymentResultPage
