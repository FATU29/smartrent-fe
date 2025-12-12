import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/atoms/card'
import { PaymentStatusBadge } from '@/components/atoms/paymentStatusBadge'
import type { PaymentStatusType } from '@/components/atoms/paymentStatusBadge/index.constants'
import { StatusDescription } from './StatusDescription'

export interface PaymentStatusCardProps {
  transactionRef: string
  status: PaymentStatusType | string
  isLoading?: boolean
  isFetching?: boolean
  className?: string
  productInfo?: React.ReactNode
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = React.memo(
  ({
    transactionRef,
    status,
    isLoading = false,
    isFetching = false,
    className,
    productInfo,
  }) => {
    const t = useTranslations('paymentStatusPage')
    const isPolling = useMemo(
      () => isLoading || isFetching,
      [isLoading, isFetching],
    )

    return (
      <Card className={`${className} transition-all duration-300 ease-in-out`}>
        <CardHeader className='transition-all duration-300 ease-in-out'>
          <div className='space-y-1.5'>
            <CardTitle className='text-base sm:text-lg transition-opacity duration-300'>
              {t('labels.transactionRef')}
            </CardTitle>
            <CardDescription className='font-mono text-xs sm:text-sm break-all transition-opacity duration-300'>
              {transactionRef}
            </CardDescription>
          </div>
          <CardAction className='transition-all duration-300 ease-in-out'>
            <PaymentStatusBadge status={status} />
          </CardAction>
        </CardHeader>

        <CardContent className='space-y-4 pt-4 transition-all duration-300 ease-in-out'>
          {/* Product/Order Info */}
          {productInfo && (
            <div className='rounded-lg border bg-muted/10 p-3 sm:p-4 transition-opacity duration-300'>
              {productInfo}
            </div>
          )}

          {/* Status Description */}
          <div className='rounded-lg border bg-muted/20 p-3 sm:p-4 space-y-2 transition-all duration-300 ease-in-out'>
            <StatusDescription status={status} isPolling={isPolling} />
          </div>
        </CardContent>
      </Card>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.transactionRef === nextProps.transactionRef &&
      prevProps.status === nextProps.status &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isFetching === nextProps.isFetching &&
      prevProps.className === nextProps.className &&
      prevProps.productInfo === nextProps.productInfo
    )
  },
)

PaymentStatusCard.displayName = 'PaymentStatusCard'

export default PaymentStatusCard
