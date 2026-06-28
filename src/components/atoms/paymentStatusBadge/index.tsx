import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/atoms/badge'
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_STATUS_STYLES,
  type PaymentStatusType,
} from './index.constants'

export interface PaymentStatusBadgeProps {
  status: PaymentStatusType | string
  className?: string
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const t = useTranslations()

  const normalizedStatus = (status?.toUpperCase() ||
    'UNKNOWN') as PaymentStatusType
  const config =
    PAYMENT_STATUS_CONFIG[normalizedStatus] || PAYMENT_STATUS_CONFIG.UNKNOWN

  return (
    <Badge
      variant='outline'
      className={cn(PAYMENT_STATUS_STYLES.badge, config.className, className)}
      role='status'
      aria-label={t(config.labelKey)}
    >
      {t(config.labelKey)}
    </Badge>
  )
}

export default PaymentStatusBadge
