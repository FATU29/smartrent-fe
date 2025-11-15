import React from 'react'
import { useTranslations } from 'next-intl'
import type { PaymentStatusType } from '@/components/atoms/paymentStatusBadge/index.constants'

interface StatusDescriptionProps {
  status: PaymentStatusType | string
}

/**
 * Helper component to display status description
 * Extracted to reduce duplication in PaymentStatusCard
 */
export const StatusDescription: React.FC<StatusDescriptionProps> = ({
  status,
}) => {
  const t = useTranslations('paymentStatusPage')

  // Map of statuses to their i18n keys
  const statusMap: Record<string, string> = {
    COMPLETED: 'completed',
    PENDING: 'pending',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    UNKNOWN: 'unknown',
  }

  const normalizedStatus = status?.toUpperCase()
  const stateKey = statusMap[normalizedStatus] || 'unknown'

  return (
    <>
      <div className='font-medium text-sm sm:text-base'>
        {t(`states.${stateKey}.title`)}
      </div>
      <div className='text-xs sm:text-sm text-muted-foreground'>
        {t(`states.${stateKey}.desc`)}
      </div>
    </>
  )
}
