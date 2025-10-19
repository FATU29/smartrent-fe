import React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  RANK_DISPLAY_STYLES,
  RANK_DISPLAY_TRANSLATIONS,
} from './index.constants'

export interface RankDisplayProps {
  rank: {
    page: number
    position: number
  }
  className?: string
}

export const RankDisplay: React.FC<RankDisplayProps> = ({
  rank,
  className,
}) => {
  const t = useTranslations()

  return (
    <div className={cn(RANK_DISPLAY_STYLES.container, className)}>
      <span className={RANK_DISPLAY_STYLES.pageLabel}>
        {t(RANK_DISPLAY_TRANSLATIONS.page, { page: rank.page })}
      </span>
      <span className={RANK_DISPLAY_STYLES.positionLabel}>
        {t(RANK_DISPLAY_TRANSLATIONS.position, { position: rank.position })}
      </span>
      <div className={RANK_DISPLAY_STYLES.progressContainer}>
        {/* Progress bar visualization */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              RANK_DISPLAY_STYLES.progressDot,
              i < rank.position
                ? RANK_DISPLAY_STYLES.progressDotActive
                : RANK_DISPLAY_STYLES.progressDotInactive,
            )}
          />
        ))}
      </div>
    </div>
  )
}
