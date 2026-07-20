import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PaymentService, ListingService } from '@/api/services'
import MainLayout from '@/components/layouts/homePageLayout'
import type { NextPageWithLayout } from '@/types/next-page'
import {
  clearPendingTransactionRef,
  getPendingTransactionRef,
} from '@/utils/payment'
import type {
  PaymentCallbackResponse,
  PaymentTransaction,
} from '@/api/types/payment.type'
import {
  PAYMENT_STATUS,
  PENDING_SELLER_LISTING_ACTION_KEY,
  SEPAY_CONFIG,
} from '@/constants/payment'

/**
 * Transaction details for the result page — built either from a redirect-
 * provider callback (ZaloPay) or from the polled transaction (SePay hosted
 * checkout, which redirects back here with ?status=success|error|cancel).
 */
interface PaymentTransactionInfo {
  transactionRef: string
  amount: number
  responseCode: string
  transactionStatus: string
  transactionNo: string
  bankCode: string
  payDate: string
  orderInfo: string
}
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
import { Typography } from '@/components/atoms/typography'

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled'

interface PaymentResultState {
  status: PaymentStatus
  message: string
  details?: PaymentCallbackResponse
  transactionInfo?: PaymentTransactionInfo
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

type PaymentType = 'membership' | 'membershipUpgrade' | 'listing' | 'pushRepost'

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
    let cancelled = false

    const clearPendingPaymentStorage = () => {
      sessionStorage.removeItem('pendingMembership')
      sessionStorage.removeItem('pendingMembershipUpgrade')
      sessionStorage.removeItem('pendingListingCreation')
      sessionStorage.removeItem(PENDING_SELLER_LISTING_ACTION_KEY)
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

      if (type === 'pushRepost') {
        return t('success.messagePushRepost')
      }

      return t('success.messageDefault')
    }

