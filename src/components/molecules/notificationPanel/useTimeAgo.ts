import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

/**
 * Format an ISO 8601 timestamp into a human-readable relative time string.
 * Uses notification.* translations.
 */
export function useTimeAgo(isoDate: string): string {
  const t = useTranslations('notification')

  return useMemo(() => {
    const now = Date.now()
    const date = new Date(isoDate).getTime()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMinutes < 1) return t('justNow')
    if (diffMinutes < 60) return t('minutesAgo', { count: diffMinutes })
    if (diffHours < 24) return t('hoursAgo', { count: diffHours })
    return t('daysAgo', { count: diffDays })
  }, [isoDate, t])
}
