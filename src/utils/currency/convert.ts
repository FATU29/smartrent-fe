import { PRICE_UNIT_TRANSLATION_KEYS } from '@/utils/property'

// Simple static rate fallback; in real usage fetch from API and cache.
export const DEFAULT_VND_PER_USD = 24000

export interface ConvertCurrencyOptions {
  /** Custom exchange rate (VND per 1 USD). Overrides default. */
  vndPerUsd?: number
  /** Maximum fraction digits for USD output */
  maximumFractionDigits?: number
  /** Minimum fraction digits for USD output */
  minimumFractionDigits?: number
  /** Force locale (defaults to current browser / Intl) */
  locale?: string
}

/**
 * Convert a VND amount to USD and return numeric result.
 */
export const vndToUsdNumber = (
  vndAmount: number,
  { vndPerUsd = DEFAULT_VND_PER_USD }: ConvertCurrencyOptions = {},
): number => {
  if (!Number.isFinite(vndAmount) || vndAmount <= 0) return 0
  return vndAmount / vndPerUsd
}

/**
 * Format a VND amount into localized USD currency string (without symbol translation fallback).
 * Example: 120000 -> "$5" (depending on fraction settings).
 */
export const formatVndToUsd = (
  vndAmount: number,
  options: ConvertCurrencyOptions = {},
): string => {
  const {
    vndPerUsd = DEFAULT_VND_PER_USD,
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
    locale,
  } = options
  const usd = vndToUsdNumber(vndAmount, { vndPerUsd })
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(usd)
}

/** Locale aware: en => USD, else => VND (with ₫). Accept raw VND number. */
export const formatByLocale = (
  vndAmount: number,
  locale: string | undefined,
  opts: Omit<ConvertCurrencyOptions, 'locale'> = {},
): string => {
  // Normalize locale to handle 'en' or 'en-US' etc.
  const normalizedLocale = locale?.toLowerCase().trim()
  const isEnglish =
    normalizedLocale === 'en' || normalizedLocale?.startsWith('en-')

  if (!Number.isFinite(vndAmount) || vndAmount <= 0) {
    return isEnglish ? '$0' : '0 ₫'
  }

  if (isEnglish) {
    return formatVndToUsd(vndAmount, { ...opts, locale: 'en-US' })
  }

  // Vietnamese or other: show VND grouping with ₫ suffix
  // Use non-breaking space so number and symbol stay together
  return new Intl.NumberFormat('vi-VN').format(vndAmount) + '\u00A0₫'
}

export const formatSavingByLocale = (
  value: string | number | undefined,
  locale: string | undefined,
  opts: Omit<ConvertCurrencyOptions, 'locale'> = {},
): string => {
  if (!value) return ''
  const num =
    typeof value === 'number'
      ? value
      : parseInt(value.replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(num)) return ''
  return formatByLocale(num, locale, opts)
}

export const mapTranslationForPriceUnit = PRICE_UNIT_TRANSLATION_KEYS

/**
 * Format number to compact notation for chart display
 * Vietnamese: 1tr (triệu), 1ty (tỷ)
 * English: 1M (million), 1B (billion)
 */
export const formatCompactCurrency = (
  amount: number,
  locale: string | undefined,
  opts?: Omit<ConvertCurrencyOptions, 'locale'>,
): string => {
  if (!Number.isFinite(amount) || amount <= 0) return '0'

  const normalizedLocale = locale?.toLowerCase().trim()
  const isEnglish =
    normalizedLocale === 'en' || normalizedLocale?.startsWith('en-')

  const formatCompact = (
    value: number,
    units: { threshold: number; divisor: number; suffix: string }[],
    format: (n: number) => string,
  ): string => {
    for (const u of units) {
      if (value >= u.threshold) {
        const num = value / u.divisor
        return format(num) + u.suffix
      }
    }
    return String(Math.round(value))
  }

  if (!isEnglish) {
    // Vietnamese compact: ty (billion), tr (million), k (thousand)
    const vnUnits = [
      { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: 'ty' },
      { threshold: 1_000_000, divisor: 1_000_000, suffix: 'tr' },
      { threshold: 1_000, divisor: 1_000, suffix: 'k' },
    ]
    return formatCompact(amount, vnUnits, (n) =>
      n % 1 === 0 ? `${n}` : n.toFixed(1),
    )
  }

  // English compact: convert to USD first, then B/M/K with $ prefix
  const usdAmount = vndToUsdNumber(amount, opts)
  const enUnits = [
    { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, divisor: 1_000_000, suffix: 'M' },
    { threshold: 1_000, divisor: 1_000, suffix: 'K' },
  ]
  const result = formatCompact(
    usdAmount,
    enUnits,
    (n) => `$${n % 1 === 0 ? `${n}` : n.toFixed(1)}`,
  )
  // If below 1k, formatCompact returns rounded number without suffix; ensure it has $ prefix
  return result.includes('$') ? result : `$${result}`
}
