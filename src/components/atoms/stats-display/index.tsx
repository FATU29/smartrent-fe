import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  STATS_ITEMS,
  STATS_DISPLAY_STYLES,
  STATS_ANIMATIONS,
  formatStatValue,
} from './index.constants'

export interface StatsDisplayProps {
  stats: {
    views: number
    contacts: number
    customers: number
  }
  className?: string
  animated?: boolean
  compact?: boolean
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  className,
  animated = false,
  compact = false,
}) => {
  const t = useTranslations()

  return (
    <div
      className={cn(
        STATS_DISPLAY_STYLES.container,
        animated && STATS_ANIMATIONS.fadeIn,
        className,
      )}
    >
      {STATS_ITEMS.map((item, index) => {
        const Icon = item.icon
        const value = stats[item.key]
        const displayValue = compact
          ? formatStatValue(value)
          : value.toLocaleString()

        return (
          <div
            key={item.key}
            className={cn(
              STATS_DISPLAY_STYLES.item,
              animated && STATS_ANIMATIONS.slideUp,
            )}
            style={
              animated ? { animationDelay: `${index * 100}ms` } : undefined
            }
            title={`${t(item.labelKey)}: ${value.toLocaleString()}`}
          >
            <div
              className={cn(STATS_DISPLAY_STYLES.iconContainer, item.bgColor)}
            >
              <Icon className={cn(STATS_DISPLAY_STYLES.icon, item.textColor)} />
            </div>
            <span className={STATS_DISPLAY_STYLES.label}>
              {t(item.labelKey)}
            </span>
            <span className={STATS_DISPLAY_STYLES.value}>{displayValue}</span>
          </div>
        )
      })}
    </div>
  )
}
