export type StatusType =
  | 'active'
  | 'expired'
  | 'expiring'
  | 'pending'
  | 'review'
  | 'payment'
  | 'rejected'
  | 'archived'

export interface StatusConfig {
  labelKey: string
  className: string
}

export const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  active: {
    labelKey: 'components.statusBadge.active',
    className:
      'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700',
  },
  expired: {
    labelKey: 'components.statusBadge.expired',
    className:
      'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700',
  },
  expiring: {
    labelKey: 'components.statusBadge.expiring',
    className:
      'bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700',
  },
  pending: {
    labelKey: 'components.statusBadge.pending',
    className:
      'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
  },
  review: {
    labelKey: 'components.statusBadge.review',
    className:
      'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
  },
  payment: {
    labelKey: 'components.statusBadge.payment',
    className:
      'bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700',
  },
  rejected: {
    labelKey: 'components.statusBadge.rejected',
    className:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
  },
  archived: {
    labelKey: 'components.statusBadge.archived',
    className:
      'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700',
  },
}

export const STATUS_BADGE_STYLES = {
  base: 'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-default shadow-sm hover:shadow-md hover:scale-105 active:scale-95',
  pulse: 'animate-pulse',
  glow: 'shadow-lg shadow-current/20',
} as const

export const STATUS_ICONS = {
  active: '●',
  expired: '⚠',
  expiring: '⏰',
  pending: '⏳',
  review: '👁',
  payment: '💰',
  rejected: '❌',
  archived: '📦',
} as const
