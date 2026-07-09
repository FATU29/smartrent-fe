import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  STATUS_CONFIG,
  STATUS_BADGE_STYLES,
  STATUS_ICONS,
  type StatusType,
} from './index.constants'

export interface StatusBadgeProps {
  status: StatusType
  className?: string
  showIcon?: boolean
  animate?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  animate = false,
}) => {
  const t = useTranslations()
  const config = STATUS_CONFIG[status]
  const Icon = STATUS_ICONS[status]

  return (
    <span
      className={cn(
        STATUS_BADGE_STYLES.base,
        config.className,
        animate && status === 'expiring' && STATUS_BADGE_STYLES.pulse,
        (status === 'active' || status === 'expiring') &&
          STATUS_BADGE_STYLES.glow,
        className,
      )}
      role='status'
      aria-label={t(config.labelKey)}
    >
      {showIcon && <Icon className='mr-1 size-3.5' aria-hidden='true' />}
      {t(config.labelKey)}
    </span>
  )
}
