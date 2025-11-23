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
  if (!Number.isFinite(amount) || amount <= 0) {
    return '0'
  }

  const normalizedLocale = locale?.toLowerCase().trim()
  const isEnglish =
    normalizedLocale === 'en' || normalizedLocale?.startsWith('en-')

  // For Vietnamese: use tr (triệu = million) and ty (tỷ = billion)
  // 1 triệu = 1,000,000 VND
  // 1 tỷ = 1,000,000,000 VND
  if (!isEnglish) {
    if (amount >= 1000000000) {
      // Tỷ (billion)
      const ty = amount / 1000000000
      return ty % 1 === 0 ? `${ty}ty` : `${ty.toFixed(1)}ty`
    } else if (amount >= 1000000) {
      // Triệu (million)
      const tr = amount / 1000000
      return tr % 1 === 0 ? `${tr}tr` : `${tr.toFixed(1)}tr`
    } else if (amount >= 1000) {
      // Nghìn (thousand)
      const nghin = amount / 1000
      return nghin % 1 === 0 ? `${nghin}k` : `${nghin.toFixed(1)}k`
    }
    return amount.toString()
  }

  // For English: use M (million) and B (billion)
  // Convert VND to USD first for English
  const usdAmount = vndToUsdNumber(amount, opts)

  if (usdAmount >= 1000000000) {
    // Billion
    const b = usdAmount / 1000000000
    return b % 1 === 0 ? `$${b}B` : `$${b.toFixed(1)}B`
  } else if (usdAmount >= 1000000) {
    // Million
    const m = usdAmount / 1000000
    return m % 1 === 0 ? `$${m}M` : `$${m.toFixed(1)}M`
  } else if (usdAmount >= 1000) {
    // Thousand
    const k = usdAmount / 1000
    return k % 1 === 0 ? `$${k}K` : `$${k.toFixed(1)}K`
  }
  return `$${Math.round(usdAmount)}`
}
