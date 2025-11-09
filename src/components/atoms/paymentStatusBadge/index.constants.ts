export type PaymentStatusType =
  | 'COMPLETED'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'UNKNOWN'

export interface PaymentStatusConfig {
  labelKey: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: string
}

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatusType,
  PaymentStatusConfig
> = {
  COMPLETED: {
    labelKey: 'components.paymentStatusBadge.completed',
    variant: 'default',
    icon: '✓',
  },
  PENDING: {
    labelKey: 'components.paymentStatusBadge.pending',
    variant: 'secondary',
    icon: '⏳',
  },
  FAILED: {
    labelKey: 'components.paymentStatusBadge.failed',
    variant: 'destructive',
    icon: '✕',
  },
  CANCELLED: {
    labelKey: 'components.paymentStatusBadge.cancelled',
    variant: 'outline',
    icon: '⊘',
  },
  REFUNDED: {
    labelKey: 'components.paymentStatusBadge.refunded',
    variant: 'secondary',
    icon: '↩',
  },
  UNKNOWN: {
    labelKey: 'components.paymentStatusBadge.unknown',
    variant: 'outline',
    icon: '?',
  },
}

export const PAYMENT_STATUS_STYLES = {
  badge: 'px-2.5 py-1.5 text-xs font-medium',
  icon: 'mr-1',
} as const
