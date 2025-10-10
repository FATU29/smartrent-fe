import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  VERIFICATION_CONFIG,
  VERIFICATION_BADGE_STYLES,
  type VerificationType,
} from './index.constants'

export interface VerificationBadgeProps {
  verified?: boolean
  type?: VerificationType
  className?: string
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified = false,
  type = 'verified',
  className,
}) => {
  const t = useTranslations()

  if (!verified) return null

  const config = VERIFICATION_CONFIG[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        VERIFICATION_BADGE_STYLES.base,
        config.className,
        className,
      )}
    >
      <Icon className={VERIFICATION_BADGE_STYLES.icon} />
      <span>{t(config.labelKey)}</span>
    </div>
  )
}
