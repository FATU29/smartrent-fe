import React from 'react'
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
  message?: string | null
  isLoading?: boolean
  className?: string
  productInfo?: React.ReactNode
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  transactionRef,
  status,
  message,
  isLoading = false,
  className,
  productInfo,
}) => {
  const t = useTranslations('paymentStatusPage')

  return (
    <Card className={className}>
      <CardHeader>
        <div className='space-y-1.5'>
          <CardTitle className='text-base sm:text-lg'>
            {t('labels.transactionRef')}
          </CardTitle>
          <CardDescription className='font-mono text-xs sm:text-sm break-all'>
            {transactionRef}
          </CardDescription>
        </div>
        <CardAction>
          <PaymentStatusBadge status={status} />
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4 pt-4'>
        {/* Product/Order Info */}
        {productInfo && (
          <div className='rounded-lg border bg-muted/10 p-3 sm:p-4'>
            {productInfo}
          </div>
        )}

        {/* Status Description */}
        <div className='rounded-lg border bg-muted/20 p-3 sm:p-4 space-y-2'>
          <StatusDescription status={status} />

          {isLoading && (
            <div className='text-xs text-muted-foreground pt-2'>
              {t('labels.checking')} …
            </div>
          )}
        </div>

        {message && (
          <div className='text-xs sm:text-sm text-muted-foreground px-1'>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentStatusCard
