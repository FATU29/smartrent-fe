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
  showIcon?: boolean
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const t = useTranslations()

  // Normalize status to PaymentStatusType
  const normalizedStatus = (status?.toUpperCase() ||
    'UNKNOWN') as PaymentStatusType
  const config =
    PAYMENT_STATUS_CONFIG[normalizedStatus] || PAYMENT_STATUS_CONFIG.UNKNOWN

  return (
    <Badge
      variant={config.variant}
      className={cn(PAYMENT_STATUS_STYLES.badge, className)}
      role='status'
      aria-label={t(config.labelKey)}
    >
      {showIcon && (
        <span className={PAYMENT_STATUS_STYLES.icon} aria-hidden='true'>
          {config.icon}
        </span>
      )}
      {t(config.labelKey)}
    </Badge>
  )
}

export default PaymentStatusBadge
