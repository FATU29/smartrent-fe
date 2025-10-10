export type PackageType =
  | 'vip_diamond'
  | 'vip_gold'
  | 'vip_silver'
  | 'standard'
  | 'basic'

export interface PackageConfig {
  labelKey: string
  className: string
}

export const PACKAGE_CONFIG: Record<PackageType, PackageConfig> = {
  vip_diamond: {
    labelKey: 'components.packageBadge.vipDiamond',
    className:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
  },
  vip_gold: {
    labelKey: 'components.packageBadge.vipGold',
    className:
      'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
  },
  vip_silver: {
    labelKey: 'components.packageBadge.vipSilver',
    className:
      'bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-500 dark:hover:bg-gray-600',
  },
  standard: {
    labelKey: 'components.packageBadge.standard',
    className:
      'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
  },
  basic: {
    labelKey: 'components.packageBadge.basic',
    className:
      'bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-800',
  },
}

export const PACKAGE_BADGE_STYLES = {
  base: 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-default shadow-md hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm',
  gradient: 'bg-gradient-to-r',
  shimmer:
    'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000',
} as const

export const PACKAGE_ICONS = {
  vip_diamond: '💎',
  vip_gold: '👑',
  vip_silver: '⭐',
  standard: '📄',
  basic: '📝',
} as const

export const PACKAGE_PRIORITIES = {
  vip_diamond: 5,
  vip_gold: 4,
  vip_silver: 3,
  standard: 2,
  basic: 1,
} as const
