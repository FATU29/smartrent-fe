import { formatDistanceToNow, format } from 'date-fns'
import type { NewsCategory } from '@/api/types/news.type'

/**
 * Format a published date string to a human-readable format.
 * Shows relative time (e.g. "3 days ago") for dates within the last 7 days,
 * otherwise shows dd/MM/yyyy format.
 */
export const formatPublishedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (diffDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

/**
 * Format a view count number to a compact human-readable string.
 * e.g. 1500 -> "1.5K", 2000000 -> "2.0M"
 */
export const formatViewCount = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`
  }
  return count.toString()
}

export interface CategoryConfig {
  label: string
  className: string
}

/**
 * Get display config (label + CSS class) for a news category.
 * @param category - The category key (e.g. "NEWS", "BLOG")
 * @param tCategories - i18n translation function for category labels
 */
export const getCategoryConfig = (
  category: NewsCategory | string,
  tCategories: (key: string) => string,
): CategoryConfig => {
  const configs: Record<string, CategoryConfig> = {
    NEWS: {
      label: tCategories('news'),
      className: 'bg-blue-500 text-white border-blue-500',
    },
    BLOG: {
      label: tCategories('blog'),
      className: 'bg-violet-500 text-white border-violet-500',
    },
    MARKET_TREND: {
      label: tCategories('marketTrend'),
      className: 'bg-amber-500 text-white border-amber-500',
    },
    GUIDE: {
      label: tCategories('guide'),
      className: 'bg-emerald-500 text-white border-emerald-500',
    },
    ANNOUNCEMENT: {
      label: tCategories('announcement'),
      className: 'bg-red-500 text-white border-red-500',
    },
  }
  return configs[category] || configs.NEWS
}
