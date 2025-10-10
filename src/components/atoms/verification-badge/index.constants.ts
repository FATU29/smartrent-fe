import { CheckCircle, Star } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export type VerificationType = 'verified' | 'premium' | 'boosted'

export interface VerificationConfig {
  icon: LucideIcon
  labelKey: string
  className: string
}

export const VERIFICATION_CONFIG: Record<VerificationType, VerificationConfig> =
  {
    verified: {
      icon: CheckCircle,
      labelKey: 'components.verificationBadge.verified',
      className:
        'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
    },
    premium: {
      icon: Star,
      labelKey: 'components.verificationBadge.premium',
      className:
        'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700',
    },
    boosted: {
      icon: Star,
      labelKey: 'components.verificationBadge.boosted',
      className:
        'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700',
    },
  }

export const VERIFICATION_BADGE_STYLES = {
  base: 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors duration-200',
  icon: 'w-3 h-3',
} as const
