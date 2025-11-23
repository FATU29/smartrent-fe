export type PackageType = 'NORMAL' | 'SILVER' | 'GOLD' | 'DIAMOND'

export interface PackageConfig {
  labelKey: string
  className: string
  badgeLabel: string
  color: string
  icon: string
}

export const PACKAGE_CONFIG: Record<PackageType, PackageConfig> = {
  NORMAL: {
    labelKey: 'components.packageBadge.normal',
    className:
      'bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-800',
    badgeLabel: 'Tin Thường',
    color: 'gray',
    icon: '📝',
  },
  SILVER: {
    labelKey: 'components.packageBadge.vipSilver',
    className:
      'bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700',
    badgeLabel: 'VIP BẠC',
    color: 'blue',
    icon: '⭐',
  },
  GOLD: {
    labelKey: 'components.packageBadge.vipGold',
    className:
      'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
    badgeLabel: 'VIP VÀNG',
    color: 'gold',
    icon: '👑',
  },
  DIAMOND: {
    labelKey: 'components.packageBadge.vipDiamond',
    className:
      'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
    badgeLabel: 'VIP KIM CƯƠNG',
    color: 'red',
    icon: '💎',
  },
}

export const PACKAGE_BADGE_STYLES = {
  base: 'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-default shadow-md hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm',
  gradient: 'bg-gradient-to-r',
  shimmer:
    'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000',
} as const

export const PACKAGE_ICONS = {
  NORMAL: '�',
  SILVER: '⭐',
  GOLD: '�',
  DIAMOND: '�',
} as const

export const PACKAGE_PRIORITIES = {
  NORMAL: 1,
  SILVER: 2,
  GOLD: 3,
  DIAMOND: 4,
} as const
