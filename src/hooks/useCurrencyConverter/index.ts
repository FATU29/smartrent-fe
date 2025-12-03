import { useMemo } from 'react'
import { useExchangeRate } from '../useExchangeRate'
import {
  formatByLocale,
  formatCompactCurrency,
  formatVndToUsd,
  vndToUsdNumber,
  DEFAULT_VND_PER_USD,
  type ConvertCurrencyOptions,
} from '@/utils/currency/convert'

/**
 * Hook to get currency conversion functions with dynamic exchange rate
 * Automatically fetches and uses the latest exchange rate from API
 */
export const useCurrencyConverter = () => {
  const { data: exchangeRate, isLoading, error } = useExchangeRate()

  // Use exchange rate from API, fallback to default if not available
  const vndPerUsd = useMemo(
    () => exchangeRate?.vndPerUsd || DEFAULT_VND_PER_USD,
    [exchangeRate?.vndPerUsd],
  )

  // Memoized conversion functions with current exchange rate
  const converter = useMemo(
    () => ({
      /**
       * Convert VND to USD number
       */
      vndToUsdNumber: (vndAmount: number) =>
        vndToUsdNumber(vndAmount, { vndPerUsd }),

      /**
       * Format VND to USD string
       */
      formatVndToUsd: (
        vndAmount: number,
        options?: Omit<ConvertCurrencyOptions, 'vndPerUsd'>,
      ) => formatVndToUsd(vndAmount, { ...options, vndPerUsd }),

      /**
       * Format by locale (en => USD, else => VND)
       */
      formatByLocale: (
        vndAmount: number,
        locale: string | undefined,
        opts?: Omit<ConvertCurrencyOptions, 'locale' | 'vndPerUsd'>,
      ) => formatByLocale(vndAmount, locale, { ...opts, vndPerUsd }),

      /**
       * Format compact currency for charts
       */
      formatCompactCurrency: (amount: number, locale: string | undefined) =>
        formatCompactCurrency(amount, locale, { vndPerUsd }),

      /**
       * Current exchange rate being used
       */
      vndPerUsd,

      /**
       * Loading state
       */
      isLoading,

      /**
       * Error state
       */
      error,
    }),
    [vndPerUsd, isLoading, error],
  )

  return converter
}
