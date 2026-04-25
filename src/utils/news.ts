import { formatDistanceToNow, format } from 'date-fns'
import type { NewsCategory } from '@/api/types/news.type'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const NUMERIC_ID_PATTERN = /^\d{6,}$/
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i

const looksLikeIdentifier = (value: string): boolean => {
  const normalized = value.trim()
  return (
    UUID_PATTERN.test(normalized) ||
    NUMERIC_ID_PATTERN.test(normalized) ||
    OBJECT_ID_PATTERN.test(normalized)
  )
}

export const formatAuthorDisplayName = (
  authorName: string | null | undefined,
  fallback: string,
): string => {
  if (!authorName) return fallback
  const trimmed = authorName.trim()
  if (!trimmed || looksLikeIdentifier(trimmed)) {
    return fallback
  }
  return trimmed
}

/**
 * Format a published date string to a human-readable format.
 * Shows relative time (e.g. "3 days ago") for dates within the last 7 days,
 * otherwise shows dd/MM/yyyy format.
 */
export const formatPublishedDate = (dateString: string | null): string => {
  if (!dateString) return ''
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
      className:
        'bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600',
    },
    BLOG: {
      label: tCategories('blog'),
      className:
        'bg-violet-500 text-white border-violet-500 dark:bg-violet-600 dark:border-violet-600',
    },
    POLICY: {
      label: tCategories('policy'),
      className:
        'bg-orange-500 text-white border-orange-500 dark:bg-orange-600 dark:border-orange-600',
    },
    MARKET: {
      label: tCategories('market'),
      className:
        'bg-amber-500 text-white border-amber-500 dark:bg-amber-600 dark:border-amber-600',
    },
    PROJECT: {
      label: tCategories('project'),
      className:
        'bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-700 dark:border-cyan-700',
    },
    INVESTMENT: {
      label: tCategories('investment'),
      className:
        'bg-pink-600 text-white border-pink-600 dark:bg-pink-700 dark:border-pink-700',
    },
    MARKET_TREND: {
      label: tCategories('market'),
      className:
        'bg-amber-500 text-white border-amber-500 dark:bg-amber-600 dark:border-amber-600',
    },
    GUIDE: {
      label: tCategories('guide'),
      className:
        'bg-emerald-500 text-white border-emerald-500 dark:bg-emerald-600 dark:border-emerald-600',
    },
    ANNOUNCEMENT: {
      label: tCategories('news'),
      className:
        'bg-red-500 text-white border-red-500 dark:bg-red-600 dark:border-red-600',
    },
  }
  return configs[category] || configs.NEWS
}
