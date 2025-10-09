import { useTranslations } from 'next-intl'

// Simple static rate fallback; in real usage fetch from API and cache.
const DEFAULT_VND_PER_USD = 24000

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

/** React helper hook returning a formatter bound to current i18n locale and currency labels */
export const useCurrencyConversion = () => {
  const t = useTranslations('residentialFilter.currency')
  return {
    labelVnd: t('vnd'),
    labelUsd: t('usd'),
    vndToUsdNumber,
    formatVndToUsd: (
      vndAmount: number,
      options?: Omit<ConvertCurrencyOptions, 'locale'>,
    ) =>
      formatVndToUsd(vndAmount, {
        ...options,
      }),
  }
}

/**
 * Utility to produce a compact USD string like 1.2K USD from VND input.
 */
export const formatVndToUsdCompact = (
  vndAmount: number,
  options: ConvertCurrencyOptions = {},
): string => {
  const { locale, vndPerUsd = DEFAULT_VND_PER_USD } = options
  const usd = vndToUsdNumber(vndAmount, { vndPerUsd })
  const compact = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(usd)
  return `${compact} USD`
}

/**
 * Detect a VND formatted string (có chứa đ, ₫, VND hoặc số lớn > 10,000) và đổi sang USD formatted.
 * Nếu đầu vào là number coi như VND. Trả về chuỗi USD với ký hiệu $.
 */
export const formatCurrencyAuto = (
  input: number | string,
  options: Omit<ConvertCurrencyOptions, 'locale'> & { locale?: string } = {},
): string => {
  const {
    vndPerUsd = DEFAULT_VND_PER_USD,
    maximumFractionDigits = 2,
    minimumFractionDigits = 0,
    locale,
  } = options
  let numeric: number | null = null
  if (typeof input === 'number') {
    numeric = input
  } else if (typeof input === 'string') {
    const cleaned = input
      .replace(/[^0-9.,]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(/,/g, '')
    const parsed = Number.parseFloat(cleaned)
    if (Number.isFinite(parsed)) numeric = parsed
  }
  if (!numeric || numeric <= 0) return '$0'
  const usd = vndToUsdNumber(numeric, { vndPerUsd })
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(usd)
}

export const formatCurrencyAutoCompact = (
  input: number | string,
  options: Omit<ConvertCurrencyOptions, 'locale'> & { locale?: string } = {},
): string => {
  const { vndPerUsd = DEFAULT_VND_PER_USD, locale } = options
  let numeric: number | null = null
  if (typeof input === 'number') numeric = input
  else {
    const cleaned = input
      .replace(/[^0-9.,]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(/,/g, '')
    const parsed = Number.parseFloat(cleaned)
    if (Number.isFinite(parsed)) numeric = parsed
  }
  if (!numeric || numeric <= 0) return '0 USD'
  const usd = vndToUsdNumber(numeric, { vndPerUsd })
  const compact = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(usd)
  return `${compact} USD`
}

/** Locale aware: en => USD, else => VND (with ₫). Accept raw VND number. */
export const formatByLocale = (
  vndAmount: number,
  locale: string | undefined,
  opts: Omit<ConvertCurrencyOptions, 'locale'> = {},
): string => {
  if (!Number.isFinite(vndAmount) || vndAmount <= 0) {
    return locale?.startsWith('en') ? '$0' : '0 ₫'
  }
  if (locale?.startsWith('en')) {
    return formatVndToUsd(vndAmount, opts)
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
