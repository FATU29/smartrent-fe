export type PaymentStatusType =
  | 'COMPLETED'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'UNKNOWN'

export interface PaymentStatusConfig {
  labelKey: string
  className: string
}

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatusType,
  PaymentStatusConfig
> = {
  COMPLETED: {
    labelKey: 'components.paymentStatusBadge.completed',
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  PENDING: {
    labelKey: 'components.paymentStatusBadge.pending',
    className:
      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  FAILED: {
    labelKey: 'components.paymentStatusBadge.failed',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  CANCELLED: {
    labelKey: 'components.paymentStatusBadge.cancelled',
    className:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  },
  REFUNDED: {
    labelKey: 'components.paymentStatusBadge.refunded',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  UNKNOWN: {
    labelKey: 'components.paymentStatusBadge.unknown',
    className:
      'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700',
  },
}

export const PAYMENT_STATUS_STYLES = {
  badge: 'px-2.5 py-1.5 text-xs font-medium',
} as const