    // Only match parameters that are unique to ZaloPay's redirect. SePay
    // returns with a bare `?status=success|error|cancel` (and may carry a
    // generic `bankcode`), so neither `status` nor `bankcode` can be used to
    // discriminate — including them here misclassifies every SePay return as a
    // ZaloPay callback and fires a bogus ZALOPAY callback request.
    const isZaloPayCallback = (params: URLSearchParams) =>
      [
        'apptransid',
        'checksum',
        'appid',
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

    const buildSePayTransactionInfo = (
      txn: PaymentTransaction | null,
      fallbackRef: string,
    ): PaymentTransactionInfo => ({
      transactionRef: txn?.transactionRef || fallbackRef,
      amount: typeof txn?.amount === 'number' ? txn.amount : 0,
      responseCode: txn?.responseCode || '',
      transactionStatus: txn?.status ? String(txn.status) : '',
      transactionNo: txn?.providerTransactionId || '',
      bankCode: txn?.bankCode || txn?.paymentMethod || 'SEPAY',
      payDate: txn?.paymentDate || '',
      orderInfo: txn?.orderInfo || '',
    })

    // The IPN is the source of truth, so don't trust the redirect's status
    // param — poll the transaction until it leaves PENDING (or the window ends).
    const pollSePayTransaction = async (
      ref: string,
    ): Promise<PaymentTransaction | null> => {
      const maxAttempts = 40 // ~2 min at the SePay poll interval
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelled) return null
        try {
          const res = await PaymentService.getTransaction(ref)
          const txn = res.data ?? null
          const status = txn?.status ? String(txn.status).toUpperCase() : ''
          if (status && status !== PAYMENT_STATUS.PENDING) {
            return txn
          }
        } catch (error) {
          // Transient errors are expected while the IPN is in flight — keep polling.
          console.error('SePay transaction poll error:', error)
        }
        await new Promise((resolve) =>
          setTimeout(resolve, SEPAY_CONFIG.POLL_INTERVAL),
        )
      }
      return null
    }

    const processSePayResult = async (
      isCancelStatus: boolean,
      type: PaymentType | null,
      storedListingRaw: string | null,
    ) => {
      // The user cancelled on the hosted page — there is no payment to confirm.
      if (isCancelStatus) {
        setResult({ status: 'cancelled', message: t('cancelled.message') })
        clearPendingPaymentStorage()
        return
      }

      const ref = getPendingTransactionRef()
      if (!ref) {
        setResult({ status: 'failed', message: t('failed.invalidData') })
        clearPendingPaymentStorage()
        return
      }

      const txn = await pollSePayTransaction(ref)
      if (cancelled) return

      const status = txn?.status ? String(txn.status).toUpperCase() : ''
      const transactionInfo = buildSePayTransactionInfo(txn, ref)

      if (status === PAYMENT_STATUS.COMPLETED) {
        setResult({
          status: 'success',
          message: getSuccessMessageByPaymentType(type),
          transactionInfo,
        })
        await deleteDraftAfterSuccessfulListingPayment(type, storedListingRaw)
        clearPendingPaymentStorage()
        return
      }

      if (status === PAYMENT_STATUS.CANCELLED) {
        setResult({
          status: 'cancelled',
          message: t('cancelled.message'),
          transactionInfo,
        })
        clearPendingPaymentStorage()
        return
      }

      // FAILED, or still PENDING after the polling window elapsed.
      setResult({
        status: 'failed',
        message: t('failed.errorProcessing'),
        transactionInfo,
      })
      clearPendingPaymentStorage()
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

    // Push/repost leave only a lightweight marker so the success button routes
    // back to the seller's listings.
    if (
      !detectedPaymentType &&
      sessionStorage.getItem(PENDING_SELLER_LISTING_ACTION_KEY)
    ) {
      detectedPaymentType = 'pushRepost'
      setMembershipInfo(null)
      setListingInfo(null)
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

        // SePay Payment Gateway redirects back here with ?status=success|error|
        // cancel. Confirm via polling (the IPN is the source of truth), not the
        // redirect param alone.
        const sePayStatus = queryParams.get('status')
        const isCancelStatus = sePayStatus === 'cancel'
        const isSePayReturn =
          isCancelStatus ||
          sePayStatus === 'success' ||
          sePayStatus === 'error' ||
          !!getPendingTransactionRef()

        if (isSePayReturn) {
          await processSePayResult(
            isCancelStatus,
            detectedPaymentType,
            storedListing,
          )
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

    return () => {
      // Stop any in-flight SePay polling when the page unmounts.
      cancelled = true
    }
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
    <div className='min-h-screen bg-gradient-to-br from-background via-muted/40 to-primary/5 flex items-center justify-center p-4'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={result.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-2xl'
        >
          <div className='bg-card rounded-2xl shadow-2xl overflow-hidden'>
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
                    className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full'
                  />
                </div>
                <Typography
                  variant='pageTitle'
                  className='text-foreground mb-2'
                >
                  {t('processing.title')}
                </Typography>
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

                  {/* Animated success/failure hero on a colored gradient
                      banner — framer-motion props attach to the heading
                      element directly, so this stays as motion.h1 with
                      explicit sizing rather than routed through Typography. */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    // eslint-disable-next-line design-system/no-inline-heading-sizes
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
                        className='mb-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20'
                      >
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='flex items-center justify-center w-10 h-10 bg-primary rounded-lg'>
                            <Sparkles className='w-6 h-6 text-primary-foreground' />
                          </div>
                          <h3 className='text-xl font-bold text-foreground'>
                            {t('sections.vipListing.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          {listingInfo.title && (
                            <div className='flex items-start justify-between py-2 border-b border-primary/20'>
                              <div className='flex items-center gap-2'>
                                <Package className='w-5 h-5 text-primary' />
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
                            <div className='flex items-center justify-between py-2 border-b border-primary/20'>
                              <div className='flex items-center gap-2'>
                                <Sparkles className='w-5 h-5 text-primary' />
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
                            <div className='flex items-center justify-between py-2 border-b border-primary/20'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='w-5 h-5 text-primary' />
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
                                <CreditCard className='w-5 h-5 text-primary' />
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

                        <div className='mt-6 pt-6 border-t border-primary/20'>
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
                        className='mb-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20'
                      >
                        <div className='flex items-center gap-3 mb-4'>
                          <div className='flex items-center justify-center w-10 h-10 bg-primary rounded-lg'>
                            <Sparkles className='w-6 h-6 text-primary-foreground' />
                          </div>
                          <h3 className='text-xl font-bold text-foreground'>
                            {t('sections.membership.title')}
                          </h3>
                        </div>

                        <div className='space-y-3'>
                          <div className='flex items-center justify-between py-2 border-b border-primary/20'>
                            <div className='flex items-center gap-2'>
                              <Package className='w-5 h-5 text-primary' />
                              <span className='text-muted-foreground font-medium'>
                                {t('sections.membership.package')}
                              </span>
                            </div>
                            <span className='font-semibold text-foreground'>
                              {membershipInfo.packageName}
                            </span>
                          </div>

                          <div className='flex items-center justify-between py-2 border-b border-primary/20'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='w-5 h-5 text-primary' />
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
                              <CreditCard className='w-5 h-5 text-primary' />
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
                                  <span className='text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded dark:text-green-400 dark:bg-green-500/15'>
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
                            <div className='mt-6 pt-6 border-t border-primary/20'>
                              <h4 className='font-semibold text-foreground mb-3 flex items-center gap-2'>
                                <Sparkles className='w-4 h-4 text-primary' />
                                {t('sections.membership.benefitsTitle')}
                              </h4>
                              <ul className='space-y-2'>
                                {membershipInfo.benefits.map((benefit) => (
                                  <li
                                    key={benefit.benefitId}
                                    className='flex items-start gap-2 text-sm'
                                  >
                                    <Check className='w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0' />
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
                          'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
                        result.status === 'cancelled' &&
                          'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
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
                          <div className='flex justify-between items-center py-2 bg-red-100 rounded-lg px-3 -mx-3 mt-3 dark:bg-red-500/15'>
                            <span className='text-red-700 font-medium dark:text-red-300'>
                              {t('sections.transaction.errorCode')}
                            </span>
                            <span className='font-mono font-bold text-red-900 dark:text-red-200'>
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
                            // Listings flows (VIP post, push, repost) go back to
                            // the seller's listings; everything else to the dashboard.
                            if (
                              paymentType === 'listing' ||
                              paymentType === 'pushRepost'
                            ) {
                              window.location.href = '/seller/listings'
                            } else {
                              window.location.href = '/seller/dashboard'
                            }
                          }}
                          className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        >
                          {paymentType === 'listing' ||
                          paymentType === 'pushRepost'
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
                        {paymentType === 'listing' && listingInfo?.draftId && (
                          <button
                            onClick={() =>
                              (window.location.href = `/seller/create-post?draftId=${listingInfo.draftId}`)
                            }
                            className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          >
                            {t('actions.backToListingDraft')}
                            <ArrowRight className='w-5 h-5' />
                          </button>
                        )}
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
