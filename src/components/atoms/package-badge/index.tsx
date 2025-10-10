import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  PACKAGE_CONFIG,
  PACKAGE_BADGE_STYLES,
  PACKAGE_ICONS,
  PACKAGE_PRIORITIES,
  type PackageType,
} from './index.constants'

export interface PackageBadgeProps {
  packageType: PackageType
  className?: string
  showIcon?: boolean
  showShimmer?: boolean
}

export const PackageBadge: React.FC<PackageBadgeProps> = ({
  packageType,
  className,
  showIcon = true,
  showShimmer = false,
}) => {
  const t = useTranslations()
  const config = PACKAGE_CONFIG[packageType]
  const icon = PACKAGE_ICONS[packageType]
  const isVip = packageType.startsWith('vip_')

  return (
    <output
      className={cn(
        PACKAGE_BADGE_STYLES.base,
        config.className,
        isVip && showShimmer && PACKAGE_BADGE_STYLES.shimmer,
        className,
      )}
      aria-label={`${t(config.labelKey)} package`}
      data-priority={PACKAGE_PRIORITIES[packageType]}
    >
      {showIcon && (
        <span className='mr-1' aria-hidden='true'>
          {icon}
        </span>
      )}
      {t(config.labelKey)}
    </output>
  )
}
